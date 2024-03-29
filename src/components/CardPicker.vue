<template>
	<div class="card-picker">
		<h1>Pick a card to draw</h1>
		<div class="loading" v-if="!cards.length">
			Loading cards...
		</div>
		<div class="cards" :class="{'more-cards': cards.length > 4}" v-else>
			<div class="card" :class="getColor(index)" v-for="(card, index) in cards" :key="index" @click="pick(card)">
				{{ card }}
			</div>
		</div>
	</div>
</template>

<script>
import * as play from "@/game/play"
import { state } from "@/game/state"

export default {
	props: ["prompts"],
	data() {
		return {
			cards: []
		}
	},
	methods: {
		async fetchCards() {
			this.cards = await play.getCards()
		},
		getColor(i) {
			const colors = ["pink", "black", "yellow", "white", "green", "purple"]
			return colors[i % colors.length]
		},
		pick(card) {
			this.$emit("picked", card)
		}
	},
	mounted() {
		if (state.options.mode === "prompt" && this.prompts) {
			this.cards = this.prompts
		} else {
			this.fetchCards()
		}
	}
}
</script>

<style lang="scss" scoped>

.loading {
	color: var(--text-light);
	margin-top: 60px;
	text-align: center;
}

.cards {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 60px;

	@media only screen and (min-width: 900px) {
		&.more-cards {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	@media only screen and (max-width: 900px) {
		gap: 40px;
	}

	@media only screen and (max-width: 500px) {
		grid-template-columns: repeat(auto-fill, 140px);
		justify-content: center;
		gap: 25px;
		width: calc(100vw - 30px);

		&.more-cards {
			grid-template-columns: 1fr;
		}
	}
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

	@media only screen and (max-width: 500px) {
		width: 140px;
		height: 190px;
		font-size: 1.8rem;
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

.green {
	background: #32e78c;
	box-shadow: 0px 1px 6px rgba(50, 231, 120, 0.4), 0px 4px 30px rgba(50, 231, 90, 0.3);
}

.purple {
	background: #5f43ea;
	box-shadow: 0px 1px 6px rgba(92, 50, 231, 0.4), 0px 4px 30px rgba(62, 50, 231 ,0.3);
	color: #fff;
}

.yellow {
	background: #FBFF46;
	box-shadow: 0px 1px 6px rgba(250, 255, 31, 0.4), 0px 4px 30px rgba(250, 255, 31, 0.3);
}

</style>
