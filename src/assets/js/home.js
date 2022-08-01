import * as dat from 'dat.gui'
import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { deg2rad, vhCalc, hypothenuse, loadImage, deviceType } from './utils'
import Menu from './menu'

gsap.registerPlugin(Observer)
gsap.registerPlugin(InertiaPlugin)
gsap.registerPlugin(ScrollToPlugin)
const gui = new dat.GUI({ closeOnTop: false, closed: true })

const DEPTH = 702
const DEPTH_portrait = 520
const MAX_DEPTH = 1000

window.onload = () => {
	new App({ gui }).init()
}
export default class App {
	constructor({ gui }) {
		this.gui = gui
		this.hasTooltip = true
		this.isPortrait = window.innerHeight > window.innerWidth
		this.depth = this.isPortrait ? DEPTH_portrait : DEPTH
		this.offsetX = 0
		this.titleIndex = 0
		this.planeWidths = []
		this.imageSizes = []
		this.nodes = {
			root: document.querySelector('.kitten'),
			planes: [...document.querySelectorAll('.plane')],
			world: document.querySelector('.world'),
			titleTarget: document.querySelector('.kitten__titles'),
			news: document.querySelector('.kitten__news'),
			activeSlide: null,
		}
		this.hold = {
			tooltip: null,
			interval: null,
			clickCount: 0,
			current: 0,
			cursorPosition: { x: 0, y: 0 },
		}
		new Menu()
	}

	async init() {
		this.imageSizes = await this.getImageSizes()
		this.addEventListeners()
		this.createTooltip()
		if (this.nodes.world) {
			this.nodes.world.classList.add('loaded')
			this.nodes.world.scrollLeft = 0
		}

		if (this.gui)
			this.gui
				.add(this, 'depth', 0, MAX_DEPTH)
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
		if (!this.hasTooltip) return
		if (deviceType.isTouch) return
		const { hold } = this
		hold.tooltip = document.createElement('b')
		hold.tooltip.classList.add('kitten__tooltip')
		// hold.tooltip.innerText = 'Click & Hold'
		this.nodes.root.appendChild(hold.tooltip)
		hold.buffer = document.createElement('span')
		hold.buffer.classList.add('kitten__tooltip__buffer')
		hold.buffer.innerHTML =
			'<svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg>'
		hold.tooltip.appendChild(hold.buffer)
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

	setTransform() {
		const { planes } = this.nodes
		const { planeWidths, setFront, setBack, setLeft, setRight } = this

		for (let i = 0; i < planes.length; i++) {
			const plane = planes[i]
			const width = planeWidths[i]

			plane.style.width = `${width}px`

			const method = plane.classList.contains('front')
				? setFront.bind(this)
				: plane.classList.contains('back')
				? setBack.bind(this)
				: plane.classList.contains('left')
				? setLeft.bind(this)
				: plane.classList.contains('right')
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
	 * Events
	 */

	onIntersection(entries) {
		entries.forEach(el => {
			if (el.isIntersecting) {
				el.target.classList.add('active')
			} else {
				el.target.classList.remove('active')
			}
		})

		let visibleSlides = []
		this.nodes.planes.forEach(el => {
			if (el.classList.contains('active')) {
				visibleSlides.push(el)
			}
		})

		let visibleSlidesX = []
		visibleSlides.forEach(el => {
			visibleSlidesX.push(el.getBoundingClientRect().x)
		})

		const min = Math.min(...visibleSlidesX)
		const index = visibleSlidesX.indexOf(min)
		this.nodes.activeSlide = visibleSlides[index]

		if (!this.nodes.activeSlide) return
		this.nodes.titleTarget.innerHTML =
			this.nodes.activeSlide.querySelector('.kitten__dummytitles').innerHTML

		this.nodes.news.style.opacity = this.nodes.activeSlide.dataset.news ? '1' : '0'
	}

	onMouseMove(e) {
		this.hold.cursorPosition = {
			x: e.clientX,
			y: e.clientY,
		}
		if (this.hold.interval) clearInterval(this.hold.interval)
	}

	showTooltip(isVisible = false) {
		if (deviceType.isTouch) return
		const { hold } = this
		const { tooltip } = hold
		const { x, y } = hold.cursorPosition
		const { width } = tooltip.getBoundingClientRect()
		tooltip.style.top = `${y + 33}px`
		tooltip.style.left = `${x - width / 2}px`
		if (this.hold.interval) clearInterval(this.hold.interval)
		this.hold.tooltip.style.opacity = isVisible ? '1' : '0'
	}

	onResize() {
		this.offsetX = 0
		this.isPortrait = window.innerHeight > window.innerWidth
		const D = this.isPortrait ? DEPTH_portrait : DEPTH
		this.depth = Math.min(Math.min(D, this.depth), window.innerHeight)
		this.planeWidths = this.getPlaneWidths()
		this.setTransform()
		if (this.gui) this.gui.updateDisplay()
	}

	addEventListeners() {
		const { nodes } = this

		this.onResize()
		window.addEventListener('resize', this.onResize.bind(this))
		window.addEventListener('orientationchange', this.onResize.bind(this))
		vhCalc()

		Observer.create({
			target: nodes.world,
			type: 'wheel,touch,pointer',
			wheelSpeed: -1.2,
			onChangeX: self => {
				if (deviceType.isTouch || !self.isDragging) return
				gsap.to(self.target, {
					scrollTo: { x: self.target.scrollLeft - self.deltaX * 12 },
					inertia: {
						scrollLeft: {
							velocity: self.velocityX,
						},
						duration: { min: 0.2, max: 1 },
					},
				})
			},
			onChangeY: self => {
				if (deviceType.isTouch || self.isDragging) return
				self.target.scrollLeft -= self.deltaY
			},
			onDrag: () => {
				this.nodes.root.style.cursor = 'grabbing'
				if (this.hasTooltip) this.showTooltip(false)
			},
			onDragEnd: () => {
				this.nodes.root.style.cursor = 'grab'
			},
			tolerance: 10,
			preventDefault: false,
		})

		let intersection = new IntersectionObserver(this.onIntersection.bind(this), {
			root: document.body,
			rootMargin: '0px',
			threshold: 0.2,
		})
		for (let plane of nodes.planes) {
			intersection.observe(plane)
		}

		// tooltip
		if (!this.hasTooltip || deviceType.isTouch) return

		window.addEventListener('mousemove', this.onMouseMove.bind(this))

		nodes.planes.forEach(el => {
			el.addEventListener('mouseenter', () => {
				this.nodes.root.style.cursor = 'grab'
			})
			el.addEventListener('mouseleave', () => {
				this.nodes.root.style.cursor = 'default'
			})
			el.addEventListener('mousedown', () => {
				nodes.root.style.cursor = 'pointer'

				this.showTooltip(true)

				this.hold.interval = setInterval(() => {
					if (this.hold.current >= 100) {
						window.location.href = 'project.html'
						clearInterval(this.hold.interval)
						return
					}
					this.hold.current++
					this.hold.buffer.style.strokeDasharray = `${this.hold.current} 100`
				}, 10)
				this.hold.buffer.style.strokeDasharray = '0 100'
			})
			el.addEventListener('mouseup', () => {
				this.nodes.root.style.cursor = 'grab'

				if (!this.hasTooltip) return
				this.showTooltip(false)
				this.hold.current = 0
				this.hold.buffer.style.strokeDasharray = '0 100'
			})
		})
	}
}