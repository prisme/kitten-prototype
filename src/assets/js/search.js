import searchData from "./../json/search.json";
import Word from './word'
import { gsap } from 'gsap'
import filter from 'lodash/filter'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import clone from 'lodash/clone'

window.onload = () => {
	new Search()
}
export default class Search {
  constructor() {
		this.maxWord = 20
		this.searchedWord = ''
		this.isHidingWords = false
		this.isShowingWords = false
		// this.previousSearchedWord = ''
		// prevent script when search element doesn't exist
		this.searchEl = document.querySelector('.search')
		if (!this.searchEl) return
		this.formEl = this.searchEl.querySelector('.search__form')
		this.inputEl = this.searchEl.querySelector('.search__input')
		this.listEl = this.searchEl.querySelector('.search__list')
		// listen to user typing
		this.formEl.addEventListener('submit', this.formSubmit)
		this.inputEl.addEventListener('input', this.formSubmit)
		// get all words from JSON data
		this.wordDatas = []
		this.wordDatas = this.wordDatas.concat(searchData.Collaborators)
		this.wordDatas = this.wordDatas.concat(searchData.Brands)
		this.wordDatas = this.wordDatas.concat(searchData.Editorial)
		// add default words
		this.words = []
		setTimeout(this.changeWords, 100) // TODO : fix vh is calculated after search initialisation
		// start render loop
		gsap.ticker.add(this.render)
  }

 	/**
 	 * Call change words when user add new text
 	 */
 	formSubmit = (e) => {
		e.preventDefault()
		this.searchedWord = this.inputEl.value
		// reduce the number of times change words can be called in a row
		if (!this.throttledChangeWords)
			this.throttledChangeWords = throttle(this.changeWords, 100)
		this.throttledChangeWords()
	}

	/**
	 * Change displayed words
	 */
	changeWords = () => {
		// hidding animation is already playing
		if (this.isHidingWords)
			return
		// stop previous animations
		if (this.showAnimation)
			this.showAnimation.kill()
		if (this.hideAnimation)
			this.hideAnimation.kill()
		// animate each words to hidden
		if (this.words.length > 0) {
			this.hideAnimation = gsap.timeline({
				onStart: () => {
					this.isHidingWords = true
				},
				onComplete: () => {
					this.isHidingWords = false
					this.showWords()
				}
			})
			this.hideAnimation.to(this.words, {
				opacity: 0,
				ease: 'Quad.easeOut',
				duration: .5,
				stagger: 0.02,
				onComplete: this.removeWords
			})
		}
		else
			this.showWords()
	}

	showWords = () => {
		// stop previous animation
		if (this.showAnimation)
			this.showAnimation.kill()
		// add new words
		this.addWords()
		// animate each words to visible
		if (this.words.length > 0) {
			this.showAnimation = gsap.timeline({
				onStart: () => {
					this.isShowingWords = true
				},
				onComplete: () => {
					this.isShowingWords = false
				}
			})
			this.showAnimation.from(this.words, {
				opacity: 0,
				ease: 'Quad.easeOut',
				duration: 1,
				stagger: 0.02,
			})
		}
	}

	/**
	 * remove displayed words
	 */
	removeWords = () => {
		if (this.words.length > 0) {
			this.words.forEach(word => {
				word.remove()
			})
			this.words.length = 0
		}
	}

	/**
	 * add searched words
	 */
	addWords = () => {
		let wordData, word
		// filter searched words
		let filteredWordDatas = this.wordDatas
		if (this.searchedWord.length > 0)
			filteredWordDatas = filter(this.wordDatas, this.filterWords)
		const len = filteredWordDatas.length > this.maxWord ? this.maxWord : filteredWordDatas.length
		// create words
		for (let i = 0; i < len; i++) {
			wordData = filteredWordDatas[i]
			// TODO : add pool design pattern to optimize memory
			word = new Word({
				label: wordData,
				speed: .0003,
			})
			this.words.push(word)
			word.append(this.listEl)
		}
	}

	/**
	 * TODO : animer le déplacement des mots
	 */
	render = () => {
		this.words.forEach(word => {
			word.update()
		})
	}

	/**
	 * Clean before destroy
	 */
	destroy = () => {
		gsap.ticker.remove(this.render)
		this.removeWords()
		// TODO : autre ?
	}

	/**
	 * Get words with the same characters as the searched one
	 */
	filterWords = (word) => {
		return this.normalizeWord(word).indexOf(this.normalizeWord(this.searchedWord)) !== -1
	}

	/**
	 * Set to lower case and remove accents
	 */
	normalizeWord = (word) => {
		return word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
	}
}
