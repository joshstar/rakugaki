import { sortBy, uniqBy } from "lodash"
import { nanoid } from "nanoid"
import { addHistory, setWatchPage, plusPoints, nextRound } from "./state" 
import * as pusher from "./pusher"

export function init() {
	pusher.onGameEvent(onEvent)
}

function onEvent(eventData) {
	const { event, data } = eventData
	if (event === "chunked") {
		return processChunkedEvent(eventData)
	}

	switch (event) {
		case "history":
			addHistory(data)
			break;
		
		case "watch-page":
			setWatchPage(data)
			break;

		case "plus-points":
			plusPoints(data)
			break;

		case "next-round":
			nextRound()
			break;

		default:
			console.log("Unknown event received", event, data)
			break;
	}
}

export function send(event, data, chunk = false) {
	if (chunk) {
		return sendChunked({ event, data })
	}
	pusher.sendGameEvent({
		eventId: `${event}-${nanoid()}`,
		event,
		data
	})
}

const chunkHistory = {}
function processChunkedEvent(eventData) {
	const { id, chunk, index, final } = eventData
	if (!chunkHistory[id]) {
		chunkHistory[id] = []
	}
	chunkHistory[id].push({ index, chunk })
	if (!final) return

	const chunks = _.sortBy(chunkHistory[id], ["index"]).map(c => c.chunk)
	onEvent(JSON.parse(chunks.join("")))
	chunkHistory[id] = []
}

async function sendChunked({ event, data }) {
	const base64 = data.data
	const dataStr = JSON.stringify({ event, data })

	const id = nanoid()
	const size = (base64.length * (3/4)) - (base64.endsWith("==") ? 2 : 1)
	const chunks = size / 5000
	const chunkSize = Math.floor(dataStr.length / chunks)
	for (var i = 0; i * chunkSize < dataStr.length; i++) {
		pusher.sendGameEvent({
			id,
			event: "chunked",
			index: i,
			chunk: dataStr.substr(i * chunkSize, chunkSize), 
			final: chunkSize * (i + 1) > dataStr.length
		})
		
		// Avoid rate limits
		if (i + 1 % 6) {
			await sleep(1000)
		}
	}
}

function sleep(duration) {
	return new Promise((resolve) => setTimeout(resolve, duration))
}