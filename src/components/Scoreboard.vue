<template>
	<div class="scoreboard">
		<div class="player" v-for="player in players" :key="player.id">
			<img class="avatar" :src="player.avatar" >
			<div>
				<div class="name">{{ player.name }}</div>
				<div class="info">
					<span class="turn">
						<icon :data="drawSvg" />
						{{ turn(player) }}
					</span>
					<span class="points">{{ player.points }} pts</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import _ from "lodash"
import { state } from "@/game/state"
import drawSvg from "@/assets/icons/draw.svg"

export default {
	data() {
		return {
			drawSvg
		}
	},
	computed: {
		players() {
			return state.players
		}
	},
	methods: {
		turn(player) {
			const lastTurn = _.last(player.history)
			if (!lastTurn) return 1
			return lastTurn.turn + 1
		}
	}
}
</script>

<style lang="scss" scoped>

.scoreboard {
	position: absolute;
	left: 40px;
	top: 140px;
	display: grid;
	gap: 26px;
	max-width: 250px;
	overflow: hidden;

	@media only screen and (max-width: 900px) {
		position: static;
		margin-top: 100px;
	}
}

.player {
	display: grid;
	font-size: 1.6rem;
	gap: 20px;
	grid-template-columns: 34px auto;
	align-items: center;
}

.name {
	font-weight: 600;
	text-overflow: ellipsis;
	overflow: hidden;
	margin-bottom: 8px;
}

.info {
	font-size: 1.4rem;
}

.turn {
	align-items: center;
	background: #9DB1C6;
	border-radius: 6px;
	color: #fff;
	display: inline-flex;
	font-size: 1.2rem;
	justify-content: center;
	line-height: 0;
	margin-right: 10px;
	padding: 1px 7px;
	vertical-align: top;

	svg {
		width: 10px;
		margin-right: 6px;
	}
}
</style>
