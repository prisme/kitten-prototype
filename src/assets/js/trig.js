import { deg2rad, vhCalc, hypothenuse, containsClass } from "./utils"

window.onload = () => {
	new App()
}
export default class App {
	constructor() {
		this.planes = [...document.querySelectorAll(".plane")]

		this.depth = 200
		this.offsetX = 0
		this.widths = []
		this.edges = []
		this.rotPat = [0, 1, 2, 3]

		vhCalc()
		this.getWidths()
		this.applyTransform()
	}

	getWidths() {
		for (let i = 0; i < this.planes.length; i++) {
			this.widths[i] = this.planes[i].offsetWidth
		}
	}

	applyTransform() {
		for (let i = 0; i < this.planes.length; i++) {
			const el = this.planes[i]
			const width = this.widths[i]

			if (containsClass(el, "front")) {
				this.setFront(el, width)
			} else if (containsClass(el, "left")) {
				this.rotateLeft(el, width)
			} else if (containsClass(el, "back")) {
				this.pushBack(el, width)
			} else if (containsClass(el, "right")) {
				this.rotateRight(el, width)
			}
		}
	}

	setFront(el, width) {
		el.style.transform = `translateX(${this.offsetX}px)`
		this.offsetX += width
	}

	pushBack(el, width) {
		el.style.transform = `translateX(${this.offsetX}px) translateZ(-${this.depth}px)`
		this.offsetX += width
	}

	rotateLeft(el, width) {
		const angle = deg2rad(90) - Math.acos(this.depth / width)
		const offset = hypothenuse(width, this.depth)

		el.style.transform = `translateX(${this.offsetX}px) rotateY(${angle}rad)`

		this.offsetX += offset
	}

	rotateRight(el, width) {
		const angle = deg2rad(90) - Math.acos(this.depth / width)
		const offset = hypothenuse(width, this.depth)

		el.style.transform = `translateX(${this.offsetX}px) translateZ(-${this.depth}px) rotateY(-${angle}rad)`

		this.offsetX += offset
	}
}
