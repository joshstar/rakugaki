<template>
	<div class="play">
		<div class="waiting" v-if="waiting">
			<h1>（；￣д￣）</h1>
			<div>
				Waiting for other players to finish their creations...
			</div>
		</div>
		<div v-else>
			<div class="player" v-if="turn.creator && turn.creator.name && turn.creator.id !== self">
				<img class="avatar" :src="turn.creator.avatar">
				{{ turn.creator.name }}
			</div>
			<card-picker v-if="turn.type === 'card'" @picked="pickCard" />
			<drawing-board v-else-if="turn.type === 'draw'" :description="turn.data" @done="saveDrawing" />
			<description v-else-if="turn.type === 'describe'" :drawing="turn.data" @done="saveDescription" />
		</div>
		<scoreboard />
	</div>
</template>

<script>
import { watch } from "vue"
import { state, startWaitingTimeout, cancelWaitingTimeout } from "@/game/state"
import * as play from "@/game/play"
import CardPicker from "@/components/CardPicker"
import DrawingBoard from "@/components/DrawingBoard"
import Description from "@/components/Description"
import Scoreboard from "@/components/Scoreboard"

export default {
	components: {
		CardPicker,
		DrawingBoard,
		Description,
		Scoreboard
	},
	data() {
		return {
			loading: false,
			waiting: false,
			turn: {
				type: "card",
				data: null,
				player: {},
				creator: {}
			},
			stopWatch: () => {}
		}
	},
	computed: {
		self() {
			return state.self
		}
	},
	methods: {
		nextTurn() {
			try {
				cancelWaitingTimeout()
				this.turn = play.nextTurn()
				this.waiting = false
			} catch (err) {
				this.waiting = true
				startWaitingTimeout()
			}
		},
		pickCard(card) {
			play.pickCard(card)
			this.nextTurn()
		},
		saveDrawing(image) {
			play.submitDrawing(image, this.turn.player)
			this.nextTurn()
		},
		saveDescription(text) {
			play.submitDescription(text, this.turn.player)
			this.nextTurn()
		},
		onEvent() {
			if (this.waiting) {
				this.nextTurn()
			}
		}
	},
	mounted() {
		this.stopWatch = watch(state.players, this.onEvent)
		if (process.env.NODE_ENV === "production") {
			window.addEventListener("beforeunload", (e) => {
				e.preventDefault()
				e.returnValue = ""
			})
		}
	},
	beforeUnmount() {
		this.stopWatch()
	}
}
</script>

<style lang="scss" scoped>

.play {
	margin-top: 80px;

	@media only screen and (max-height: 1080px) {
		margin-top: 40px;
	}
}

.player {
	align-items: center;
	display: grid;
	font-size: 1.6rem;
	font-weight: 600;
	gap: 12px;
	grid-template-columns: 26px auto;
	position: absolute;
	right: 20px;
	top: 20px;
}

</style>