import * as THREE from 'three'

export default class {
  constructor({index, element, geometry, scene, viewport}) {
    this.index = index
    this.element = element
    this.geometry = geometry
    this.scene = scene
    this.viewport = viewport

    this.createMesh()
  }

  createMesh() {
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true} )
    const plane = new THREE.Mesh( this.geometry, material )
    const width = this.element.naturalWidth / window.innerWidth
    const height = this.element.naturalHeight / window.innerHeight

    const vertices = new Float32Array( this.verticesCreator(width, height) )
    
    plane.geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ))


    // console.log(this.verticesCreator(width,height))
    // console.log([width, height, this.index, plane.geometry.attributes.position])
    this.scene.add(plane)
  }

  verticesCreator(width, height) {
    let arr = []

    arr = [
      width * -1, height * -1, 0,
      width, height, 0,
      width, height * -1, 0,

      width, height, 0,
      width * -1, height, 0,
      width * -1, height * -1, 0
    ]

    return arr
  }
}