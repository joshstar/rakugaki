<template>
	<create-player v-if="!self.id" @created="setSelf" :host="isHost" />
	<template v-else>
		<div class="lobby box">
			<div class="players">
				<div class="player" v-for="player in players" :key="player.id">
					<img class="avatar" :src="player.avatar" >
					{{ player.name }}
				</div>
			</div>

			<div class="options" v-if="self.host">
				<div class="btn option" @click="upRounds">
					{{ options.rounds }} Round{{ options.rounds > 1 ? "s" : ""}}
				</div>
				<div class="btn option" @click="upTimeLimit">
					{{ options.timeLimit ? `${ options.timeLimit } min` : "No time" }} limit
				</div>
				<div class="btn option" @click="toggleColors" :class="{colors: options.colors}">
					{{ options.colors ? "Colors" : "Just Black"}}
				</div>
			</div>

			<div class="btn wait-btn" v-if="starting">
				Game starting...
			</div>
			<div class="btn bold start-btn" @click="startGame" v-else-if="self.host">
				Start Game
			</div>
			<div class="btn wait-btn" v-else>
				Waiting for host to start the gane...
			</div>
		</div>

		<div class="invite-wrap" @click="copyUrl" v-if="inviteUrl">
			<h1>Invite your friends!</h1>
			<input class="box invite" :value="inviteUrl" readonly ref="invite">
		</div>

		<rules />
	</template>
</template>

<script>
import router from "@/routes"
import * as lobby from "@/game/lobby"
import CreatePlayer from "../components/CreatePlayer"
import Rules from "@/components/Rules"

export default {
	props: ["room"],
	components: {
		CreatePlayer,
		Rules
	},
	data() {
		return {
			inviteUrl: null,
			isHost: false,
			self: {},
			players: [],
			starting: false,
			options: {
				timeLimit: 0,
				rounds: 1,
				colors: false
			}
		}
	},
	methods: {
		onJoin() {
			lobby.players((players) => {
				this.players = players
			})
		},
		startGame() {
			if (process.env.NODE_ENV === "production") {
				if (this.players.length < 2) {
					return alert("Need more players!")
				}
				if (this.players.length < 4) {
					if (!confirm(
						`Are you sure you want to play with less than 4 players? It is not recommended`)
					) return
				}
			}

			lobby.startGame(this.options)
			this.startStage = "connecting"
		},
		setSelf(self) {
			this.self = self
			lobby.join(this.self, this.room, this.onJoin)
		},
		copyUrl() {
			this.$refs.invite.select()
			document.execCommand("copy")
		},
		upRounds() {
			this.options.rounds = this.options.rounds + 1
			if (this.options.rounds > 6) {
				this.options.rounds = 1
			}
		},
		upTimeLimit() {
			this.options.timeLimit = this.options.timeLimit + 1
			if (this.options.timeLimit > 5) {
				this.options.timeLimit = 0
			}
		},
		toggleColors() {
			this.options.colors = !this.options.colors
		}
	},
	beforeRouteLeave(to, from, next) {
		if (!this.isHost) return next()
		if (to.name === "Home" && from.name === "Lobby") {
			return next(
				confirm("Are you sure you want to leave? As the host the game cannot start without you")
			)
		}
		next()
	},
	created() {
		this.isHost = !!this.$route.query.host
		this.inviteUrl = `${window.location.origin}${this.$route.path}`
		router.replace("/lobby") // Hide lobby code from url

		if (this.isHost) {
			if (process.env.NODE_ENV === "production") {
				window.addEventListener("beforeunload", (e) => {
					e.preventDefault()
					e.returnValue = ""
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>

.lobby {
	max-width: 600px;
	width: 100%;
	font-weight: 600;

	@media only screen and (max-width: 650px) {
		padding: 50px 40px;
	}
}

.start-btn {
	margin-bottom: -80px;
	margin-left: 20px;
	margin-right: 20px;
}

.wait-btn {
	cursor: default;
	padding: 18px;
	border: none;
}

.players {
	display: grid;
	gap: 28px;
	margin-bottom: 50px;
}

.player {
	display: grid;
	font-size: 1.8rem;
	gap: 20px;
	grid-template-columns: 32px auto;
	align-items: center;
}

.avatar {
	width: 32px;
	height: 32px;
}

.options {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 24px;
	margin-bottom: 40px;

	@media only screen and (max-width: 500px) {
		grid-template-columns: repeat(2, 1fr);
	}
}

.option {
	align-items: center;
	font-size: 1.4rem;
	padding: 16px;
	transition: transform 0.2s, box-shadow 0.2s ease, color 0.2s ease;
}

.option.colors {
	background-image: linear-gradient(319deg, #663dff 0%, #aa00ff 37%, #cc4499 100%);
	border: none;
	color: #fff;
}

.invite-wrap {
	margin-top: 100px;
	text-align: center;
	width: 100%;

	h1 {
		padding-bottom: 20px;
		font-size: 2.2rem;
	}
}

.invite {
	border: none;
	color: var(--text-light);
	font-weight: 500;
	max-width: 500px;
	outline: none;
	padding: 22px;
	width: 100%;
}
</style>