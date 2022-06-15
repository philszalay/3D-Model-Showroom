import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as dat from 'dat.gui'

const gltfPath = './gltfs/01.gltf'

/**
 * Loading Manager
 */
const loadingManager = new THREE.LoadingManager()
const loadingAnimationContainer = document.querySelector('.loading-animation-container')
const progressBar = document.getElementById('progress-bar')

loadingManager.onStart = () => {
  console.log('Loading started')
}

loadingManager.onProgress = (url, loaded, total) => {
  progressBar.value = (loaded / total) * 100
}

loadingManager.onLoad = () => {
  setTimeout(() => {
    loadingAnimationContainer.style.display = 'none'

    tick()

    // Intro animation
    gsap.fromTo(camera.position, { x: -25, y: 25, z: 25 }, {
      x: camera.position.x,
      y: 5,
      z: initialCameraPositionZ,
      duration: 2,
      onComplete: () => {
        scene.add(hemisphereLight, spotLightLeft, spotLightRight, spotLightRightDown, spotLightFront)
      }
    })
  }, 500)
}

loadingManager.onError = (e) => {
  console.log('Error', e)
}

/**
 * Colors
 */
const colors = {
  room: 0x000000,
  hemisphereLight: 0xc5
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

/**
 * Group
 */
const estimatedCapsuleCapSegmentHeight = 2.1
const positionY = -10 - estimatedCapsuleCapSegmentHeight

const room = new THREE.Group()
room.position.y = positionY
scene.add(room)

const showcase = new THREE.Group()
showcase.position.y = positionY
scene.add(showcase)

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

const initialCameraPositionZ = 25
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
 * Textures
 */
const textureLoader = new THREE.TextureLoader(loadingManager)
const standTexture = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_albedo.png')
const standTextureNormal = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_normal.png')
const standTextureRoughness = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_roughness.png')
const floorTextureNormal = textureLoader.load('./textures/sl2qedtp_8K_Normal.jpg')

// floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
// floorTexture.repeat.set(10, 10)

// floorTextureNormal.wrapS = floorTextureNormal.wrapT = THREE.RepeatWrapping
// floorTextureNormal.repeat.set(10, 10)

// floorTextureRoughness.wrapS = floorTextureRoughness.wrapT = THREE.RepeatWrapping
// floorTextureRoughness.repeat.set(10, 10)

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

/**
 *  Load a glTF resource
 */
let model

loader.load(
  gltfPath,
  function (gltf) {
    model = gltf.scene
    scene.add(model)
  }
)

// const axisHelper = new THREE.AxesHelper(50)
// scene.add(axisHelper)

/**
 * Light
 */
const hemisphereLight = new THREE.HemisphereLight(colors.hemisphereLight, 'white', 0.25)

const pointLightsCount = 2

for (let i = 0; i < pointLightsCount; i++) {
  const pointLight = new THREE.PointLight('green', 0.5, 0, 2)
  pointLight.position.set((Math.random() - 0.5) * 50, Math.random() * 5, (Math.random() - 0.5) * 50)
  scene.add(pointLight)
}

for (let i = 0; i < pointLightsCount; i++) {
  const pointLight = new THREE.PointLight('red', 0.5, 0, 2)
  pointLight.position.set((Math.random() - 0.5) * 50, Math.random() * 10, (Math.random() - 0.5) * 50)
  scene.add(pointLight)
}

const spotLightLeft = new THREE.SpotLight(0xffffff)
spotLightLeft.position.set(-25, 5, -10)
spotLightLeft.castShadow = true
spotLightLeft.shadow.mapSize.width = 1024
spotLightLeft.shadow.mapSize.height = 1024

const spotLightRight = new THREE.SpotLight(0xffffff)
spotLightRight.position.set(25, 5, -10)
spotLightRight.castShadow = true
spotLightRight.shadow.mapSize.width = 1024
spotLightRight.shadow.mapSize.height = 1024

const spotLightRightDown = new THREE.SpotLight(0xffffff, 0.5)
spotLightRightDown.position.set(0, 100, 0)

const spotLightFront = new THREE.SpotLight(0xffffff)
spotLightFront.position.set(0, 25, -50)

/**
 * Walls and Floor
 */
const planeDimension = 250

const roomGeometry = new THREE.PlaneBufferGeometry(planeDimension, planeDimension)

const floorMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  metalness: 0.65,
  roughness: 0,
  normalMap: floorTextureNormal
})

