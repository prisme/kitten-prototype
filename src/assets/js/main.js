import * as dat from 'dat.gui'
import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { getDeviceType, deg2rad, vhCalc, hypothenuse, containsClass, loadImage } from './utils'
gsap.registerPlugin(Observer)

const gui = new dat.GUI({ closeOnTop: false })

window.onload = () => {
	const app = new App()
	app.init()
}
export default class App {
	constructor() {
		this.isDesktop = getDeviceType() === 'desktop'
		this.intersection = null
		this.depth = 555
		this.offsetX = 0
		this.planeWidths = []
		this.imageSizes = []
		this.edges = []
		this.currentTitle = document.querySelector('.kitten__dummytitles').textContent
		this.nodes = {
			root: document.querySelector('.kitten'),
			planes: [...document.querySelectorAll('.plane')],
			world: document.querySelector('.world'),
			titleTarget: document.querySelector('.kitten__titles'),
			activeSlide: null,
		}
		this.clickHold = {
			tooltip: null,
			interval: null,
			showTooltip: false,
			clickCount: 0,
			current: 0,
			cursorPosition: { x: 0, y: 0 },
		}
	}

	async init() {
		this.imageSizes = await this.getImageSizes()
		vhCalc()
		this.onResize()
		this.addEventListeners()
		this.createTooltip()

		const { titleTarget, world } = this.nodes
		titleTarget.textContent = titleTarget ? this.currentTitle : ''
		world.scrollLeft = 0

		gui
			.add(this, 'depth', 0, window.innerHeight)
			.step(1)
			.onChange(val => {
				this.depth = val
				this.onResize()
			})
	}

	async getImageSizes() {
		const { planes } = this.nodes
		return new Promise(resolve => {
			let promises = []
			let sizes = []

			for (let i = 0; i < planes.length; i++) {
				const src = planes[i].querySelector('img').src

				promises.push(
					loadImage(src)
						.then(img => {
							sizes[i] = {
								width: img.naturalWidth,
								height: img.naturalHeight,
							}
						})
						.catch(err => console.error(err)),
				)
			}

			Promise.all(promises).then(() => {
				resolve(sizes)
			})
		})
	}

	createTooltip() {
		const { planes } = this.nodes
		const { clickHold: hold } = this

		if(this.isDesktop) {
			hold.tooltip = document.createElement('b')
			hold.tooltip.classList.add('kitten__tooltip')
			hold.tooltip.innerText = "Click'n Hold"
			document.querySelector('.kitten').appendChild(hold.tooltip)
		}

		planes.forEach((el, i) => {
			el.addEventListener('mouseenter', () => {
				hold.showTooltip = true
			})
			el.addEventListener('mouseleave', () => {
				hold.showTooltip = false
			})
		})
	}

	getPlaneWidths() {
		const { planes } = this.nodes
		const { innerHeight } = window

		return planes.reduce((planeWidths, _, index) => {
			const { width, height } = this.imageSizes[index]
			const ratioWidth = innerHeight * (width / height)
			return [...planeWidths, ratioWidth]
		}, [])
	}

	handleTitles() {
		const { activeSlide } = this.nodes
		this.currentTitle = activeSlide.querySelector('.kitten__dummytitles').textContent
	}

