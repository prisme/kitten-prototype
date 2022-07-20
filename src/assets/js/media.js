export default class Word {
  constructor({image, flag}) {
    this.el = document.createElement('li')
		this.el.classList.add('project__media')
    const imgEl = document.createElement('img')
    imgEl.setAttribute('src', image)
    // linkEl.setAttribute('target', 'blank')
    // linkEl.textContent = label
    this.el.appendChild(imgEl)
  }

  append = (container) => {
    container.appendChild(this.el)
  }

  remove = () => {
    this.el.remove()
  }
}
