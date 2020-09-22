<template>
	<div class="describe">
		<countdown @trigger="() => submit(true)" />
		<h1>Write a desciption of this </h1>
		<div class="board box">
			<img :src="drawing">
		</div>
		<div class="input-wrap">
			<input class="box input" type="text" v-model="text" placeholder="Your words here." ref="input" >
		</div>
		<div class="btn bold done" @click="submit">
			Done
		</div>
	</div>
</template>

<script>
import Countdown from "./Countdown"

export default {
	props: ["drawing"],
	components: {
		Countdown
	},
	data() {
		return {
			text: "",
			submitted: false
		}
	},
	methods: {
		submit(force = false) {
			if (this.submitted) return
			if (!this.text.trim() && !force) return
			this.submitted = true
			this.$emit("done", this.text)
		}
	},
	mounted() {
		this.$refs.input.focus()
	}
}
</script>


<style lang="scss" scoped>

.describe {
	align-items: center;
	display: flex;
	flex-direction: column;
}

.board {
	height: 90vw;
	max-height: 600px;
	max-width: 600px;
	padding: 0;
	width: 90vw;
}

.input-wrap {
	width: 100%;
	text-align: center;
}

.input {
	border: none;
	color: var(--text-light);
	font-weight: 500;
	margin-top: 30px;
	outline: none;
	padding: 22px;
	max-width: 500px;
	width: 100%;

	@media only screen and (max-height: 1080px) {
		margin-top: 20px;
	}
}

.btn.done {
	margin-top: 50px;
	width: 220px;

	@media only screen and (max-height: 1080px) {
		margin-top: 35px;
	}
}
</style>