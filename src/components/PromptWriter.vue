<template>
	<div class="prompt-writer">
		<h1>
			Write a prompt for another player to draw 
			<br><span>({{prompts.length + 1}}/{{promptAmountNeeded}})</span>
		</h1>
		<div class="wrap">
			<textarea class="card pink" v-model="prompt" ref="input"></textarea>
		</div>

		<div class="wrap">
			<div class="btn bold done" @click="submit">
				Done
			</div>
		</div>
	</div>
</template>

<script>
import { state } from "@/game/state"

export default {
	data() {
		return {
			prompt: "",
			prompts: []
		}
	},
	computed: {
		promptAmountNeeded() {
			return state.options.cardAmount
		}
	},
	methods: {
		submit() {
			this.prompts.push(this.prompt)
			this.prompt = ""
			this.$refs.input.focus()
			if (this.prompts.length >= this.promptAmountNeeded) {
				this.$emit("done", this.prompts)
			}
		}
	},
	mounted() {
		this.$refs.input.focus()
	}
}
</script>

<style lang="scss" scoped>

h1 span {
	font-size: 1.4rem;
	opacity: 0.7;
}

.wrap {
	display: flex;
	justify-content: center;
	margin-bottom: 60px;
}

.card {
	align-items: center;
	background: #fff;
	border-radius: 6px;
	border: none;
	box-shadow: 0px 2px 6px rgba(29, 62, 94, 0.08), 0px 4px 20px rgba(29, 62, 94, 0.06);
	color: #000;
	display: flex;
	font-size: 2rem;
	font-weight: 500;
	height: 232px;
	justify-content: center;
	line-height: 27px;
	outline: none;
	padding: 20px;
	text-align: center;
	transition: transform 0.3s ease-in-out;
	width: 174px;

	&:hover {
		transform: translateY(-2px) scale(1.05);
	}

	@media only screen and (max-width: 500px) {
		width: 140px;
		height: 190px;
		font-size: 1.8rem;
	}
}

.pink {
	background: #E73289;
	box-shadow: 0px 1px 6px rgba(231, 50, 137, 0.4), 0px 4px 30px rgba(231, 50, 137, 0.3);
	color: #fff;
}

.btn {
	min-width: 250px;
	max-width: 300px;
}

</style>
