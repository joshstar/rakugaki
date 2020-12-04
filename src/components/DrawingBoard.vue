<template>
	<div class="draw" :style="boardCursor">
		<countdown @trigger="submit" />
		<h1><div>Draw</div>{{ description }}</h1>
		<div class="canvas-wrap">
			<div class="tools box">
				<div class="tool-btns">
					<div class="btn" @click="setTool('draw')" :class="{selected: tool === 'draw'}">
						<icon :data="icons.drawSvg" />
					</div>
					<div class="btn" @click="setTool('flood')" :class="{selected: tool === 'flood'}">
						<icon :data="icons.fillSvg" />
					</div>
					<div class="btn" @click="setTool('erase')" :class="{selected: tool === 'erase'}">
						<icon :data="icons.eraseSvg" />
					</div>
				</div>
				<div class="size-btns">
					<div class="btn" @click="setLineSize(15)" :class="{selected: lineSize == 15}">
						<div class="circle s15" />
					</div>
					<div class="btn" @click="setLineSize(10)" :class="{selected: lineSize == 10}">
						<div class="circle s10" />
					</div>
					<div class="btn" @click="setLineSize(5)" :class="{selected: lineSize == 5}">
						<div class="circle s5" />
					</div>
				</div>
				<div class="history-btns">
					<div class="btn" @click="undo">
						<icon :data="icons.undoSvg" />
					</div>
					<div class="btn" @click="redo">
						<icon :data="icons.redoSvg" />
					</div>
				</div>
			</div>

			<canvas class="board box" ref="board" width="600" height="600" />
		</div>

		<div class="tools box colors" v-if="colorsEnabled">
			<div class="color-pair"
				v-for="(colorPair, index, key) in colors"
				:key="key"
			>
				<div class="btn color" 
					@click="setColor(hex)" 
					:class="[{selected: color === hex}, hex]"
					:style="{background: hex}"
					v-for="hex in colorPair" 
					:key="hex"
				/>
			</div>
		</div>
	
		<div class="btn bold done" @click="submit">
			Done
		</div>
	</div>
</template>

<script>
import { create } from "simple-drawing-board"
import drawSvg from "@/assets/icons/draw.svg"
import fillSvg from "@/assets/icons/fill.svg"
import eraseSvg from "@/assets/icons/erase.svg"
import redoSvg from "@/assets/icons/redo.svg"
import undoSvg from "@/assets/icons/undo.svg"
import { state } from "@/game/state"
import Countdown from "./Countdown"

export default {
	props: ["description"],
	components: {
		Countdown
	},
	data() {
		return {
			board: null,
			submitted: false,
			waiting: false,
			tool: "draw",
			lineSize: 10,
			color: "#000",
			colors: [
				["#000", "#fff"],
				["#C1C1C1", "#4C4C4C"],
				["#EF130B", "#740B07"],
				["#FF7100", "#C23800"],
				["#FFE400", "#E8A200"],
				["#00CC00", "#005510"],
				["#00B2FF", "#00569E"],
				["#231FD3", "#0E0865"],
				["#A300BA", "#550069"],
				["#f07ab9", "#A75574"],
				["#A0522D", "#63300D"],
			],
			icons: {
				drawSvg,
				fillSvg,
				eraseSvg,
				redoSvg,
				undoSvg
			}
		}
	},
	computed: {
		colorsEnabled() {
			return state.options.colors
		},
		boardCursor() {
			const sizes = {
				5: [10, 2.5],
				10: [10, 5],
				15: [15, 7.5],
			}
			const [size, radius] = sizes[this.lineSize]
			const hex = this.color === "#fff" || this.color === "#000" ? "#105ed2" : this.color
			const color = hex.replace("#", "%23")

			const drop = `<path d="M15 6 Q 15 6, 25 18 A 12.8 12.8 0 1 1 5 18 Q 15 6 15 6z" />`
			const dropSvg = `<svg width="22" height="18" viewBox="0 0 50 40" fill="${color}" xmlns="http://www.w3.org/2000/svg">${drop}</svg>`

			const circle = `<circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}"/>`
			const circleSvg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">${circle}</svg>`
			return {
				"--board-cursor": `url('data:image/svg+xml;utf8,${this.tool === "flood" ? dropSvg : circleSvg}')`
			}
		}
	},
	methods: {
		setTool(tool) {
			this.board.setMode(tool)
			this.tool = tool
		},
		setColor(hex) {
			this.board.setLineColor(hex)
			this.color = hex
		},
		setLineSize(size) {
			if (this.tool === "flood") {
				this.setTool("draw")
			}
			this.board.setLineSize(size)
			this.lineSize = size
		},
		async undo() {
			if (this.waiting) return
			this.waiting = true
			await this.board.undo()
			this.waiting = false
		},
		async redo() {
			if (this.waiting) return
			this.waiting = true
			await this.board.redo()
			this.waiting = false
		},
		submit() {
			if (this.submitted) return
			this.submitted = true
			const image = this.board.toDataURL()
			this.$emit("done", image)
		},
	},
	mounted() {
		this.board = create(this.$refs.board)
		this.board.setLineSize(this.lineSize)
	}
}
</script>

