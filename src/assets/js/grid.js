import * as dat from 'dat.gui'
import { gsap } from 'gsap'
import { vhCalc } from './utils'
import Masonry from 'masonry-layout'
import throttle from 'lodash/throttle'

/**
 * Helper to get all the projects in html format
 * It's automaticaly copy/paste if you have DOM focused
 */
export const convertJSONToHTML = (mediaDatas) => {
	let result = ''
	mediaDatas.forEach((mediaData, index) => {
		const sizeClass =
			mediaData.size > 1 && mediaData.size <= 4 ? ` project__media--width${mediaData.size}` : ''
		const flagClass = mediaData.flag
			? ` project__media--flag project__media--flag--${mediaData.flag}`
			: ''
		result += `<li`
		result += ` class="project__media${sizeClass}${flagClass}"`
		if (mediaData.title)
			result += `data-title="${mediaData.title} (debug:${index})"`
		result += `>`
		if (mediaData.link)
			result += `<a href="${mediaData.link}">`
		result += `<img`
		result += ` src="${mediaData.image}"`
		if (mediaData.title)
			result += ` alt="${mediaData.title}"`
		result += `/>`
		if (mediaData.link)
			result += `</a>`
		// TODO : should be optimized
		// currently adding video to the html because parcel doosn't import dynamicaly loaded files
		// possible solution : https://en.parceljs.org/module_resolution.html#glob-file-paths
		if (mediaData.video) {
			result += `<video src="${mediaData.video}"></video>`
			result += `<button class="project__media__toggle"></button>`
		}
		result += `</li>\n`
	})
	console.log(result)
	navigator.clipboard.writeText(result)
}

export default class Grid {
	constructor({ gui, hasDynamicTitle }) {
		this.hasDynamicTitle = hasDynamicTitle
		this.mobileBreakpoint = 768
		this.isMobileDevice = false
		this.currentMediaEl = null
		// prevent script when search element doesn't exist
		this.projectEl = document.querySelector('.project')
		if (!this.projectEl) return
		this.listEl = this.projectEl.querySelector('.project__list')
		this.mediaEls = this.projectEl.querySelectorAll('.project__media')
		this.titleEl = this.projectEl.querySelector('.project__title')
		// place medias in a grid
		this.msnry = new Masonry(this.listEl, {
			itemSelector: '.project__media',
			columnWidth: '.project__sizer',
			percentPosition: true,
			transitionDuration: 0,
		})
		// add title actions if necessary
		if (this.hasDynamicTitle) {
			this.addOverListeners()
			gsap.ticker.add(this.onRender)
		}
		else {
			this.titleEl.classList.add('project__title--visible')
		}
		// add video actions
		this.addToggleListeners()
		//
		this.resizeThrottle = throttle(this.onResize, 100)
		window.addEventListener('resize', this.resizeThrottle)
		this.resizeThrottle()
	}

	/**
	 *
	 */
	addGUI = gui => {}

	/**
	 * Add over listener to medias
	 * this will allow us to show and hide title
	 * according to overed media
	 */
	addOverListeners = () => {
		this.mediaEls.forEach((mediaEl, index) => {
			mediaEl.addEventListener('mouseover', this.onMediaOver)
			mediaEl.addEventListener('mouseout', this.onMediaOut)
		})
	}

	/**
	 * Show overed media title on tablet/desktop devices
	 */
	onMediaOver = e => {
		// cancel on mobile devices
		if (this.isMobileDevice) return
		const medialEl = e.currentTarget
		this.changeMedia(medialEl)
	}

	/**
	 * Hide unovered media title on tablet/desktop devices
	 */
	onMediaOut = e => {
		// cancel on mobile devices
		if (this.isMobileDevice) return
		const medialEl = e.currentTarget
		this.changeMedia(null)
	}

