<template>
	<div class="vote">
		<h1 class="voting" v-if="!voted">
			Vote for your favourite!
			<div>Reward your favourite creation with a point!</div>
		</h1>
		<h1 class="voting waiting" v-else>
			Waiting for all players to vote...
		</h1>

		<div class="cards" :class="{voter: !voted}">
			<div v-for="card in cards" :key="card.id" @click="vote(card)">
				<div class="board" v-if="card.type === 'draw'">
					<div class="board box">
						<img :src="card.data">
					</div>
				</div>
				<div class="describe box" v-else-if="card.type === 'describe'">
					{{ card.data }}
				</div>
				<div class="card" v-else-if="card.type === 'card'">
					{{ card.data }}
				</div>

				<div class="player" v-if="card.creator">
					<img class="avatar" :src="getCreator(card).avatar">
					{{ getCreator(card).name }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { watch as vueWatch } from "vue"
import { state, getPlayer } from "@/game/state"
import * as watch from "@/game/watch"

export default {
	data() {
		return {
			voted: false,
			stopWatch: () => {},
		}
	},
	computed: {
		cards() {
			const cards = getPlayer(state.presenter).history
			return cards.filter(card => card.type !== "prompts")
		},
		presenting() {
			return state.self === state.presenter
		},
		presenter() {
			return getPlayer(state.presenter)
		},
	},
	methods: {
		getCreator(card) {
			return getPlayer(card.creator) || {}
		},
		vote(card) {
			const playerId = card.creator
			if (this.voted) return
			if (card.type === "card") return
			if (playerId === state.self) {
				return window.alert("No voting for yourself")
			}
			this.voted = true
			watch.vote(playerId)
		},
		onVote() {
			if (!this.presenting) return
			if (state.voteCount === state.players.length) {
				watch.allVoted()
			}
		},
	},
	mounted() {
		this.stopWatch = vueWatch(() => state.voteCount, this.onVote)
	},
	beforeUnmount() {
		this.stopWatch()
	}
}
</script>

<style lang="scss" scoped>

h1 {
	font-size: 2rem;
	margin-top: 0;

	div {
		margin-top: 10px;
		font-size: 1.4rem;
		font-weight: 500;
	}
}

.waiting {
	margin-bottom: 10px;
}

.vote {
	margin-top: 40px;
	max-width: 640px;
	width: 100%;
	flex-direction: column;
	display: flex;
	align-items: center;

	@media only screen and (max-height: 1080px) {
		margin-top: 20px;
	}
}

.btn {
	&.hide {
		opacity: 0;
		pointer-events: none;
	}
}

.player {
	align-items: center;
	display: grid;
	font-size: 1.6rem;
	font-weight: 600;
	gap: 12px;
	grid-template-columns: 22px auto;
	margin-top: 18px;
}

.cards {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 40px;

	@media only screen and (max-width: 900px) {
		grid-template-columns: 1fr;
	}

	> div {
		display: grid;
		justify-items: center;
		align-items: center;
	}

	&.voter > div {
		cursor: pointer;
		transition: transform 0.3s ease-in-out;

		&:hover {
			transform: translateY(-2px) scale(1.05);
		}
	}
}

.card {
	align-items: center;
	background: #E73289;
	border-radius: 6px;
	box-shadow: 0px 1px 6px rgba(231, 50, 137, 0.3), 0px 4px 30px rgba(231, 50, 137, 0.2);
	color: #fff;
	cursor: default;
	display: flex;
	font-size: 2rem;
	height: 232px;
	justify-content: center;
	line-height: 27px;
	padding: 20px;
	text-align: center;
	user-select: none;
	width: 174px;

	&:hover {
		transform: scale(1) !important;
	}
}

.board {
	max-width: 300px;
	max-height: 300px;
	width: 100%;
	height: 100%;
	padding: 0;
	color-scheme: only light;

	img {
		border-radius: 8px;
		height: 100%;
		width: 100%;
	}
}

.describe {
	align-items: center;
	color: #000;
	display: flex;
	font-size: 1.6rem;
	height: 300px;
	justify-content: center;
	line-height: 27px;
	padding: 10px;
	text-align: center;
	width: 300px;
	word-break: break-word;
}

</style>