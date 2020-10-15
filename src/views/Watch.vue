<template>
	<div class="watch">
		<div class="waiting" v-if="waiting">
			<h1>(◕︿◕✿)</h1>
			<div>
				Waiting for all players to finish their creations...
			</div>
		</div>
		<vote v-else-if="page.type === 'voting'" />
		<template v-else>
			<div class="player" v-if="creator">
				<img class="avatar" :src="creator.avatar">
				{{ creator.name }} {{ creatorVerb }}
			</div>

			<div class="card" v-if="page.type === 'card'">
				{{ page.data }}
			</div>
			<div class="board" v-else-if="page.type === 'draw'">
				<div class="board box">
					<img :src="page.data">
				</div>
			</div>
			<div class="describe card" v-else-if="page.type === 'describe'">
				{{ page.data }}
			</div>

			<div class="presenter-controls" v-if="presenting">
				<div class="btn bold" @click="prev" :class="{hide: page.turn === 0}">
					<icon :data="icons.leftSvg" />
				</div>
				<div class="btn bold" @click="next" v-if="page.turn !== lastPage">
					<icon :data="icons.rightSvg" />
				</div>
				<div class="btn bold vote-btn" @click="next" v-else>
					Vote
				</div>
			</div>

			<h1 class="presenting" v-if="presenting">
				You are presenting!
				<div>
					The other players can what you are looking at. <br>
					Walk them through the jouney your original card went on!
				</div>
			</h1>
			<h1 class="watching" v-else-if="presenter">
				Watching <img class="avatar" :src="presenter.avatar"> {{ presenter.name }} present their cards
			</h1>
		</template>
		<scoreboard />
	</div>
</template>

<script>
import { watch as vueWatch } from "vue"
import { state, getPlayer, startWaitingTimeout, cancelWaitingTimeout } from "@/game/state"
import * as watch from "@/game/watch"
import Scoreboard from "@/components/Scoreboard"
import Vote from "@/components/Vote"
import leftSvg from "@/assets/icons/left.svg"
import rightSvg from "@/assets/icons/right.svg"

export default {
	components: {
		Scoreboard,
		Vote
	},
	data() {
		return {
			waiting: true,
			stopWatch: [],
			icons: {
				leftSvg,
				rightSvg
			}
		}
	},
	computed: {
		presenting() {
			return state.self === state.presenter
		},
		presenter() {
			return getPlayer(state.presenter)
		},
		creator() {
			return getPlayer(this.page.creator)
		},
		page() {
			if (!state.presenter) return {}
			if (state.watchPage === "voting") return { type: 'voting' }
			return watch.getPage(state.presenter, state.watchPage) || {}
		},
		creatorVerb() {
			const verbs = {
				card: "picked",
				draw: "drew",
				describe: "wrote"
			}
			return verbs[this.page.type]
		},
		lastPage() {
			return state.players.length
		},
	},
	methods: {
		next() {
			watch.nextPage()
		},
		prev() {
			watch.prevPage()
		},
		setNextPresenter() {
			state.presenter = watch.getNextPresenter()
		},
		onEvent() {
			this.waiting = watch.allPlayersFinished()
			cancelWaitingTimeout()
			startWaitingTimeout()
		},
	},
	mounted() {
		this.setNextPresenter()
		this.waiting = watch.allPlayersFinished()
		this.stopWatch.push(vueWatch(state.players, this.onEvent))
		this.stopWatch.push(vueWatch(() => state.watchPage, this.onEvent))
	},
	beforeUnmount() {
		this.stopWatch.map(s => s())
		cancelWaitingTimeout()
	}
}
</script>

<style lang="scss" scoped>

h1 {
	font-size: 2.2rem;
	margin-top: 50px;
	max-width: 80vw;

	@media only screen and (max-height: 1080px) {
		margin-top: 40px;
	}

	div {
		margin-top: 14px;
		font-size: 1.4rem;
		font-weight: 500;
	}

	&.watching {
		font-size: 1.8rem;
	}

	img {
		display: inline-block;
		width: 20px;
	}
}

.watch {
	margin-top: 50px;
	min-width: 600px;
	flex-direction: column;
	display: flex;
	align-items: center;

	@media only screen and (max-width: 650px) {
		min-width: 100vw;
	}

	@media only screen and (max-height: 1080px) {
		margin-top: 40px;
	}
}

.presenter-controls {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 70px;
	margin-top: 40px;
}

.btn {
	font-size: 1.8rem;
	align-items: center;

	svg {
		height: 22px;
		width: 22px;
	}

	&.hide {
		opacity: 0;
		pointer-events: none;
	}
}

.player {
	align-items: center;
	display: grid;
	font-size: 1.8rem;
	font-weight: 600;
	gap: 12px;
	grid-template-columns: 26px auto;
	margin-bottom: 24px;
}

.board {
	height: 90vw;
	max-height: 600px;
	max-width: 600px;
	padding: 0;
	width: 90vw;
}

.card {
	align-items: center;
	background: #E73289;
	border-radius: 6px;
	display: flex;
	font-size: 2rem;
	height: 232px;
	justify-content: center;
	line-height: 27px;
	padding: 20px;
	text-align: center;
	width: 174px;
	color: #fff;
}

.describe {
	background: #fff;
	color: #000;
	height: auto;
	min-height: 270px;
	width: 200px;
	word-break: break-word;
}

</style>