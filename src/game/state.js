import { shuffle, isEqual } from "lodash"
import { reactive } from 'vue'
import router from "@/routes"
import { isEven } from "@/util"
import { clearEventLog, disconnect } from "./pusher"
import * as event from "./event"

export const state = reactive({
	isConnected: false,
	joined: false,
	stage: "play",
	round: 1,
	turn: 0,
	watchPage: 0,
	voteCount: 0,
	self: null,
	presenter: null,
	players: [],
	roundHistory: [],
	options: {
		rounds: 1,
		playOrder: [],
		timeLimit: null,
		colors: false,
		decks: ["standard"],
		cardAmount: 4,
		customCards: [],
	},
})

export function setPlayers(self, players) {
	state.self = self.id
	state.players = players.map(player => ({
		...player,
		points: 0,
		history: []
	}))
}

export function setOptions(options = {}) {
	state.options = options
}

export function nextRound(push = false) {
	clearEventLog()
	cancelWaitingTimeout()

	if (push) {
		event.send("next-round", {})
	}
	if (state.round + 1 > state.options.rounds) {
		return endGame()
	}

	makeRoundHistory()
	state.players.forEach(player => player.history = [])
	state.round++
	state.turn = 0
	state.watchPage = 0
	state.presenter = null
	state.stage = "play"
	router.replace("/play")
}

function endGame() {
	makeRoundHistory()
	router.replace("/end")
}

function makeRoundHistory() {
	const histories = state.players.map(({ history }) => history)
	histories.forEach(history => state.roundHistory.push(history))
}

export function addHistory(history) {
	const player = getPlayer(history.initiator)
	player.history.push(history)
	return history
}

export function pushHistory(history) {
	event.send(
		"history",
		addHistory({
			...history,
			turn: state.turn,
			creator: state.self
		})
	)
}

export function setWatchPage({ page, presenter }) {
	state.watchPage = page
	state.presenter = presenter
	return { page, presenter }
}

export function pushWatchPage({ page, presenter }) {
	state.voteCount = 0
	event.send(
		"watch-page",
		setWatchPage({ page, presenter }),
		{
			log: page === "voting"
		}
	)
}

export function plusPoints({ playerId, presenterId }, push = false) {
	if (push) {
		event.send(
			"vote",
			{ playerId, presenterId }
		)
	}
	// If we've received a vote while we're still watching (not at voting yet)
	// its possible we've fallen behind so move us to voting manually
	else if (
		state.stage === "watch" &&
		state.watchPage !== "voting" &&
		presenterId === state.presenter
	) {
		state.watchPage = "voting"
	}

	getPlayer(playerId).points++
	state.voteCount++
}

let stateSyncData = {}
export function onSyncCheck({ player, data }) {
	// Only the host can trigger a resync
	const amHost = getPlayer(state.self).host
	if (!amHost) return

	stateSyncData[player] = data

	// We need all the players sync data to work out if a resync is required
	// Minus 1 as the host's data is not included in stateSyncData
	if (Object.keys(stateSyncData).length !== state.players.length - 1) {
		return
	}

	// Check to see if all the other players states have the 
	// history count as ours. If they don't trigger a resync
	const hostState = getStateSyncData()
	for (const player in stateSyncData) {
		if (isEqual(hostState, stateSyncData[player])) continue
		event.resync()
		break
	}
}

function stateSyncCheck() {
	const amHost = getPlayer(state.self).host
	if (amHost) return

	event.send(
		"sync-check",
		{
			player: state.self,
			data: getStateSyncData()
		},
		{ log: false }
	)
}

function getStateSyncData() {
	const stateSyncData = {}
	state.players.forEach(player => {
		stateSyncData[player.id] = [
			player.history.length,
			player.points
		]
	})
	return stateSyncData
}

let waitingTimeoutId = null
export function startWaitingTimeout() {
	if (waitingTimeoutId) return
	waitingTimeoutId = setTimeout(() => {
		stateSyncCheck()
		waitingTimeoutId = null
		startWaitingTimeout()
	}, 40000)
}

export function cancelWaitingTimeout() {
	resetStateSyncData()
	clearTimeout(waitingTimeoutId)
	waitingTimeoutId = null
}

function resetStateSyncData() {
	stateSyncData = {}
}

export function getPlayer(id) {
	return state.players.find((p) => p.id === id)
}

export function makePlayOrder(players) {
	const playerIds = players.map(({ id }) => id)
	return shuffle(playerIds)
}

export function hasExtraTurn() {
	return isEven(state.players.length) && state.players.length > 5
}

export function resetState() {
	clearEventLog()
	cancelWaitingTimeout()
	disconnect()
	state.isConnected = false
	state.joined = false
	state.stage = "play"
	state.round = 1
	state.turn = 0
	state.watchPage = 0
	state.voteCount = 0
	state.self = null
	state.presenter = null
	state.players = []
	state.roundHistory = []
	state.options = {
		rounds: 1,
		playOrder: [],
		timeLimit: null,
		colors: false,
		decks: ["standard"],
		cardAmount: 4,
		customCards: [],
	}
}

window.state = state