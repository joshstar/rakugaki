import { last } from "lodash"
import { state, getPlayer, pushWatchPage, plusPoints, nextRound } from "./state"

export function allPlayersFinished() {
	const totalTurns = state.players.length
	const hasPlayedLastTurn = ({turn}) => turn === totalTurns
	return !state.players.every(({ history }) => history.find(hasPlayedLastTurn))
}

export function getNextPresenter() {
	const playOrder = state.options.playOrder
	if (!state.presenter) {
		return playOrder[0]
	}
	const presenterIndex = playOrder.findIndex(id => id === state.presenter) + 1
	return playOrder[presenterIndex] || null
}

export function getPage(playerId, page) {
	const player = getPlayer(playerId)
	return player.history.find(({ turn }) => turn === page)
}

export function nextPage() {
	let page = state.watchPage + 1
	if (page > state.players.length) {
		page = "voting"
	}
	pushWatchPage({
		page,
		presenter: state.presenter
	})
}

export function prevPage() {
	if (state.watchPage === 0) return
	pushWatchPage({
		page: state.watchPage - 1,
		presenter: state.presenter
	})
}

export function vote(playerId) {
	plusPoints({ playerId }, true)
	checkForExactMatch()
	const presenter = getNextPresenter()
	if (!presenter) {
		return nextRound(true)
	}
	pushWatchPage({
		page: 0,
		presenter
	})
}

function checkForExactMatch() {
	const self = getPlayer(state.self)
	const lastCard = last(self.history)
	if (lastCard.type !== "describe") return
	if (self.history[0].data.toLowerCase() === lastCard.data.toLowerCase()) {
		plusPoints({ playerId: state.self }, true)
	}
}