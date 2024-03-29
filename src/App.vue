<template>
	<img class="logo" src="@/assets/logo.svg" :class="{small: smallLogo, link: linkLogo}" @click="goHome" />
	<router-view/>
	<div class="connection-status" v-if="connecting">
		Connecting...
	</div>
	<div class="connection-status" v-if="resyncing">
		Resyncing...
	</div>
	<div class="connection-status warning" :class="{show: connecting}">
		If you are experiencing connection issues, DO NOT close or reload the browser window.<br><br>
		Wait until your connection has stabilized and ask the host to click the bottom right "resync" button if needed.
	</div>
	<div class="resync-btn" v-if="isHost" @click="resync">
		Resync
	</div>
</template>

<script>
import router from "@/routes"
import { state, getPlayer } from "@/game/state"
import { resync } from "@/game/event"
import { sleep } from "@/util"

export default {
	data() {
		return {
			resyncing: false,
		}
	},
	computed: {
		connecting() {
			return !state.isConnected && state.self
		},
		smallLogo() {
			const { name } = this.$route
			return !(name === "Home" || name === "Lobby")
		},
		linkLogo() {
			const { name } = this.$route
			return name === "End"
		},
		isHost() {
			const self = getPlayer(state.self)
			return self && self.host
		}
	},
	methods: {
		goHome() {
			if (!this.linkLogo) return
			router.push("/")
		},
		async resync() {
			if (!confirm(
				`Re-sync all player data? Only do this if players are experiencing issues`)
			) return
			resync()
			this.resyncing = true
			await sleep(5000)
			this.resyncing = false
		}
	}
}
</script>

<style lang="scss">
@import "~normalize.css/normalize.css";

* {
	box-sizing: border-box;

	&::before,
	&::after {
		box-sizing: border-box;
	}
}

:root {
	--background: #EDF1F5;
	--foreground: #fff;
	--border: #DEE7ED;
	--text: #23374A;
	--text-light: #314F6C;
	--text-bright: #fff;
	--accent: #105ED2;
	--accent-border: #1852AA;
}

html {
	font-size: 62.5%;
}

body {
	background: var(--background);
	overscroll-behavior: none;
}

#app {
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
	align-items: center;
	color: var(--text);
	display: flex;
	flex-direction: column;
	font-family: 'Poppins', sans-serif;
	font-size: 1.6rem;
	font-weight: 500;
	margin: 0 auto;
	max-width: 1000px;
	min-height: 100vh;
	padding-bottom: 400px;

	@media only screen and (max-width: 650px) {
		width: calc(100vw - 30px);
		padding-bottom: 200px;
	}
}

img:not(.logo) {
	color-scheme: only light;
}

.logo {
	max-width: 300px;
	margin-top: 40px;
	margin-bottom: 60px;

	@media only screen and (max-height: 1080px) {
		margin-top: 30px;
		margin-bottom: 40px;
	}

	&.small {
		left: 40px;
		margin-bottom: 0;
		margin-top: 40px;
		position: absolute;
		width: 100px;

		@media only screen and (max-width: 900px) {
			display: none;
		}
	}

	&.link {
		cursor: pointer;

		@media only screen and (max-width: 900px) {
			display: block;
		}
	}
}

.connection-status {
	background: #ff5722;
	border-radius: 8px;
	color: #fff;
	font-weight: 700;
	padding: 14px 18px;
	position: absolute;
	right: 10px;
	text-align: center;
	top: 12px;
	z-index: 90;
}

.connection-status.warning {
	bottom: 50px;
	max-width: 500px;
	opacity: 0;
	pointer-events: none;
	position: fixed;
	text-align: left;
	top: initial;

	&.show {
		animation-name: delay-fade;
		animation-duration: 3s;
		opacity: 1;
	}
}

@keyframes delay-fade {
	0% {opacity: 0;}
	90% {opacity: 0;}
	100% {opacity: 1;}
}

.resync-btn {
	background: var(--foreground);
	border-radius: 6px;
	bottom: 12px;
	color: var(--text-light);
	cursor: pointer;
	font-size: 1.2rem;
	font-weight: 700;
	opacity: 0.4;
	padding: 10px 12px;
	position: fixed;
	right: 10px;
	text-align: center;
	transition: opacity 0.2s ease;
	z-index: 90;

	&:hover {
		opacity: 1;
	}
}

h1 {
	color: var(--text-light);
	font-size: 2.4rem;
	font-weight: 600;
	margin: 0;
	padding-bottom: 40px;
	text-align: center;

	> div {
		font-size: 2rem;
		padding-bottom: 12px;
	}
}

img {
	width: 100%;
}

.box {
	background: var(--foreground);
	box-shadow: 0px 2px 6px rgba(29, 62, 94, 0.08), 0px 4px 20px rgba(29, 62, 94, 0.06);
	border-radius: 8px;
	padding: 50px;
}

.btn {
	align-content: center;
	background: var(--background);
	border-radius: 6px;
	border: solid 1px var(--border);
	color: var(--text-light);
	cursor: pointer;
	display: flex;
	justify-content: center;
	text-align: center;
	transition: transform 0.2s, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease, border-width 0.2s ease;
	user-select: none;

	&.selected {
		background: var(--accent);
		border: solid 1px var(--accent-border);
		color: var(--text-bright);
	}

	&:hover {
		transform: translateY(-1px);
	}
}

.btn.bold {
	color: var(--text-bright);
	box-shadow: 0px 2px 10px rgba(16, 94, 210, 0.4);
	border: none;
	background: var(--accent);
	font-size: 2.2rem;
	padding: 20px;
	font-weight: 600;

	&:hover {
		box-shadow: 0px 2px 12px rgba(16, 94, 210, 0.45);
	}
}

.capitalize {
	text-transform: capitalize;
}

</style>
