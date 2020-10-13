import { orderBy } from "lodash"
import Pusher from 'pusher-js'
import { sleep } from "@/util"
import { state } from "./state"

let pusher = null,
	channel = null,
	eventLog = [],
	resentEventIndex = 0

export function connect(user, channelName, onReady) {
	pusher = new Pusher("", {
		cluster: "mt1",
		authEndpoint: "/api/auth",
		auth: {
			headers: {
				"X-USER-ID": user.id,
				"X-USER-NAME": user.name,
				"X-USER-AVATAR": user.avatar,
				"X-USER-HOST": Number(user.host)
			} 
		}
	})
	channel = pusher.subscribe(`presence-${channelName}`)
	channel.bind("pusher:subscription_succeeded", () => {
		onReady()
		retryFailedEvents()
	})
	onConnectionChange()
	onResync()
}

function triggerEvent(trigger, data, log = true) {
	const connected = isConnected()
	if (log) {
		eventLog.push({ trigger, data, isConnected: connected })
	}
	if (connected) {
		channel.trigger(trigger, data)
	}
}

async function triggerBulkEvents(events) {
	let i = 0
	for (const { trigger, data } of events) {
		channel.trigger(trigger, data)

		// Avoid rate limits
		if (i + 1 % 6) {
			await sleep(1000)
		}
		i++
	}
	return i
}

async function retryFailedEvents() {
	if (!isConnected()) return
	const eventsToRetry = eventLog.slice(resentEventIndex)
	const eventsSent = await triggerBulkEvents(eventsToRetry)
	resentEventIndex = resentEventIndex + eventsSent
}

export function startGame(options) {
	triggerEvent("client-start-game", options)
}

export function onGameStart(func) {
	channel.bind("client-start-game", func)
}

export function sendGameEvent(event, log = true) {
	triggerEvent("client-game-event", event, log)
}

export function onGameEvent(func) {
	channel.bind("client-game-event", func)
}

export function sendResyncEvent() {
	channel.trigger("client-resync", {})
}

function onResync() {
	channel.bind("client-resync", () => {
		triggerBulkEvents(eventLog)
	})
}

export function hostResync() {
	triggerBulkEvents(eventLog)
}

export async function retryVotes() {
	if (!isConnected()) return
	const eventsToRetry = eventLog.filter(e => e.data && e.data.event === "plus-points")
	await triggerBulkEvents(eventsToRetry)
}

export function clearEventLog() {
	eventLog = []
	resentEventIndex = 0
}

export function disconnect() {
	try {
		pusher.disconnect()
	} catch (e) {e}
}

export function playerCount() {
	return channel.members.count
}

export function getPlayers() {
	const players = []
	channel.members.each(({ id, info }) => players.push({
		id,
		name: info.name,
		avatar: info.avatar,
		host: info.host
	}))
	return orderBy(players, ["host", "id"], ["desc", "asc"])
}

export function onPlayerJoin(func) {
	channel.bind('pusher:member_added', func)
}

export function onPlayerLeave(func) {
	channel.bind('pusher:member_removed', func)
}

function isConnected() {
	return pusher.connection.state === "connected"
}

function onConnectionChange() {
	const onConnectionChange = () => state.isConnected = isConnected()
	pusher.connection.bind("connected", onConnectionChange)
	pusher.connection.bind("connecting", onConnectionChange)
	pusher.connection.bind("unavailable", onConnectionChange)
	pusher.connection.bind("failed", onConnectionChange)
}