<template>
	<div class="create-player">
		<h1>Join Game</h1>
		<h2>Name</h2>
		<input class="box input" placeholder="Name" v-model="name" ref="input" />

		<h2>Avatar</h2>
		<div class="btn avatar-btn" ref="emojiPicker" @click="togglePicker">
			<img :src="avatar" />
		</div>

		<div class="btn bold join-btn" @click="create">
			Join
		</div>
	</div>
</template>

<script>
import { nanoid } from "nanoid"
import { EmojiButton } from "@joeattardi/emoji-button"

export default {
	props: ["host"],
	data() {
		return {
			name: "",
			avatar: "",
			isCreated: false,
			emojiPicker: null,
			defaultAvatars: [
				"1f60d",
				"1f637",
				"1f608",
				"1f4a9",
				"1f47a",
				"1f920",
				"1f385",
				"1f98a",
				"1f981",
				"1f42f",
				"1f43b",
				"1f346",
				"1f991",
				"1f383",
				"1f5ff"
			]
		}
	},
	methods: {
		create() {
			if (!this.name.trim() || this.isCreated) return
			this.isCreated = true
			this.rememberUser(this.name, this.avatar)
			this.$emit("created", {
				id: nanoid(),
				name: this.name.slice(0, 16),
				avatar: this.avatar,
				host: this.host,
			})
		},
		setAvatar(avatar) {
			this.avatar = avatar.url
		},
		setDefaultAvatar() {
			const rand = (arr) => arr[arr.length * Math.random() | 0]
			const avatar = rand(this.defaultAvatars)
			this.setAvatar({
				url: `https://twemoji.maxcdn.com/v/13.0.0/svg/${avatar}.svg`
			})
		},
		togglePicker() {
			this.emojiPicker.togglePicker(this.$refs.emojiPicker)
		},
		rememberUser(name, avatar) {
			localStorage.setItem("name", name)
			localStorage.setItem("avatar", avatar)
		},
		getStoredUser() {
			const name = localStorage.getItem("name")
			const avatar = localStorage.getItem("avatar")
			if (name) this.name = name
			if (avatar) this.avatar = avatar
		}
	},
	mounted() {
		this.setDefaultAvatar()
		this.getStoredUser()
		this.emojiPicker = new EmojiButton({
			showPreview: false,
			showRecents: false,
			style: "twemoji",
			position: "bottom",
		})
		this.emojiPicker.on("emoji", this.setAvatar)
		this.$refs.input.focus()
	},
	unmounted() {
		try {
			this.emojiPicker.destroyPicker()
		} catch (e) {e}
	}
}
</script>

<style lang="scss" scoped>

.create-player {
	flex-direction: column;
	display: flex;
	align-items: center;
}

h2 {
	font-size: 1.8rem;
	font-weight: 600;
	padding: 0;
	margin: 0;
	text-align: left;
	width: 100%;
}

.input {
	border: none;
	color: var(--text-light);
	font-weight: 500;
	margin-top: 30px;
	outline: none;
	padding: 22px;
	width: 300px;
	margin-top: 15px;
	margin-bottom: 40px;
}

.avatar-btn {
	background: #fff;
	box-shadow: 0px 2px 6px rgba(29, 62, 94, 0.08), 0px 4px 20px rgba(29, 62, 94, 0.06);
	height: 100px;
	margin-top: 15px;
	transition: transform 0.3s ease-in-out;
	width: 100px;
	border: none;

	img {
		width: 60px;
	}

	&:hover {
		transform: translateY(-1px) scale(1.03);
	}
}

.join-btn {
	margin-top: 70px;
	width: 180px;
}
</style>
