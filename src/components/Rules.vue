<template>
	<div class="rules">
		<h1>How to play!</h1>
		<div class="grid">
			<div class="rule">
				<span>#1</span>
				You'll be given the choice of multiple phrase cards, pick one to draw!
			</div>

			<div class="rule">
				<span>#2</span>
				Once you've finished your masterpeice of a drawing it will be passed to next player to marvel at.
			</div>
		
			<div class="rule">
				<span>#3</span>
				You'll receive a drawing from the player before you, ponder over its repulsiveness and write a short description of it.<br>
				Your description will be passed to the next player to create a drawing of.
			</div>

			<div class="rule">
				<span>#4</span>
				You'll receive a description from the player before you too and its your job to create a new work of art based on it.
			</div>

			<div class="rule">
				<span>#5</span>
				This pattern of drawing and describing continues around until your original drawing is back with you.
			</div>
			
			<div class="rule">
				<span>#6</span>
				Now you and the other players will get the chance to see the strange jouney your original phrase went on!<br><br>
				Present your original phrase and following creations to the other players as they watch along.
			</div>
			
			<div class="rule">
				<span>#7</span>
				Once you've revealed all yours cards pick your favourite drawing or description to award a point to its creator!<br><br>
				In the rare event your original phrase and final description are exactly the same, you'll get an extra point!
			</div>
		
			<div class="rule">
				<span>#8</span>
				Player with the most points at the end of all the rounds wins!
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>

.rules {
	margin-top: 120px;

	@media only screen and (max-height: 1080px) {
		margin-top: 80px;
	}
}

h1 {
	text-align: left;
	padding-bottom: 40px;

	@media only screen and (max-height: 1080px) {
		padding-bottom: 30px;
	}
}

.grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 50px;
	line-height: 1.5;
	font-size: 1.5rem;
	max-width: 500px;

	@media only screen and (max-height: 1080px) {
		gap: 35px;
	}
}

.rule {
	span {
		font-size: 2.4rem;
		display: block;
		font-weight: 700;
		color: var(--text-light);
		padding-bottom: 10px;
	}
}

</style>