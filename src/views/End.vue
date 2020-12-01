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

		<div class="rounds">
			<div class="cards" v-for="(cards, key) in rounds" :key="key">
				<div v-for="card in cards" :key="card.id">
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
	</div>
</template>

<script>
import { orderBy } from "lodash"
import { state, getPlayer } from "@/game/state"

export default {
	computed: {
		players() {
			return orderBy(state.players, ["points"], ["desc"])
		},
		rounds() {
			return state.roundHistory
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
	margin-bottom: 80px;

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
	border-bottom: solid 1px var(--border);
	display: grid;
	gap: 40px;
	grid-template-columns: 1fr 1fr 1fr;
	margin-bottom: 40px;
	padding-bottom: 45px;

	@media only screen and (max-width: 1000px) {
		grid-template-columns: 1fr 1fr;
	}

	@media only screen and (max-width: 700px) {
		grid-template-columns: 1fr;
	}

	> div {
		display: grid;
		justify-items: center;
		align-items: center;
	}

	&:last-of-type {
		border: none;
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
}

.board {
	max-width: 250px;
	max-height: 250px;
	padding: 0;

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
	font-size: 1.5rem;
	height: 240px;
	justify-content: center;
	line-height: 27px;
	padding: 10px;
	text-align: center;
	width: 240px;
	word-break: break-word;
	overflow: auto;
}
</style>