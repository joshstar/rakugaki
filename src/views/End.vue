<template>
	<div class="end">
		<h1>Thanks for playing!</h1>
		<div class="players results">
			<div class="player" v-for="(player, num) in players" :key="player.id" :class="[`place-${num}`]">
				<div class="place">#{{ num + 1 }}</div>
				<img class="avatar" :src="player.avatar">
				<div>
					<div class="name">{{ player.name }}</div>
					<div class="points">{{ player.points }} point{{ player.points !== 1 ? "s" : "" }}</div>
				</div>
			</div>
		</div>

		<div class="cards">
			<div class="card" v-for="card in cards" :key="card.id">
				<div class="board">
					<div class="board box">
						<img :src="card.data">
					</div>
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
import { orderBy, flatten } from "lodash"
import { state, getPlayer } from "@/game/state"

export default {
	computed: {
		players() {
			return orderBy(state.players, ["points"], ["desc"])
		},
		cards() {
			return flatten(state.roundHistory)
				.filter(card => card.type === "draw")
		},
	},
	methods: {
		getCreator(card) {
			return getPlayer(card.creator) || {}
		},
	},
}
</script>

<style lang="scss" scoped>

.end {
	margin-top: 40px;
	max-width: 800px;
	width: 100%;
	flex-direction: column;
	display: flex;
	align-items: center;
}

h1 {
	font-size: 2rem;
	margin-top: 0;

	@media only screen and (max-width: 900px) {
		margin-top: 80px;
	}
}

.results {
	display: grid;
	grid-template-columns: 200px 200px;
	gap: 10px 20px;
	justify-items: center;

	@media only screen and (max-width: 700px) {
		grid-template-columns: 1fr;
		gap: 20px;
	}

	.player {
		font-size: 1.8rem;
		grid-template-columns: 28px 28px auto;
		gap: 14px;

		.points {
			font-size: 1.4rem;
			color: var(--text-light);
		}

		&.place-0 {
			font-size: 2.3rem;
			.place {
				color: #29c9ff;
			}
		}

		@media only screen and (min-width: 700px) {
			&:nth-child(odd) {
				margin-bottom: 30px;
			}

			&:nth-child(even) {
				margin-top: 40px;
			}
		}
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
	gap: 40px;
	grid-template-columns: 1fr 1fr 1fr;
	margin-top: 80px;

	@media only screen and (max-width: 1000px) {
		grid-template-columns: 1fr 1fr;
	}

	@media only screen and (max-width: 700px) {
		grid-template-columns: 1fr;
	}

	> div {
		display: grid;
		justify-items: center;
	}
}

.board {
	max-width: 250px;
	max-height: 250px;
	padding: 0;

	img {
		width: 100%;
		height: 100%;
	}
}
</style>