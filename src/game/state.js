import { shuffle, isEqual } from "lodash"
import { reactive } from 'vue'
import router from "@/routes"
import * as event from "./event"

export const state = reactive({
	stage: "play",
	round: 1,
	turn: 0,
	watchPage: 0,
	self: null,
	presenter: null,
	players: [],
	roundHistory: [],
	options: {
		rounds: 1,
		playOrder: [],
		timeLimit: null,
		colors: false
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
		}),
		history.type === "draw"
	)
}

export function setWatchPage({ page, presenter }) {
	state.watchPage = page
	state.presenter = presenter
	return { page, presenter }
}

export function pushWatchPage({ page, presenter }) {
	event.send(
		"watch-page",
		setWatchPage({ page, presenter })
	)
}

export function plusPoints({ playerId }, push = false) {
	if (push) {
		event.send(
			"plus-points",
			{ playerId }
		)
	}
	getPlayer(playerId).points++
}

export function getPlayer(id) {
	return state.players.find((p) => p.id === id)
}

export function makePlayOrder(players) {
	const playerIds = players.map(({ id }) => id)
	return shuffle(playerIds)
}

export function resetState() {
	state.stage = "play"
	state.round = 1
	state.turn = 0
	state.watchPage = 0
	state.self = null
	state.presenter = null
	state.players = []
	state.roundHistory = []
	state.options = {
		rounds: 1,
		playOrder: [],
		timeLimit: null
	}
}

window.state = state