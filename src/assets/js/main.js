import * as dat from "dat.gui"
import { gsap } from "gsap"
import { Observer } from "gsap/Observer"
import { deg2rad, vhCalc, hypothenuse, containsClass, loadImage } from "./utils"

const gui = new dat.GUI({ closeOnTop: false })

window.onload = () => {
	const app = new App()
	app.init()
}
export default class App {
	constructor() {
		this.clickHold = {
			tooltip: null,
			interval: null,
			showTooltip: false,
			clickCount: 0,
			current: 0,
			cursorPosition: { x: 0, y: 0 },
		}
		this.titleHolder = false
		this.depth = 555
		this.offsetX = 0
		this.planeWidths = []
		this.imageSizes = []
		this.world = document.querySelector(".world")
		this.planes = [...document.querySelectorAll(".plane")]
		gsap.registerPlugin(Observer)
	}

	async init() {
		vhCalc()
		this.imageSizes = await this.getImageSizes()
		this.createTooltip()
		this.addEventListeners()
		
		this.onResize()

		this.world.scrollLeft = 0

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

	createTooltip() {
		const { clickHold } = this
		clickHold.tooltip = document.createElement("b")
		clickHold.tooltip.classList.add("kitten__tooltip")
		clickHold.tooltip.innerText = "Click'n Hold"
		document.querySelector(".kitten").appendChild(clickHold.tooltip)

		this.planes.forEach((el, i) => {
			el.addEventListener("mouseenter", () => {
				clickHold.showTooltip = true
			})
			el.addEventListener("mouseleave", () => {
				clickHold.showTooltip = false
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

	handleTitles() {
		this.titleHolder = document.querySelector(".kitten__titles")
		this.title = this.activeSlide.getElementsByClassName("kitten__dummytitles")[0].textContent

		if(this.titleHolder.textContent === '') {
			this.titleHolder.textContent = this.title
		}
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

	onIntersection(entries) {
		entries.forEach((el, i) => {
			if (el.isIntersecting) {
				el.target.classList.add("active")
			} else {
				el.target.classList.remove("active")
			}
		})

		let visibleSlides = []
		this.planes.forEach((el, i) => {
			if (el.classList.contains("active")) {
				visibleSlides.push(el)
			}
		})

		let visibleSlidesX = []
		visibleSlides.forEach((el, i) => {
			visibleSlidesX.push(el.getBoundingClientRect().x)
		})

		const min = Math.min(...visibleSlidesX)
		const index = visibleSlidesX.indexOf(min)
		this.activeSlide = visibleSlides[index]

		this.handleTitles()
	}

	onTouchDown(event) {}

	onTouchMove(event) {
		const { clickHold } = this

		clickHold.cursorPosition = {
			x: event.clientX,
			y: event.clientY,
		}

		if (clickHold.showTooltip) {
			clickHold.tooltip.style.top = `${clickHold.cursorPosition.y + 33}px`
			clickHold.tooltip.style.left = `${
				clickHold.cursorPosition.x -
				clickHold.tooltip.getBoundingClientRect().width / 2
			}px`
			clickHold.tooltip.style.opacity = 1
		} else {
			clickHold.tooltip.style.opacity = 0
		}
	}

	onTouchUp(event) {}

	onWheel(event) {}

	/**
	 * Resize.
	 */

	onResize() {
		this.offsetX = 0
		this.planeWidths = this.getPlaneWidths()
		this.setTransform()

		console.log(this.planes[2])
	}

	/**
	 * Listeners.
	 */

	addEventListeners() {
		window.addEventListener("resize", this.onResize.bind(this))
		window.addEventListener("orientationchange", this.onResize.bind(this))

		Observer.create({
			type: "wheel,touch,pointer",
			wheelSpeed: -1,
			onHover: (event) => {},
			onPress: (event) => {
				const { clickHold } = this
				if (clickHold.interval) clearInterval(clickHold.interval)
				clickHold.tooltip.style.opacity = 0
				clickHold.interval = setInterval(() => {
					clickHold.current += 1
					if (clickHold.current >= 2) {
						// console.log("click hold event")
					}
				}, 1000)
			},
			onRelease: (event) => {
				const { clickHold } = this
				if (clickHold.interval) clearInterval(clickHold.interval)
				clickHold.current = 0
				clickHold.tooltip.style.opacity = 1
			},
			onDown: () => {
				// console.log("down")
			},
			onUp: () => {
				// console.log("up")
			},
			onLeft: () => {
				// console.log("left")
			},
			onRight: () => {
				// console.log("right")fconso
			},
			tolerance: 10,
			preventDefault: false,
		})

		this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
			root: null,
			rootMargin: "0px",
			threshold: 0.5,
		})
		for (let plane of this.planes) {
			this.observer.observe(plane)
		}

		this.world.addEventListener("scroll", (ev) => {
			this.titleHolder ? this.titleHolder.textContent = this.title : ''
		})

		window.addEventListener("mousewheel", this.onWheel.bind(this))
		window.addEventListener("wheel", this.onWheel.bind(this))

		window.addEventListener("touchmove", this.onTouchMove.bind(this))
		window.addEventListener("mousemove", this.onTouchMove.bind(this))

		// window.addEventListener("touchstart", this.onTouchDown.bind(this))
		// window.addEventListener("mousedown", this.onTouchDown.bind(this))
		// window.addEventListener("mouseup", this.onTouchUp.bind(this))
		// window.addEventListener("touchend", this.onTouchUp.bind(this))
	}
}
