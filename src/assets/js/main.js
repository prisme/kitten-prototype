import * as dat from "dat.gui"
import { deg2rad, vhCalc, hypothenuse, containsClass, loadImage } from "./utils"

const gui = new dat.GUI({ closeOnTop: true })

window.onload = () => {
	const app = new App()
	app.init()
}
export default class App {
	constructor() {
		this.depth = 555
		this.offsetX = 0
		this.planeWidths = []
		this.imageSizes = []
		this.planes = [...document.querySelectorAll(".plane")]
	}

	async init() {
		vhCalc()
		this.imageSizes = await this.getImageSizes()
		window.addEventListener("resize", this.onResize.bind(this))
		this.onResize()

		gui
			.add(this, "depth", 0, window.innerHeight)
			.step(1)
			.onChange((val) => {
				this.depth = val
				this.onResize()
			})
	}

	onResize() {
		this.offsetX = 0
		this.planeWidths = this.getPlaneWidths()
		this.setTransform()
	}

	async getImageSizes() {
		return new Promise((resolve) => {
			let promises = []
			let sizes = []

			for (let i = 0; i < this.planes.length; i++) {
				const src = this.planes[i].querySelector("img").src

				promises.push(
					loadImage(src)
						.then((img) => {
							sizes[i] = {
								width: img.naturalWidth,
								height: img.naturalHeight,
							}
						})
						.catch((err) => console.error(err))
				)
			}

			Promise.all(promises).then(() => {
				resolve(sizes)
			})
		})
	}

	getPlaneWidths() {
		const { innerHeight } = window

		return this.planes.reduce((planeWidths, _, index) => {
			const { width, height } = this.imageSizes[index]

			const ratioWidth = innerHeight * (width / height)
			planeWidths.push(ratioWidth)
			return planeWidths
		}, [])
	}

	setTransform() {
		const { planes, planeWidths, setFront, setBack, rotateLeft, rotateRight } =
			this

		for (let i = 0; i < planes.length; i++) {
			const plane = planes[i]
			const width = planeWidths[i]

			plane.style.width = `${width}px`

			const method = containsClass(plane, "front")
				? setFront.bind(this)
				: containsClass(plane, "back")
				? setBack.bind(this)
				: containsClass(plane, "left")
				? rotateLeft.bind(this)
				: containsClass(plane, "right")
				? rotateRight.bind(this)
				: () => {
						console.error(`missing class on element: ${plane}`)
				  }

			method(plane, width)
		}
	}

	setFront(el, width) {
		el.style.transform = `translateX(${this.offsetX}px)`
		this.offsetX += width
	}

	setBack(el, width) {
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
