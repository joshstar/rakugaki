import router from "@/routes"
import * as pusher from "./pusher"
import { state, setPlayers, setOptions, makePlayOrder } from "./state"
import { startGame as start } from "./play"

let self

export function join(player, room, onJoin) {
	if (!player.host && hasBeenKicked(room)) {
		return kicked(room)
	}

	self = player
	pusher.connect(self, room, () => {
		if (!self.host) {
			pusher.onGameStart(startGame)
			pusher.onJoinWhileGameInProgress(leaveGame)
			pusher.onKicked(self.id, () => kicked(room)) 
		}
		onJoin()
	})
}

export function startGame(options) {
	if (state.joined) return
	state.joined = true
	const players = pusher.getPlayers()
	if (self.host) {
		options = {
			playOrder: makePlayOrder(players),
			...options
		}

		pusher.startGame(options)
		pusher.onPlayerJoin(onJoinAfterGameStart)
	}

	setPlayers(self, players)
	setOptions(options)
	start()
}

export function players(callback) {
	pusher.onPlayerJoin(() => callback(pusher.getPlayers()))
	pusher.onPlayerLeave(() => callback(pusher.getPlayers()))
	callback(pusher.getPlayers(), true)
}

export function kickPlayer(playerId) {
	pusher.kickPlayer(playerId)
}

function onJoinAfterGameStart() {
	pusher.sendGameInProgressEvent()
}

function leaveGame() {
	if (state.joined) return
	router.replace("/")
	alert("Sorry! This game has already started.")
}

function kicked(lobby) {
	if (state.joined) return
	router.replace("/")
	alert("Sorry! You have been kicked from this lobby")
	localStorage.setItem(`kicked-${lobby}`, Date.now() + 86400000)
}

function hasBeenKicked(lobby) {
	const kickedTime = localStorage.getItem(`kicked-${lobby}`)
	return kickedTime && kickedTime > Date.now()
}