const floor = new THREE.Mesh(roomGeometry, floorMaterial)
floor.rotation.x = -Math.PI / 2
room.add(floor)

const roomMaterial = new THREE.MeshStandardMaterial({
  color: '#9d4c4c',
  metalness: 0.578,
  roughness: 0.754
})

const wallBehind = new THREE.Mesh(roomGeometry, roomMaterial)
wallBehind.position.y = planeDimension / 2
wallBehind.position.z = -planeDimension / 2
room.add(wallBehind)

const wallFront = new THREE.Mesh(roomGeometry, roomMaterial)
wallFront.position.y = planeDimension / 2
wallFront.position.z = planeDimension / 2
wallFront.rotation.x = Math.PI
room.add(wallFront)

const wallLeft = new THREE.Mesh(roomGeometry, roomMaterial)
wallLeft.position.x = -planeDimension / 2
wallLeft.position.y = planeDimension / 2
wallLeft.rotation.y = Math.PI / 2
room.add(wallLeft)

const wallRight = new THREE.Mesh(roomGeometry, roomMaterial)
wallRight.position.x = planeDimension / 2
wallRight.position.y = planeDimension / 2
wallRight.rotation.y = -Math.PI / 2
room.add(wallRight)

const wallTop = new THREE.Mesh(roomGeometry, roomMaterial)
wallTop.position.y = planeDimension
wallTop.rotation.x = Math.PI / 2
room.add(wallTop)

/**
 * Showcase
 */
const standMaterial = new THREE.MeshStandardMaterial({
  map: standTexture,
  normalMap: standTextureNormal,
  roughnessMap: standTextureRoughness
})

const boxHeight = 0.3
const boxGeometry = new THREE.BoxBufferGeometry(5, boxHeight, 5)
const box = new THREE.Mesh(boxGeometry, standMaterial)
box.translateY(boxHeight / 2)
showcase.add(box)

const cylinderHeight = 7
const cylinderGeometry = new THREE.CylinderBufferGeometry(2, 1, cylinderHeight, 32, 32)
const cylinder = new THREE.Mesh(cylinderGeometry, standMaterial)
cylinder.translateY(cylinderHeight / 2)
cylinder.position.y = boxHeight + cylinderHeight / 2
showcase.add(cylinder)

const capsuleGeometryLenght = 5
const capsuleGeometry = new THREE.CapsuleGeometry(3, capsuleGeometryLenght, 32, 32)
const capsuleMaterial = new THREE.MeshPhysicalMaterial({
  metalness: 0,
  roughness: 0,
  transmission: 1
})

const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial)
capsule.position.y = cylinderHeight + capsuleGeometryLenght / 2 + estimatedCapsuleCapSegmentHeight + boxHeight
showcase.add(capsule)

/**
 * Debug
 */
const gui = new dat.GUI()
const roomFolder = gui.addFolder('Room')

roomFolder
  .addColor(colors, 'room')
  .onChange(() => {
    roomMaterial.color.setHex(colors.room)
  })

roomFolder.add(floorMaterial, 'metalness', 0, 1, 0.001)
roomFolder.add(floorMaterial, 'roughness', 0, 1, 0.001)

const showcaseFolder = gui.addFolder('Showcase')
showcaseFolder.add(capsuleMaterial, 'roughness', 0, 1, 0.001)
showcaseFolder.add(capsuleMaterial, 'metalness', 0, 1, 0.001)
showcaseFolder.add(capsuleMaterial, 'thickness', 0, 1, 0.001)
showcaseFolder.add(standMaterial, 'metalness', 0, 1, 0.001)

const lightFolder = gui.addFolder('Lights')
lightFolder
  .addColor(colors, 'hemisphereLight')
  .onChange(() => {
    hemisphereLight.color.setHex(colors.hemisphereLight)
  })

lightFolder.add(hemisphereLight, 'intensity', 0, 1, 0.001)

/**
 *  Animation loop
 */
const clock = new THREE.Clock()

const tick = () => {
  stats.update()

  // Render
  renderer.render(scene, camera)

  // Controls
  controls.update()

  // Model animation
  model.position.y = 0.25 * Math.sin(clock.getElapsedTime() * 2)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}
