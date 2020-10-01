<template>
	<create-player v-if="!self.id" @created="setSelf" :host="isHost" />
	<template v-else>
		<div class="lobby box">
			<div class="players">
				<div class="player" v-for="player in lobbyPlayers" :key="player.id">
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
				<div class="btn option" @click="upCardAmount">
					{{ options.cardAmount }} Phrase Card{{ options.cardAmount > 1 ? "s" : ""}}
				</div>
				<div class="dropdown-wrap">
					<div class="btn option dropdown-toggle" @click="toggleDeckDropdown">
						{{ options.decks.length }} Deck{{ options.decks.length !== 1 ? "s" : ""}}
					</div>
					<div class="btn dropdown" v-if="editingDecks">
						<div class="item" v-for="deck in decks" :key="deck" @click="toggleDeck(deck)" :class="{active: isDeckActive(deck)}">
							{{ deck }}
						</div>
					</div>
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
import { state } from "@/game/state"

export default {
	props: ["room"],
	components: {
		CreatePlayer,
		Rules
	},
	data() {
		return {
			roomCode: null,
			inviteUrl: null,
			isHost: false,
			self: {},
			players: [],
			starting: false,
			editingDecks: false,
			decks: ["Standard", "NSFW", "Weeb", "Simple"],
			options: {
				timeLimit: 0,
				rounds: 1,
				colors: false,
				cardAmount: 4,
				decks: ["standard"],
			}
		}
	},
	computed: {
		lobbyPlayers() {
			return this.players[0] ? this.players : [this.self]
		}
	},
	methods: {
		onJoin() {
			lobby.players((players) => {
				this.players = players
			})
		},
		startGame() {
			if (!state.isConnected) {
				return alert("Connot start game while connecting, please wait...")
			}

			if (!this.options.decks.length) {
				return alert("Must select at least 1 deck")
			}

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
			lobby.join(this.self, this.roomCode, this.onJoin)
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
		upCardAmount() {
			this.options.cardAmount = this.options.cardAmount + 1
			if (this.options.cardAmount > 6) {
				this.options.cardAmount = 1
			}
		},
		toggleColors() {
			this.options.colors = !this.options.colors
		},
		toggleDeckDropdown() {
			this.editingDecks = !this.editingDecks
		},
		toggleDeck(deck) {
			if (this.isDeckActive(deck)) {
				return this.options.decks = this.options.decks.filter(d => d !== deck.toLowerCase())
			}
			this.options.decks.push(deck.toLowerCase())
		},
		isDeckActive(deck) {
			return this.options.decks.includes(deck.toLowerCase())
		},
		onBodyClick(event) {
			if (event.target.className.includes("dropdown-toggle") || event.target.className.includes("item")) return
			if (this.editingDecks) this.toggleDeckDropdown()
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
		this.roomCode = this.room
		this.inviteUrl = `${window.location.origin}${this.$route.path}`
		router.replace("/lobby") // Hide room code from url

		if (this.isHost) {
			if (process.env.NODE_ENV === "production") {
				window.addEventListener("beforeunload", (e) => {
					e.preventDefault()
					e.returnValue = ""
				})
			}
			document.body.addEventListener("click", this.onBodyClick)
		}
	},
	beforeUnmount() {
		try {
			document.body.removeEventListener("click", this.onBodyClick)
		} catch (e) {e}
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

.dropdown-wrap {
	position: relative;
}

.dropdown {
	background: var(--foreground);
	display: flex;
	padding: 11px 10px;
	flex-direction: column;
	margin-top: 8px;
	position: absolute;
	width: 100%;
	z-index: 20;
	
	.item {
		background: var(--foreground);
		border-radius: 4px;
		font-size: 1.2rem;
		font-weight: 500;
		padding: 9px;
		text-align: left;
		transition: background-color 0.2s ease, color 0.2s ease;

		&:hover {
			background: var(--background);
		}
	}

	.active {
		color: var(--accent);
		font-weight: 600;
	}
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