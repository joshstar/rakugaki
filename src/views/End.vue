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
import _ from "lodash"
import { state, getPlayer } from "@/game/state"

export default {
	computed: {
		players() {
			return _.orderBy(state.players, ["points"], ["desc"])
		},
		cards() {
			return _.flatten(state.roundHistory)
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

h1 {
	font-size: 2rem;
	margin-top: 0;
}

.end {
	margin-top: 40px;
	min-width: 600px;
	flex-direction: column;
	display: flex;
	align-items: center;
}

.results {
	display: grid;
	grid-template-columns: 200px 200px;
	gap: 10px 20px;
	justify-items: center;

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

		&:nth-child(odd) {
			margin-bottom: 30px;
		}

		&:nth-child(even) {
			margin-top: 40px;
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

	> div {
		display: grid;
		justify-items: center;
	}
}

.board {
	width: 250px;
	height: 250px;
	padding: 0;

	img {
		width: 250px;
		height: 250px;
	}
}
</style>