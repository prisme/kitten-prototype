import * as THREE from 'three'
import { CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

let H = 1.4
let prevW = 0

export default class {
  constructor({index, element, geometry, scene, viewport, geoType}) {
    this.index = index
    this.element = element
    this.geometry = geometry
    this.scene = scene
    this.viewport = viewport
    this.geoType = geoType

    this.createMesh()
  }

  createMesh() {
    // const material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true} )
    // const plane = new THREE.Mesh( this.geometry, material )
    const height = H
    const mulratio = H / (this.element.naturalHeight)
    const width = (this.element.naturalWidth) * mulratio
    // const vertices = new Float32Array( this.verticesCreator(width, height, this.geoType) )

    
    // plane.geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ))
    
    // plane.scale.set(width, height)
    // plane.position.set(width + (prevW * 2), 0, 0)

    // const pos = {
    //   x: plane.position.x,
    //   y: plane.position.y,
    //   z: plane.position.z
    // }
    
    // prevW += width
    const image = this.element.src
    const plane = new CSS3DSprite( this.element.cloneNode() )


    console.log([image, plane])
    
    this.scene.add(plane)
  }

  verticesCreator(width, height, type) {
    const arrC = [
      -1, -1, 0,   1, 1, 0,   1, -1, 0,
      1, 1, 0,   -1, 1, 0,   -1, -1, 0
    ]

    const arrL = [
      -1, -1, 0,   1, 1, 0,   1, -1, 0,
      1, 1, 0,    -1, 1, 0,   -1, -1, 0
    ]

    const arrs = [arrC, arrL]

    return arrs[type]
  }
}