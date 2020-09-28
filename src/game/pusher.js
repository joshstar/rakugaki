import { orderBy } from "lodash"
import Pusher from 'pusher-js'
import { state } from "./state"

let pusher = null,
	channel = null

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
	channel.bind("pusher:subscription_succeeded", onReady)
	onConnectionChange()
}

export function startGame(options) {
	channel.trigger("client-start-game", options)
}

export function onGameStart(func) {
	channel.bind("client-start-game", func)
}

export function onGameEvent(func) {
	channel.bind("client-game-event", func)
}

export function sendGameEvent(event) {
	channel.trigger("client-game-event", event)
}

export function disconnect() {
	pusher.disconnect()
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
}function isConnected() {
	return pusher.connection.state === "connected"
}

function onConnectionChange() {
	const onConnectionChange = () => state.isConnected = isConnected()
	pusher.connection.bind("connected", onConnectionChange)
	pusher.connection.bind("connecting", onConnectionChange)
	pusher.connection.bind("unavailable", onConnectionChange)
	pusher.connection.bind("failed", onConnectionChange)
}

