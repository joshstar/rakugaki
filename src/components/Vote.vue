<template>
	<div class="vote">
		<h1 class="voting" v-if="presenting">
			Vote for your favourite!
			<div>Reward your favourite creation with a point!</div>
		</h1>
		<h1 class="voting" v-else>
			Waiting for {{ presenter.name }} to vote for their favourite creation
		</h1>

		<div class="cards" :class="{voter: presenting}">
			<div class="card" v-for="card in cards" :key="card.id" @click="vote(card.creator)">
				<div class="board" v-if="card.type === 'draw'">
					<div class="board box">
						<img :src="card.data">
					</div>
				</div>
				<div class="describe box" v-else-if="card.type === 'describe'">
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
import { state, getPlayer } from "@/game/state"
import * as watch from "@/game/watch"

export default {
	computed: {
		cards() {
			return getPlayer(state.presenter).history
				.filter(({ type }) => type !== "card")
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
		vote(playerId) {
			if (!this.presenting) return
			if (playerId === state.presenter) {
				return window.alert("No voting for yourself")
			}
			watch.vote(playerId)
		},
	},
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

.vote {
	margin-top: 40px;
	min-width: 600px;
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

	> div {
		display: grid;
		justify-items: center;
	}

	&.voter > div {
		cursor: pointer;
		transition: transform 0.3s ease-in-out;

		&:hover {
			transform: translateY(-2px) scale(1.05);
		}
	}
}

.board {
	width: 300px;
	height: 300px;
	padding: 0;

	img {
		width: 300px;
		height: 300px;
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
}

</style>