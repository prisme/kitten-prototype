export default class Menu {
	constructor() {
		// prevent script when nav and burger elements don't exist
		this.navEl = document.querySelector('.kitten__menu_navigation')
		this.burgerEl = document.querySelector('.kitten__menu_navigation-icon')
		if (!this.navEl || !this.burgerEl) return
		this.burgerEl.addEventListener('click', this.onToggleNav)
  }

	onToggleNav = (e) => {
		e.preventDefault()
		this.navEl.classList.toggle('active')
	}
}
