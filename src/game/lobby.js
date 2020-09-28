import * as pusher from "./pusher"
import { setPlayers, setOptions, makePlayOrder } from "./state"
import { startGame as start } from "./play"

let self

export function join(player, room, onJoin) {
	self = player
	pusher.connect(self, room, () => {
		if (!self.host) {
			pusher.onGameStart(startGame)
		}
		onJoin()
	})
}

export function startGame(options) {
	const players = pusher.getPlayers()
	if (self.host) {
		options = {
			playOrder: makePlayOrder(players),
			...options
		}

		pusher.startGame(options)
	}

	setPlayers(self, players)
	setOptions(options)
	start()
}

export const players = (callback) => {
	pusher.onPlayerJoin(() => callback(pusher.getPlayers()))
	pusher.onPlayerLeave(() => callback(pusher.getPlayers()))
	callback(pusher.getPlayers())
}