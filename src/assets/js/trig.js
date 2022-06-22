import { trueVh, deg2rad, rad2deg } from './utils'

export default class App {
  constructor() {
    this.planes = Array.prototype.slice.call(document.getElementsByClassName('plane'))
    this.elemtsWidth = []
    this.edges = []
    this.rotPat = [0, 1, 2, 3]
    this.prevW = 0
    this.offsetTransX = 0
    this.depth = 200

    this.getWidth()
    this.getEdges()

    this.buildRotationPattern()

    this.constructSlides()
  }

  getWidth() {
    this.planes.forEach(e => { this.elemtsWidth.push(e.offsetWidth) })
    console.log('widths', this.elemtsWidth)
  }

  getEdges() {
    this.planes.forEach((e,i) => {
      this.edges.push(e.getBoundingClientRect().width)
    })
    this.edges = this.edges.map((e,i) => 
      this.edges.slice(0, i+1).reduce((a,b) => a + b)
    )
    console.log('edges', this.edges)
  }

  buildRotationPattern() {
    this.planes.forEach((el,i) => {
      if(el.classList.contains('left')) {
        this.rotPat.push(1)
      } else if (el.classList.contains('back')) {
        this.rotPat.push(2)
      } else if(el.classList.contains('right')) {
        this.rotPat.push(3)
      } else {
        this.rotPat.push(0)
      }
    })
    console.log('rotation pattern', this.rotPat)
  }


  constructSlides() {
    this.planes.forEach((el,i) => {
      const width = el.clientWidth
      const height = el.clientHeight

      switch (this.rotPat[i]) {
        case 1: this.rotateLeft(el, i, width)
          break
        case 2: this.pushBack(el, i, width)
          break
        case 3: this.rotateRight(el, i, width)
      }
    })
  }


  rotateLeft(el, index, width) {
    const angle = deg2rad(90) - Math.acos(this.depth / width)
    el.style.transform = `translateX(${this.edges[index -1]}px) rotateY(${angle}rad)`

    console.log('rotate left', width, angle)
  }

  pushBack(el, index, width) {
    el.style.transform = `translateX(${this.edges[index - 1]}px) translateZ(-${this.depth}px)`

    console.log('push back', width)
  }

  rotateRight(el, index, width) {
    const angle = deg2rad(90) - Math.acos(this.depth / width)
    el.style.transform = `translateX(${this.edges[index -1]}px) rotateY(-${angle}rad)`

    console.log('rotate left', width, angle)
  }
}





window.onload = () => {
  new App()
}