<style lang="scss" scoped>

.draw {
	flex-direction: column;
	display: flex;
	align-items: center;
}

.canvas-wrap {
	display: grid;
	gap: 20px;
	grid-template-columns: 90px auto;
	margin-left: -45px;
	min-width: 0;

	@media only screen and (max-width: 1200px) {
		gap: 0;
		grid-template-columns: auto;
		margin-left: 0;
	}

	@media only screen and (max-width: 500px) {
		justify-items: center;
	}
}

.board {
	cursor: var(--board-cursor) 5 5, crosshair;
	height: 90vw;
	max-height: 600px;
	max-width: 600px;
	padding: 0;
	width: 90vw;
}

.tools {
	display: grid;
	gap: 10px;
	justify-items: center;
	align-items: center;
	padding: 10px 20px;

	@media only screen and (max-width: 1200px) {
		gap: 5px;
		grid-row: 2;
		grid-template-areas: "toolBtns historyBtns sizeBtns";
		grid-template-columns: 1fr 1fr 1fr;
		margin-top: 20px;
		padding: 14px;
	}

	@media only screen and (max-width: 500px) {
		gap: 15px 0;
		grid-template-columns: 1fr 1fr;
		justify-items: flex-start;
		grid-template-areas: none;

		.size-btns {
			margin-left: 10px;
		}
	}
}

.tools > div {
	display: flex;
	gap: 10px;

	@media only screen and (min-width: 1200px) {
		flex-direction: column;
	}
}

.tools .btn {
	width: 50px;
	height: 50px;
	display: flex;
	justify-content: center;
	align-items: center;

	@media only screen and (max-width: 650px) {
		width: 35px;
		height: 35px;

		svg {
			height: 14px;
		}
	}

	svg {
		width: 18px;
	}

	.circle {
		background: currentColor;
		border-radius: 50%;

		&.s5 {
			width: 5px;
			height: 5px;
		}
		&.s10 {
			width: 10px;
			height: 10px;
		}
		&.s15 {
			width: 15px;
			height: 15px;
		}
	}
}

.tools.colors {
	gap: 8px;
	grid-template-columns: repeat(11, 1fr);
	margin-bottom: 10px;
	margin-top: 20px;
	padding: 20px;

	@media only screen and (max-width: 500px) {
		grid-template-columns: repeat(6, 1fr);
	}

	.color-pair {
		display: flex;
		flex-direction: column;
	}

	.btn {
		border: none;
		width: 32px;
		height: 32px;
		transition: transform 0.2s;

		&.selected {
			border: solid 3px var(--background);
		}

		&.\#fff {
			border: solid 3px var(--background);
		}
	}
}

@media only screen and (max-width: 1200px) and (min-width: 501px) {
	.tool-btns {
		grid-area: toolBtns;
	}

	.size-btns {
		grid-area: sizeBtns;
		flex-direction: row-reverse;
	}

	.history-btns {
		grid-area: historyBtns;
	}
}

.btn.done {
	margin-top: 30px;
	width: 220px;

	@media only screen and (max-height: 1080px) {
		margin-top: 10px;
	}
}

@media only screen and (max-height: 1080px) {
	h1 {
		padding-bottom: 30px;

		> div {
			padding-bottom: 10px;
		}
	}
}

</style>
