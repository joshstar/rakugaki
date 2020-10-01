const decks = {
	standard: require("../decks/standard"),
	nsfw: require("../decks/nsfw"),
	simple: require("../decks/simple"),
	weeb: require("../decks/weeb"),
}

const rand = (arr) => arr[arr.length * Math.random() | 0]
const clamp = (number, min, max) => Math.max(min, Math.min(number, max));

module.exports = (req, res) => {
	const amount = clamp(Number(req.query.amount) || 1, 1, 10)
	const deckKeys = (req.query.decks || "standard").split(",")
	const cards = [].concat(
		...deckKeys.map(key => decks[key])
	)

	const randomCards = []
	for (let i = 0; i < amount; i++) {
		const card = rand(cards)
		if (randomCards.includes(card)) {
			i--
			continue
		}
		randomCards.push(card)
	}

	res.send({ cards: randomCards })
}