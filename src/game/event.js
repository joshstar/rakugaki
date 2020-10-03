import { nanoid } from "nanoid"
import { addHistory, setWatchPage, plusPoints, nextRound, onSyncCheck } from "./state" 
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

		case "sync-check":
			onSyncCheck(data)
			break;

		default:
			console.log("Unknown event received", eventData)
			break;
	}
}

export function send(event, data, options = {log: true}) {
	const payload = {
		eventId: `${event}-${nanoid()}`,
		event,
		data
	}

	pusher.sendGameEvent(payload, options.log)
}

export function resync() {
	// Request all other players do a resync
	pusher.sendResyncEvent()
	// Manually call onResync for the host
	pusher.hostResync()
}