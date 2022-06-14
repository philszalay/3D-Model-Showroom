import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import Stats from 'three/examples/jsm/libs/stats.module'

const gltfPath = './gltfs/01.gltf'
const hdrPath = './hdris/belfast_farmhouse_4k.hdr'

/**
 * Loading Manager
 */
const loadingManager = new THREE.LoadingManager()

loadingManager.onStart = () => {
  console.log('Loading started')
}

loadingManager.onProgress = () => {
  console.log('Loading progress')
}

loadingManager.onLoad = () => {
  console.log('Loaded')
}

loadingManager.onError = (e) => {
  console.log('Error', e)
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// glTF
const loader = new GLTFLoader(loadingManager)

// Stats
const stats = Stats()
stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0px'
document.body.appendChild(stats.domElement)

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)

const initialCameraPositionZ = 5
camera.position.z = initialCameraPositionZ
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.05

/**
 * Listeners
 */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}, false)

window.addEventListener('dblclick', () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
})

// Load a glTF resource
loader.load(
  // resource URL
  gltfPath,
  // called when the resource is loaded
  function (gltf) {
    scene.add(gltf.scene)

    // Intro animation
    gsap.fromTo(camera.position, { x: -25, y: 25, z: 25 }, { x: camera.position.x, y: 0, z: initialCameraPositionZ, duration: 2 })
    // gltf.animations // Array<THREE.AnimationClip>
    // gltf.scene // THREE.Group
    // gltf.scenes // Array<THREE.Group>
    // gltf.cameras // Array<THREE.Camera>
    // gltf.asset // Object
  }
)

const pmremGenerator = new THREE.PMREMGenerator(renderer)
pmremGenerator.compileEquirectangularShader()

new RGBELoader(loadingManager)
  .setDataType(THREE.UnsignedByteType)
  .load(hdrPath, function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture

    // scene.background = envMap;
    scene.environment = envMap

    texture.dispose()
    pmremGenerator.dispose()
  })

const tick = () => {
  stats.update()

  // Render
  renderer.render(scene, camera)

  // Controls
  controls.update()

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
