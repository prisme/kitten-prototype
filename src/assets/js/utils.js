export function deg2rad(degrees) {
	return (degrees * Math.PI) / 180
}

export function rad2deg(radians) {
	return (radians * 180) / Math.PI
}

export function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max)
}

export function hypothenuse(width, depth) {
	return Math.sqrt(Math.pow(width, 2) - Math.pow(depth, 2))
}

export async function loadImage(url) {
	let img = new Image()
	return await new Promise(resolve => (img.onload = resolve(img)), (img.src = url))
}

function trueVhCalc() {
	window.requestAnimationFrame(() => {
		const vh = window.innerHeight * 0.01
		document.documentElement.style.setProperty('--vh', `${vh}px`)
	})
}

function goTrueVhCalc(i, height0) {
	if (window.innerHeight !== height0 || i >= 120) {
		trueVhCalc()
	} else {
		window.requestAnimationFrame(() => {
			goTrueVhCalc(i + 1, height0)
		})
	}
}

export function vhCalc() {
	trueVhCalc()
	let trueVhCalcTick
	window.addEventListener('orientationchange', () => {
		goTrueVhCalc(0, window.innerHeight)
	})
	window.addEventListener('resize', () => {
		window.cancelAnimationFrame(trueVhCalcTick)
		trueVhCalcTick = window.requestAnimationFrame(trueVhCalc)
	})
}

export const deviceType = {
	isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
	isTablet: /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent),
	isSafari: /^((?!Chrome|Android).)*Safari/i.test(navigator.userAgent),
	isTouch: 'ontouchstart' in window,
}
