<template>
	<div class="draw" :style="boardCursor">
		<countdown @trigger="submit" />
		<h1><div>Draw</div>{{ description }}</h1>
		<canvas class="board box" ref="board" width="600" height="600" />

		<div class="tools box">
			<div>
				<div class="btn" @click="undo">
					<icon :data="icons.undoSvg" />
				</div>
				<div class="btn" @click="redo">
					<icon :data="icons.redoSvg" />
				</div>
			</div>
			<div>
				<div class="btn" @click="setTool('draw')" :class="{selected: tool === 'draw'}">
					<icon :data="icons.drawSvg" />
				</div>
				<div class="btn" @click="setTool('erase')" :class="{selected: tool === 'erase'}">
					<icon :data="icons.eraseSvg" />
				</div>
			</div>
			<div>
				<div class="btn" @click="setLineSize(5)" :class="{selected: lineSize == 5}">
					<div class="circle s5" />
				</div>
				<div class="btn" @click="setLineSize(10)" :class="{selected: lineSize == 10}">
					<div class="circle s10" />
				</div>
				<div class="btn" @click="setLineSize(15)" :class="{selected: lineSize == 15}">
					<div class="circle s15" />
				</div>
			</div>
		</div>

		<div class="tools box colors" v-if="colorsEnabled">
			<div class="btn color" 
				@click="setColor(hex)" 
				:class="[{selected: color === hex}, hex]"
				:style="{background: hex}"
				v-for="hex in colors" 
				:key="hex"
			/>
		</div>
	
		<div class="btn bold done" @click="submit">
			Done
		</div>
	</div>
</template>

<script>
import { create } from "simple-drawing-board"
import drawSvg from "@/assets/icons/draw.svg"
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
				"#000",
				"#C1C1C1",
				"#EF130B",
				"#FF7100",
				"#FFE400",
				"#00CC00",
				"#00B2FF",
				"#231FD3",
				"#A300BA",
				"#f07ab9",
				"#A0522D",
				"#fff",
				"#4C4C4C",
				"#740B07",
				"#C23800",
				"#E8A200",
				"#005510",
				"#00569E",
				"#0E0865",
				"#550069",
				"#A75574",
				"#63300D",
			],
			icons: {
				drawSvg,
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
				15: [15, 7.5]
			}
			const [size, radius] = sizes[this.lineSize]
			const hex = this.color === "#fff" || this.color === "#000" ? "#105ed2" : this.color
			const color = hex.replace("#", "%23")
			const circle = `<circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}"/>`
			const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">${circle}</svg>`
			return {
				"--board-cursor": `url('data:image/svg+xml;utf8,${svg}')`
			}
		}
	},
	methods: {
		setTool(tool) {
			if (this.board.mode === tool) return
			this.board.toggleMode()
			this.tool = tool
		},
		setColor(hex) {
			this.board.setLineColor(hex)
			this.color = hex
		},
		setLineSize(size) {
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

.board {
	cursor: var(--board-cursor) 5 5, crosshair;
	height: 600px;
	padding: 0;
	width: 600px;
}

.tools {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	margin-top: 30px;
	padding: 20px;

	@media only screen and (max-height: 1080px) {
		margin-top: 20px;
	}
}

.tools > div {
	display: flex;
	gap: 10px;
}

.tools .btn {
	width: 50px;
	height: 50px;
	display: flex;
	justify-content: center;
	align-items: center;

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
	grid-template-columns: repeat(11, 1fr);
	gap: 8px 6px;
	margin-bottom: 10px;

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

.btn.done {
	margin-top: 40px;
	width: 220px;

	@media only screen and (max-height: 1080px) {
		margin-top: 35px;
	}
}

</style>
