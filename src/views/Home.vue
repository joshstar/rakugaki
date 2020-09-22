<template>
	<div class="home">
		<div class="host-btn btn bold" @click="hostGame" v-if="!loading">
			Host Game
		</div>
		<div class="host-btn create-btn btn bold" v-else>
			Creating game...
		</div>
		<div class="join">
			Join a game by clicking the invite link your friend has sent you
		</div>

		<rules />
	</div>
</template>

<script>
import { nanoid } from "nanoid"
import router from "@/routes"
import { resetState } from "@/game/state"
import Rules from "@/components/Rules"

export default {
	components: {
		Rules
	},
	data() {
		return {
			loading: false,
		}
	},
	methods: {
		async hostGame() {
			if (this.loading) return
			const id = await this.getGameId()
			this.loading = false
			router.push(`/lobby/${id}?host=1`)
		},
		async getGameId() {
			this.loading = true
			try {
				const response = await fetch("https://adjective-adjective-animal.vercel.app/api/generate")
				const json = await response.json()
				return json.data
			} catch {
				return nanoid()
			}
		}
	},
	created() {
		resetState()
		window.addEventListener("beforeunload", (e) => {
			delete e["returnValue"]
		})
	}
}
</script>

<style lang="scss" scoped>

.home {
	flex-direction: column;
	display: flex;
	align-items: center;
}

.host-btn {
	width: 200px;
	font-size: 2rem;
}

.create-btn {
	cursor: default;
	width: 300px;
}

.join {
	color: var(--text-light);
	font-size: 1.4rem;
	margin-top: 40px;
}
</style>