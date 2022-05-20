import { sampleSize, random } from "lodash"
import { state, pushHistory, getPlayer, hasExtraTurn } from "./state"
import { init } from "./event"
import router from "@/routes"

export function startGame() {
	init()
	router.replace("/play")
}

export async function getCards() {
	const customCards = state.options.customCards
	const decks = state.options.decks
	const amount = state.options.cardAmount

	if (customCards.length && !decks.length) {
		return sampleSize(customCards, amount)
	}

	const response = await fetch(`/api/cards?decks=${decks.join()}&amount=${amount}`)
	const { cards } = await response.json()

	if (!customCards.length) {
		return cards
	}

	const replacementCards = sampleSize(customCards, Math.floor(amount / 2))
	const useReplacementPercentage = customCards.length < 15 ? customCards.length : 30
	replacementCards.forEach((card, n) => {
		if (random(100) < useReplacementPercentage) {
			cards[n] = card
		}
	})

	return cards
}

export function submitPrompts(prompts) {
	pushHistory({
		type: "prompts",
		data: prompts,
		initiator: state.self
	})
}

export function pickCard(card) {
	pushHistory({
		type: "card",
		data: card,
		initiator: state.self
	})
}

export function submitDrawing(image, player) {
	pushHistory({
		type: "draw",
		data: image,
		initiator: player.id
	})
}

export function submitDescription(text, player) {
	pushHistory({
		type: "describe",
		data: text,
		initiator: player.id
	})
}

function getNextPlayer(turn) {
	const playOrder = state.options.playOrder
	const selfPosition = playOrder.findIndex(id => id === state.self)
	let nextTurnPlayer = (turn === -1 ? 1 : turn) + selfPosition

	// If we're doing an extra turn for odd players the player won't exist
	// in the play order so we'll manually set it to another player
	if (turn >= playOrder.length && playOrder[nextTurnPlayer] === undefined) {
		nextTurnPlayer = selfPosition + 1
	}

	if (nextTurnPlayer >= playOrder.length) {
		nextTurnPlayer = nextTurnPlayer - playOrder.length
	}

	return getPlayer(playOrder[nextTurnPlayer])
}

export function nextTurn() {
	if (state.turn === state.players.length && hasExtraTurn()) {
		console.log("Extra turn for even players")
	}
	else if (state.turn >= state.players.length) {
		state.stage = "watch"
		return router.replace("/watch")
	}

	const player = getNextPlayer(state.turn)
	const nextTurnHistory = player.history.find(({ turn }) => turn === state.turn)
	if (!nextTurnHistory) {
		throw "History not ready"
	}

	let type = nextTurnHistory.type === "draw" ? "describe" : "draw"
	if (nextTurnHistory.type === "prompts" && !promptsTurnComplete()) {
		type = "card"
	}

	state.turn = state.turn + 1
	return {
		...nextTurnHistory,
		player,
		creator: getPlayer(nextTurnHistory.creator),
		type
	}
}

function promptsTurnComplete() {
	const player = getNextPlayer(state.turn)
	return !!player.history.find(history => history && history.turn === state.turn && history.type === "card")
}