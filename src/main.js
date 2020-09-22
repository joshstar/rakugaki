import { createApp } from "vue"
import App from "./App.vue"
import router from "./routes"
import { VueSvgIconPlugin } from '@yzfe/vue3-svgicon'
import '@yzfe/svgicon/lib/svgicon.css'

createApp(App).use(VueSvgIconPlugin, { tagName: 'icon' }).use(router).mount("#app")
