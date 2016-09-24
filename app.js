/* global THREE */

class GLML extends HTMLElement {
  constructor() {
    super()

    this.ver = "1.0"
    this.width = 0
    this.height = 0

    this.root = this.scene = this.renderer = this.camera = this._observer =null
  }

  bindAttrs2Props() {
    this.ver = this.getAttribute('ver') || 100
    this.width = this.getAttribute('width') || 0
    this.height = this.getAttribute('height') || 0
  }

  render() {
    for(const node of this.children) {
      if (node.glAnimate) {
        node.glAnimate()
      }
    }

    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(ts => this.render(ts))
  }

  _createCamera() {
    const fov = this.getAttribute('camera') || 0

    return new THREE.PerspectiveCamera(fov, this.width / this.height, 1, 1000)
  }

  _initGL() {
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer()
    this.camera = this._createCamera()
    this.camera.position.z = 3

    if (this.hasAttribute('clearColor')) {
      this.renderer.setClearColor(parseInt(this.getAttribute('clearColor').slice(1), 16))
    }

    this.renderer.setSize(this.width, this.height)
  }

  _initDOM() {
    if (!this.root) {
      this.root = this.createShadowRoot()
    }

    this.root.appendChild(this.renderer.domElement)
  }

  _watchChild() {
    this.addEventListener('gl-init', e => {
      e.preventDefault()
      e.stopPropagation()

      e.target.gl.rotation.y = 0.65
      e.target.gl.rotation.x = 0.35

      this.scene.add(e.target.gl)
      this.renderer.render(this.scene, this.camera)
    })
  }

  createdCallback() {
    this.bindAttrs2Props()
    this._initGL()
    this._watchChild()
    this._initDOM()
  }

  attachedCallback() {
    this.render()
  }
}

class AbstractGLElement extends HTMLElement {
  constructor() {
    super()

    this._gl = null
  }

  get gl() { return this._gl }

  glAnimate() { return false }

  attachedCallback() {
    this.dispatchEvent(new CustomEvent('gl-init', { bubbles: true }))
  }
}

class GLBox extends AbstractGLElement {
  glAnimate() {
    this._gl.rotation.x += 0.025
    this._gl.rotation.y += 0.04

    return true
  }

  createdCallback() {
    const x = parseInt(this.getAttribute('x'))
    const y = parseInt(this.getAttribute('y'))
    const z = parseInt(this.getAttribute('z'))
    const color = parseInt(this.getAttribute('material').slice(1), 16)
    const geometry = new THREE.BoxGeometry( x, y, z )

    var materials = [
        new THREE.MeshLambertMaterial( { opacity: 0.6, color: 0x44ff44, transparent: true } ),
        new THREE.MeshBasicMaterial( { color, wireframe: true } )
      ]

    this._gl = THREE.SceneUtils.createMultiMaterialObject(geometry, materials)
    this._gl.castShadow = this.hasAttribute('shadow')
  }
}

const LIGHTS = {
  AMBIENT: "ambient",
  DIRECTIONAL: "directional",
  HEMISPHERE: "hemisphere",
  POINT: "point",
  SPOT: "spot"
}

class GLLight extends AbstractGLElement {
  createdCallback() {
    const x = parseInt(this.getAttribute('x'))
    const y = parseInt(this.getAttribute('y'))
    const z = parseInt(this.getAttribute('z'))
    const type = this.getAttribute('type') || LIGHTS.SPOT
    const color = parseInt(this.getAttribute('color').slice(1), 16)

    if (type == LIGHTS.SPOT) {
      this._gl = new THREE.SpotLight( color )
      this._gl.position.set( x, y, z )
      this._gl.castShadow = this.hasAttribute('shadow')
    }
  }
}

document.registerElement("gl-ml", GLML)
document.registerElement("gl-box", GLBox)
document.registerElement("gl-light", GLLight)
