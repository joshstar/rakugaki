<template>
	<div class="scoreboard">
		<div class="player" v-for="player in players" :key="player.id" :class="{bounce: recentVotes[player.id]}">
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
import { watch as vueWatch } from "vue"
import { state } from "@/game/state"
import drawSvg from "@/assets/icons/draw.svg"

export default {
	data() {
		return {
			drawSvg,
			stopWatch: () => {},
			recentVotes: {},
			oldPoints: {},
		}
	},
	computed: {
		players() {
			return state.players
		}
	},
	methods: {
		turn(player) {
			let turn = 0
			this.players.forEach(({ history }) => {
				turn += history.filter(({ creator }) => creator === player.id ).length
			})
			return turn
		},
		onVote() {
			this.players.forEach(player => {
				if (player.points > this.oldPoints[player.id]) {
					this.recentVotes[player.id] = true
					this.oldPoints[player.id] = player.points
					this.resetRecentVote(player.id)
				}
			})
		},
		async resetRecentVote(id) {
			await this.$nextTick()
			setTimeout(() => {
				this.recentVotes[id] = false
			}, 800)
		},
		getPlayerPoints() {
			const points = {}
			this.players.forEach(player => {
				points[player.id] = player.points
			})
			return points
		}
	},
	mounted() {
		this.oldPoints = this.getPlayerPoints()
		this.stopWatch = vueWatch(() => state.voteCount, this.onVote)
	},
	beforeUnmount() {
		this.stopWatch()
		clearTimeout(this.waitingTimeoutId)
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
	overflow: visible;

	@media only screen and (max-width: 900px) {
		position: static;
		margin-top: 100px;
	}
}

.player {
	align-items: center;
	display: grid;
	font-size: 1.6rem;
	gap: 20px;
	grid-template-columns: 34px auto;
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

.points {
	transition: color 0.3s ease;
}

.bounce {
	animation: bounce 0.7s;
	transform-origin: center bottom;

	.points {
		color: #33bc10;
		font-weight: 700;
	}
}

@keyframes bounce {
	from,
	20%,
	53%,
	to {
		animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
		transform: translate3d(0, 0, 0);
	}

	40%,
	43% {
		animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
		transform: translate3d(0, -20px, 0) scaleY(1.1);
	}

	70% {
		animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
		transform: translate3d(0, -8px, 0) scaleY(1.05);
	}

	80% {
		transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
		transform: translate3d(0, 0, 0) scaleY(0.95);
	}

	90% {
		transform: translate3d(0, -2px, 0) scaleY(1.02);
	}
}
</style>
