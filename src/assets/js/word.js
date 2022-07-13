export default class Word {
  constructor({label, speed}) {
    this.speed = speed
    this._opacity = 1
    this.position = {
      x: Math.random(),
      y: Math.random(),
    }
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.setVelocityAngle(Math.random() * Math.PI * 2)
    this.el = document.createElement('li')
		this.el.classList.add('search__word')
    const linkEl = document.createElement('a')
    linkEl.setAttribute('href', 'TODO')
    linkEl.setAttribute('target', 'blank')
    linkEl.textContent = label
    this.el.appendChild(linkEl)
  }

  /**
   * Update position using speed
   * Prevent position to exceed parent borders
   */
  update = () => {
    if (this.el.parentNode) {
      // apply transform
      this.setTransform(
        this.position.x * (this.el.parentNode.clientWidth - this.el.clientWidth),
        this.position.y * (this.el.parentNode.clientHeight - this.el.clientHeight),
      )
      // add speed
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y
      // change speed when position reach borders
      if (this.position.x <= 0)
        this.setVelocityAngle(
          Math.random() > .5
          ? Math.random() * Math.PI * .5
          : Math.PI * 1.5 + Math.random() * Math.PI * .5
        )
      else if (this.position.x >= 1)
        this.setVelocityAngle(Math.PI * .5 + Math.random() * Math.PI)
      else if (this.position.y <= 0)
        this.setVelocityAngle(Math.random() * Math.PI)
      else if (this.position.y >= 1)
        this.setVelocityAngle(Math.PI + Math.random() * Math.PI)
    }
  }

  setVelocityAngle = (angle) => {
    this.velocity.x = Math.cos(angle) * this.speed
    this.velocity.y = Math.sin(angle) * this.speed
  }

  setTransform = (x, y) => {
    const transform = `translate(${x}px, ${y}px)`
    this.el.style['-webkit-transform'] = transform
    this.el.style['ms-transform'] = transform
    this.el.style['transform'] = transform
  }

  set opacity(value) {

    this._opacity = value
    if (this.el)
      this.el.style.opacity = value
  }

  get opacity() {
    return this._opacity
  }

  append = (container) => {
    container.appendChild(this.el)
  }

  remove = () => {
    this.el.remove()
  }
}
