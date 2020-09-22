import { createRouter, createWebHistory } from "vue-router"
import Home from "./views/Home.vue"
import Lobby from "./views/Lobby.vue"
import Play from "./views/Play.vue"
import Watch from "./views/Watch.vue"
import End from "./views/End.vue"

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home
	},
	{
		path: '/lobby/:room',
		name: "Lobby",
		component: Lobby,
		props: true
	},
	{
		path: '/play',
		name: "Play",
		component: Play
	},
	{
		path: '/watch',
		name: "Watch",
		component: Watch
	},
	{
		path: '/end',
		name: "End",
		component: End
	}
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
	scrollBehavior () {
		return { x: 0, y: 0 }
	}
})

router.beforeEach((to, from, next) => {
	if (process.env.NODE_ENV !== "production") {
		return next()
	}

	if (to.name === "Home" && (from.name === "Play" || from.name === "Watch")) {
		return next(false)
	}

	next()
})

export default router