	setTransform() {
		const { planes } = this.nodes
		const { planeWidths, setFront, setBack, setLeft, setRight } = this

		for (let i = 0; i < planes.length; i++) {
			const plane = planes[i]
			const width = planeWidths[i]

			plane.style.width = `${width}px`

			const method = containsClass(plane, 'front')
				? setFront.bind(this)
				: containsClass(plane, 'back')
				? setBack.bind(this)
				: containsClass(plane, 'left')
				? setLeft.bind(this)
				: containsClass(plane, 'right')
				? setRight.bind(this)
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

	setLeft(el, width) {
		const angle = deg2rad(90) - Math.acos(this.depth / width)
		const offset = hypothenuse(width, this.depth)

		el.style.transform = `translateX(${this.offsetX}px) rotateY(${angle}rad)`

		this.offsetX += offset
	}

	setRight(el, width) {
		const angle = deg2rad(90) - Math.acos(this.depth / width)
		const offset = hypothenuse(width, this.depth)

		el.style.transform = `translateX(${this.offsetX}px) translateZ(-${this.depth}px) rotateY(-${angle}rad)`

		this.offsetX += offset
	}

	/**
	 * Events.
	 */

	onIntersection(entries) {
		const { planes } = this.nodes

		entries.forEach((el, i) => {
			if (el.isIntersecting) {
				el.target.classList.add('active')
			} else {
				el.target.classList.remove('active')
			}
		})

		let visibleSlides = []
		planes.forEach(el => {
			if (el.classList.contains('active')) {
				visibleSlides.push(el)
			}
		})

		let visibleSlidesX = []
		visibleSlides.forEach((el, i) => {
			visibleSlidesX.push(el.getBoundingClientRect().x)
		})

		const min = Math.min(...visibleSlidesX)
		const index = visibleSlidesX.indexOf(min)
		this.nodes.activeSlide = visibleSlides[index]

		this.handleTitles()
	}

	onTouchDown(event) {}

	onTouchMove(event) {
		const { clickHold: hold } = this

		if (!hold.showTooltip && this.isDesktop) {
			hold.tooltip.style.opacity = 0
			return
		}

		hold.cursorPosition = {
			x: event.clientX,
			y: event.clientY,
		}

		const { tooltip } = hold
		const { x, y } = hold.cursorPosition
		const { width } = this.isDesktop ? tooltip.getBoundingClientRect() : 0

		if(this.isDesktop) {
			tooltip.style.top = `${y + 33}px`
			tooltip.style.left = `${x - width / 2}px`
			tooltip.style.opacity = 1
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
		this.edges = this.planeWidths.reduce((prev, curr, _, acc) => [...acc, prev + curr], [])
		this.setTransform()
	}

	/**
	 * Listeners.
	 */

	addEventListeners() {
		window.addEventListener('resize', this.onResize.bind(this))
		window.addEventListener('orientationchange', this.onResize.bind(this))

		Observer.create({
			type: 'wheel,touch,pointer',
			wheelSpeed: -1,
			onHover: event => {},
			onPress: () => {
				let { interval, current, tooltip } = this.clickHold
				if (interval) clearInterval(interval)
				interval = setInterval(() => {
					if (current >= 150) {
						console.log('open project detail page')
						clearInterval(interval)
						return
					}
					current += 10
				}, 100)
				this.isDesktop ? tooltip.style.opacity = 0 : null
			},
			onRelease: () => {
				let { interval, current, tooltip } = this.clickHold
				if (interval) clearInterval(interval)
				current = 0

				if(this.isDesktop) {
					tooltip.style.opacity = 1
				}
			},
			onDown: () => {
				console.log('down')
			},
			onUp: () => {
				console.log('up')
			},
			onLeft: () => {
				console.log('left')
			},
			onRight: () => {
				console.log('right')
			},
			tolerance: 10,
			preventDefault: false,
		})

		this.intersection = new IntersectionObserver(this.onIntersection.bind(this), {
			root: null,
			rootMargin: '0px',
			threshold: 0.5,
		})
		for (let plane of this.nodes.planes) {
			this.intersection.observe(plane)
		}

		this.nodes.world.addEventListener('scroll', () => {
			const { titleTarget } = this.nodes
			titleTarget.textContent = titleTarget ? this.currentTitle : ''
		})

		window.addEventListener('mousewheel', this.onWheel.bind(this))
		window.addEventListener('wheel', this.onWheel.bind(this))

		window.addEventListener('touchmove', this.onTouchMove.bind(this))
		window.addEventListener('mousemove', this.onTouchMove.bind(this))

		// window.addEventListener("touchstart", this.onTouchDown.bind(this))
		// window.addEventListener("mousedown", this.onTouchDown.bind(this))
		// window.addEventListener("mouseup", this.onTouchUp.bind(this))
		// window.addEventListener("touchend", this.onTouchUp.bind(this))
	}
}
