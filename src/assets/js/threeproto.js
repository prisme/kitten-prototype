import * as THREE from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Plane from './planes'


class App {
  constructor () {
    this.createRenderer()
    this.createCamera()
    this.createScene()
    this.onResize()

    this.createOrbit()


    this.createGeometry()
    this.createPlanes()

    this.update()
 
    this.addEventListeners()
  }
 
  createRenderer () {
    this.renderer = new CSS3DRenderer({
      // alpha: true,
      // antialias: true,
    })
 
    document.body.appendChild(this.renderer.domElement)
  }
 
  createCamera () {
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000 );
    this.camera.position.z = 650
  }
 
  createScene () {
    this.scene = new THREE.Scene()
  }

  createOrbit() {
    // this.controls = new OrbitControls( this.camera, this.renderer.domElement );
  }
 
  /**
   * Wheel.
   */
  onWheel (event) {
 
  }

  createGeometry () {
    this.planeGeometry = new THREE.BufferGeometry()
  }


  createPlanes() {
    let geoPat = [0,0,1]

    this.mediasElements = document.querySelectorAll('.kitten__home_slideshow-item-image')
    this.planes = Array.from(this.mediasElements).map((element, index) => {
      let plane = new Plane({
        index: index,
        element,
        geometry: this.planeGeometry,
        scene: this.scene,
        viewport: this.viewport,
        geoType: geoPat[index]
      })

      return plane
    })
  }
 
  /**
   * Resize.
   */
  onResize () {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth
    }
 
    this.renderer.setSize(this.screen.width, this.screen.height)
 
    this.camera.aspect = this.screen.width / this.screen.height
 
    const fov = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

 
    this.viewport = {
      height,
      width
    }

    this.camera.updateProjectionMatrix()
  }
 
  /**
   * Update.
   */
  update () {
    this.renderer.render(
      this.scene,
      this.camera
    )

    // this.controls.update()
 
    window.requestAnimationFrame(this.update.bind(this))
  }
 
  /**
   * Listeners.
   */
  addEventListeners () {
    window.addEventListener('resize', this.onResize.bind(this))
    window.addEventListener('mousewheel', this.onWheel.bind(this))
    window.addEventListener('wheel', this.onWheel.bind(this))
  }
}

new App()