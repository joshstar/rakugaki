const decks = {
	black: require("../decks/black"),
	pink: require("../decks/pink"),
	yellow: require("../decks/yellow"),
	white: require("../decks/white"),
}

module.exports = async (req, res) => {
	const rand = (arr) => arr[arr.length * Math.random() | 0]
	res.send({
		black: rand(decks.black),
		pink: rand(decks.pink),
		yellow: rand(decks.yellow),
		white: rand(decks.white),
	})
}