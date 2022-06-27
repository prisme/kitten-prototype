import { deg2rad, vhCalc, hypothenuse, containsClass, loadImage } from "./utils"

document.addEventListener("DOMContentLoaded", () => {
	document.addEventListener("resize", () => {
		// this.height = window.innerHeight
	})
})

window.onload = () => {
	const app = new App()
	app.init()
}
export default class App {
	constructor() {
		this.height = 0
		this.offsetX = 0
		this.depth = 0
		this.planes = [...document.querySelectorAll(".plane")]
		this.widths = []
	}

	async init() {
		vhCalc()
		this.height = window.innerHeight
		this.depth = 600
		this.widths = await this.getWidths()
		this.applyTransform()
	}

	async getWidths() {
		return new Promise((resolve) => {
			const { height } = this
			let promises = []
			let imgWidths = []

			for (let i = 0; i < this.planes.length; i++) {
				let imgEl = this.planes[i].querySelector("img")
				let imgSrc = imgEl.src

				promises.push(
					loadImage(imgSrc)
						.then((img) => {
							const width = (img.naturalWidth / img.naturalHeight) * height
							imgWidths.push(width)
							imgEl.parentNode.style.width = `${width}px`
						})
						.catch((err) => console.error(err))
				)
			}

			Promise.all(promises).then(() => {
				resolve(imgWidths)
			})
		})
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
