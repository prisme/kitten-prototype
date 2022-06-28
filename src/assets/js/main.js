import * as dat from "dat.gui"
import { deg2rad, vhCalc, hypothenuse, containsClass, loadImage } from "./utils"
import clickAndHold from 'click-and-hold';

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
		this.clickCount = 0
		this.planes = [...document.querySelectorAll(".plane")]

		this.addEventListeners()
	}

	async init() {
		vhCalc()
		this.imageSizes = await this.getImageSizes()
		this.onResize()

		document.querySelector('.world').scrollLeft = 0
		
		this.tooltip = document.createElement('b')
		this.tooltip.classList.add('kitten__tooltip')
		this.tooltip.innerText = "Click'n Hold"
		document.querySelector('.kitten').appendChild(this.tooltip)

		this.planes.forEach((el,i) => {
			el.addEventListener('mouseenter', () => {
				this.showTooltip = true
			})
			el.addEventListener('mouseleave', () => {
				this.showTooltip = false
			})
		})

		gui
			.add(this, "depth", 0, window.innerHeight)
			.step(1)
			.onChange((val) => {
				this.depth = val
				this.onResize()
			})
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


	/**
   * Events.
   */

	onTouchDown (event) {
  }

  onTouchMove (event) {
		this.cursorPosition = {
			x: event.clientX,
			y: event.clientY
		}

		

		if(this.showTooltip) {
			this.tooltip.style.top = `${this.cursorPosition.y + 33}px`
			this.tooltip.style.left = `${this.cursorPosition.x - (this.tooltip.getBoundingClientRect().width / 2)}px`
			this.tooltip.style.opacity = 1
		} else {
			this.tooltip.style.opacity = 0
		}
  }

  onTouchUp (event) {
		this.clickCount = 0

		this.tooltip.style.opacity = 1
  }

  onWheel (event) {
  }

	onClickAndHold() {
		this.clickCount += 1

		console.log('click')

		this.tooltip.style.opacity = 0

		if(this.clickCount === 200) {
			console.log('click hold event')
		}
	}


	/**
	 * Resize.
	 */

	onResize() {
		this.offsetX = 0
		this.planeWidths = this.getPlaneWidths()
		this.setTransform()
	}


	/**
   * Listeners.
   */

	addEventListeners () {
    window.addEventListener('resize', this.onResize.bind(this))

		this.planes.forEach((el) => {
			clickAndHold.register(el, this.onClickAndHold.bind(this), 10)
		})

    window.addEventListener('mousewheel', this.onWheel.bind(this))
    window.addEventListener('wheel', this.onWheel.bind(this))

    window.addEventListener('mousedown', this.onTouchDown.bind(this))
    window.addEventListener('mousemove', this.onTouchMove.bind(this))
    window.addEventListener('mouseup', this.onTouchUp.bind(this))

    window.addEventListener('touchstart', this.onTouchDown.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
    window.addEventListener('touchend', this.onTouchUp.bind(this))
  }
}
