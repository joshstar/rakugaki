<template>
	<div class="card-picker">
		<h1>Pick a card to draw</h1>
		<div class="cards">
			<div class="card" :class="color" v-for="(card, color) in cards" :key="card" @click="pick(card)">
				{{ card }}
			</div>
		</div>
	</div>
</template>

<script>
import * as play from "@/game/play"

export default {
	data() {
		return {
			loading: true,
			cards: []
		}
	},
	methods: {
		async fetchCards() {
			this.cards = await play.getCards()
		},
		pick(card) {
			this.$emit("picked", card)
		}
	},
	mounted() {
		this.fetchCards()
	}
}
</script>

<style lang="scss" scoped>

.cards {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 60px;
}

.card {
	align-items: center;
	background: #fff;
	border-radius: 6px;
	box-shadow: 0px 2px 6px rgba(29, 62, 94, 0.08), 0px 4px 20px rgba(29, 62, 94, 0.06);
	color: #000;
	cursor: pointer;
	display: flex;
	font-size: 2rem;
	height: 232px;
	justify-content: center;
	line-height: 27px;
	padding: 20px;
	text-align: center;
	width: 174px;
	transition: transform 0.3s ease-in-out;

	&:hover {
		transform: translateY(-2px) scale(1.05);
	}
}

.black {
	background: #29292E;
	color: #fff;
}

.pink {
	background: #E73289;
	box-shadow: 0px 1px 6px rgba(231, 50, 137, 0.4), 0px 4px 30px rgba(231, 50, 137, 0.3);
	color: #fff;
}

.yellow {
	background: #FBFF46;
	box-shadow: 0px 1px 6px rgba(250, 255, 31, 0.4), 0px 4px 30px rgba(250, 255, 31, 0.3);
}

</style>