	/**
	 * Hide previous title
	 * then wait css animation end to show new
	 */
	changeMedia = mediaEl => {
		const previousMediaEl = this.currentMediaEl
		// cancel when it's same media
		if (previousMediaEl === mediaEl) return
		this.currentMediaEl = mediaEl
		// force to wait hide animation complete first
		if (this.isHidding) return
		// hide previous media before showing current
		if (previousMediaEl) {
			this.isHidding = true
			// css transitionend event is not reliable at high intensity (fast scrolling)
			// this.titleEl.addEventListener('transitionend', this.showMedia)
			if (this.transitionTimeout) {
				clearTimeout(this.transitionTimeout)
				this.transitionTimeout = null
			}
			this.transitionTimeout = setTimeout(this.showMedia, 100)
			this.titleEl.classList.remove('project__title--visible')
		} else {
			this.showMedia()
		}
	}

	/**
	 * Display title using css animation
	 */
	showMedia = () => {
		this.isHidding = false
		// this.titleEl.removeEventListener('transitionend', this.showMedia)
		if (this.currentMediaEl) {
			this.titleEl.innerHTML = this.currentMediaEl.dataset.title
			this.titleEl.classList.add('project__title--visible')
		}
	}

	/**
	 * Display centered media title on mobile devices
	 */
	onRender = () => {
		// cancel on tablet/desktop devices
		if (!this.isMobileDevice) return
		const screenVerticalCenter = window.innerHeight * 0.5
		let mediaRect
		let mediaVerticalCenter
		let mediaPosDiff
		let closestMediaEl
		let closestMediaPosDiff
		// search media closest to screen vertical center
		// by comparing the distance between each media vertical center to the screen
		this.mediaEls.forEach((mediaEl, index) => {
			mediaRect = mediaEl.getBoundingClientRect()
			mediaVerticalCenter = mediaRect.y + mediaRect.height * 0.5
			mediaPosDiff = Math.abs(screenVerticalCenter - mediaVerticalCenter)
			if (!closestMediaEl || mediaPosDiff < closestMediaPosDiff) {
				closestMediaEl = mediaEl
				closestMediaPosDiff = mediaPosDiff
			}
		})
		if (closestMediaEl) {
			this.changeMedia(closestMediaEl)
		}
	}

	/**
	 * Detect mobile breakpoint according to window width
	 */
	onResize = () => {
		this.isMobileDevice = window.innerWidth < this.mobileBreakpoint
	}

	/**
	 * Add listener on toggle button
	 * play video when clicked
	 */
	addToggleListeners = () => {
		let mediaToggleEl
		this.mediaEls.forEach((mediaEl, index) => {
			mediaToggleEl = mediaEl.querySelector('.project__media__toggle')
			if (mediaToggleEl) mediaToggleEl.addEventListener('click', this.onToggleClick)
		})
	}

	/**
	 * Play/pause video and switch view elements
	 */
	onToggleClick = e => {
		const mediaEl = e.currentTarget.closest('.project__media')
		const mediaVideoEl = mediaEl.querySelector('video')
		if (mediaEl.classList.contains('project__media--playing')) {
			mediaEl.classList.remove('project__media--playing')
			mediaVideoEl.removeEventListener('ended', this.onVideoEnded)
			mediaVideoEl.pause()
		} else {
			mediaEl.classList.add('project__media--playing')
			mediaVideoEl.addEventListener('ended', this.onVideoEnded)
			mediaVideoEl.play()
		}
	}

	/**
	 * Reset player when video end
	 */
	onVideoEnded = e => {
		const mediaEl = e.currentTarget.closest('.project__media')
		const mediaVideoEl = mediaEl.querySelector('video')
		mediaVideoEl.removeEventListener('ended', this.onVideoEnded)
		mediaEl.classList.remove('project__media--playing')
	}

	/**
	 *
	 */
	// addMedias = () => {
	// 	let media
	// 	projectData.medias.forEach(mediaData => {
	// 		media = new Media(mediaData)
	// 		media.append(this.listEl)
	// 		this.medias.push(media)
	// 	})
	// }

	/**
	 * Clean before destroy
	 */
	destroy = () => {
		this.msnry.destroy()
		// TODO : autre ?
	}
}
