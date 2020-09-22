const Pusher = require("pusher")

const pusher = new Pusher({
	appId: "",
	key: "",
	secret: "",
	cluster: "mt1",
})

module.exports = async (req, res) => {
	const socketId = req.body.socket_id
	const channel = req.body.channel_name
	const userId = req.headers["x-user-id"]
	const userName = req.headers["x-user-name"]
	const userAvatar = req.headers["x-user-avatar"]
	const isUserHost = parseInt(req.headers["x-user-host"])
	const presenceData = {
		user_id: userId,
		user_info: {
			name: userName,
			avatar: userAvatar,
			host: Boolean(isUserHost)
		}
	}
	const auth = pusher.authenticate(socketId, channel, presenceData)
	res.send(auth)
}