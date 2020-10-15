import { sampleSize, random } from "lodash"
import { state, pushHistory, getPlayer } from "./state"
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
	let nextTurnPlayer = turn + selfPosition
	if (nextTurnPlayer >= playOrder.length) {
		nextTurnPlayer = nextTurnPlayer - playOrder.length
	}
	return getPlayer(playOrder[nextTurnPlayer])
}

export function nextTurn() {
	if (state.turn === state.players.length) {
		state.stage = "watch"
		return router.replace("/watch")
	}

	const player = getNextPlayer(state.turn)
	const nextTurnHistory = player.history.find(({ turn }) => turn === state.turn)
	if (!nextTurnHistory) {
		throw "History not ready"
	}

	state.turn = state.turn + 1
	return {
		...nextTurnHistory,
		player,
		creator: getPlayer(nextTurnHistory.creator),
		type: nextTurnHistory.type === "draw" ? "describe" : "draw"
	}
}