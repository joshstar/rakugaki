<template>
	<div class="countdown" v-if="seconds">
		<icon :data="icons.clockSvg" />
		{{ remaining }}
	</div>
</template>

<script>
import { state } from "@/game/state"
import clockSvg from "@/assets/icons/clock.svg"

export default {
	data() {
		return {
			seconds: 0,
			interval: null,
			icons: {
				clockSvg
			}
		}
	},
	computed: {
		remaining() {
			const minutes = Math.floor(this.seconds / 60)
			const seconds = this.seconds - minutes * 60
			return `0${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
		},
	},
	methods: {
		step() {
			if (1 > this.seconds) {
				this.stop()
				return this.$emit("trigger")
			}
			this.seconds--
			if (this.seconds === 10) {
				this.playCountdown()
			}
		},
		stop() {
			clearInterval(this.interval)
		},
		playCountdown() {
			const audio = new Audio("/audio/countdown.mp3");
			audio.volume = 0.2;
			audio.play();
		}
	},
	created() {
		if (!state.options.timeLimit) return
		this.seconds = state.options.timeLimit * 60
		this.interval = setInterval(this.step, 1000)
	},
	beforeUnmount() {
		this.seconds = 0
		this.stop()
	}
}
</script>

<style lang="scss" scoped>

.countdown {
	align-items: center;
	display: grid;
	font-size: 1.6rem;
	font-weight: 600;
	grid-template-columns: 24px 50px;
	justify-content: center;
	position: absolute;
	right: 18px;
	top: 70px;
	gap: 10px;

	svg {
		color: var(--text-light);
		opacity: 0.6;
		width: 24px;
		height: 24px;
		margin-top: -1px;
	}
}

</style>
