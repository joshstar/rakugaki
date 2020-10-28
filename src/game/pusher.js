import { orderBy } from "lodash"
import Pusher from 'pusher-js'
import { sleep } from "@/util"
import { state } from "./state"

let pusher = null,
	channel = null,
	eventLog = [],
	resentEventIndex = 0,
	connectionInfo = {},
	eventBindings = {}

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
		},
		enabledTransports: ["ws", "flash"],
		disabledTransports: ["flash", "sockjs", "xhr_streaming", "xhr_polling"]
	})
	channel = pusher.subscribe(`presence-${channelName}`)
	channel.bind("pusher:subscription_succeeded", () => {
		onReady()
		retryFailedEvents()
	})
	connectionInfo = {user, channelName}
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

function bindEvent(event, func) {
	channel.bind(event, func)

	// Add the event and function to the event
	// bindings object so we can use them to
	// reconnect the bindings in the event
	// of a manual reconnect
	eventBindings[event] = func
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
	bindEvent("client-start-game", func)
}

export function sendGameEvent(event, log = true) {
	triggerEvent("client-game-event", event, log)
}

export function onGameEvent(func) {
	bindEvent("client-game-event", func)
}

export function kickPlayer(player) {
	channel.trigger(`client-kick-player-${player}`, {})
}

export function onKicked(player, func) {
	bindEvent(`client-kick-player-${player}`, func)
}

export function sendGameInProgressEvent() {
	channel.trigger("client-game-in-progress", {})
}

export function onJoinWhileGameInProgress(func) {
	bindEvent("client-game-in-progress", func)
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
	bindEvent('pusher:member_added', func)
}

export function onPlayerLeave(func) {
	bindEvent('pusher:member_removed', func)
}

function isConnected() {
	return pusher.connection.state === "connected"
}

function rebindEvents() {
	for (const event in eventBindings) {
		const func = eventBindings[event]
		channel.bind(event, func)
	}
}

function onConnectionChange() {
	const onConnectionChange = () => state.isConnected = isConnected()
	pusher.connection.bind("connected", onConnectionChange)
	pusher.connection.bind("connecting", onConnectionChange)
	pusher.connection.bind("unavailable", onConnectionChange)
	pusher.connection.bind("failed", async () => {
		onConnectionChange()
		await sleep(5000)
		disconnect()
		connect(connectionInfo.user, connectionInfo.channelName, () => {
			rebindEvents()
		})
	})
}