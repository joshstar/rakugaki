export function sleep(duration) {
	return new Promise((resolve) => setTimeout(resolve, duration))
}

export function isEven(num) {
	return (num % 2) == 0
}