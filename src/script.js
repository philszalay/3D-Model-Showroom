import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import * as dat from 'dat.gui'
import { GeometryUtils, TangentSpaceNormalMap, Vector3 } from 'three'

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

    window.requestAnimationFrame(tick)

    // Intro animation
    gsap.fromTo(camera.position, { x: -25, y: 25, z: 25 }, {
      x: camera.position.x,
      y: initialCameraPositionY,
      z: initialCameraPositionZ,
      duration: 2,
      onComplete: () => {
        // scene.add(spotLightLeft, spotLightRight, spotLightRightDown, hemisphereLight)
      },
      ease: 'power1.inOut'
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

const text = new THREE.Group()
scene.add(text)

// glTF
const gltfLoader = new GLTFLoader(loadingManager)

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
const initialCameraPositionY = 5
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
// renderer.shadowMap.enabled = true

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function onPointerMove (event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
}

window.addEventListener('pointermove', onPointerMove)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader(loadingManager)
const standTexture = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_albedo.png')
const standTextureNormal = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_normal.png')
const standTextureRoughness = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_roughness.png')
const floorTextureNormal = textureLoader.load('./textures/sl2qedtp_8K_Normal.jpg')

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

gltfLoader.load(
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

const spotLights = []

const spotLightLeft = new THREE.SpotLight(0xffffff)
spotLightLeft.position.set(-15, 25, 10)
spotLightLeft.castShadow = true
spotLightLeft.shadow.mapSize.width = 1024
spotLightLeft.shadow.mapSize.height = 1024
spotLightLeft.shadow.camera.near = 1
spotLightLeft.shadow.camera.far = 75
spotLightLeft.shadow.camera.fov = 30
spotLights.push(spotLightLeft)

const spotLightRight = new THREE.SpotLight(0xffffff)
spotLightRight.position.set(15, 25, 10)
spotLightRight.castShadow = true
spotLightRight.shadow.mapSize.width = 1024
spotLightRight.shadow.mapSize.height = 1024
spotLightRight.shadow.camera.near = 1
spotLightRight.shadow.camera.far = 75
spotLights.push(spotLightRight)

const spotLightFront = new THREE.SpotLight(0xffffff)
spotLightFront.position.set(0, 15, 25)
spotLightFront.castShadow = true
spotLightFront.shadow.mapSize.width = 1024
spotLightFront.shadow.mapSize.height = 1024
spotLightFront.shadow.camera.near = 1
spotLightFront.shadow.camera.far = 75
spotLights.push(spotLightFront)

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
floor.receiveShadow = true
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
box.castShadow = true
showcase.add(box)

const cylinderHeight = 7
const cylinderGeometry = new THREE.CylinderBufferGeometry(2, 1, cylinderHeight, 32, 32)
const cylinder = new THREE.Mesh(cylinderGeometry, standMaterial)
cylinder.translateY(cylinderHeight / 2)
cylinder.position.y = boxHeight + cylinderHeight / 2
cylinder.castShadow = true
showcase.add(cylinder)

const capsuleGeometryLenght = 5
const capsuleGeometry = new THREE.CapsuleGeometry(3, capsuleGeometryLenght, 32, 32)

const capsuleMaterial = new THREE.MeshPhysicalMaterial({
  metalness: 1,
  roughness: 0.1,
  transparent: true,
  opacity: 0.2
})

// const capsuleMaterial = new THREE.MeshPhysicalMaterial({
//   metalness: 0,
//   roughness: 0.3,
//   transmission: 1
// })

const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial)
capsule.position.y = cylinderHeight + capsuleGeometryLenght / 2 + estimatedCapsuleCapSegmentHeight + boxHeight
capsule.castShadow = true
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
 * Control Panel
 */
const controlPanelWidth = 12
const controlPanelHeight = 8

const controlPlaneGeometry = new THREE.BoxBufferGeometry(controlPanelWidth, controlPanelHeight, 1)
const controlPanelMaterial = new THREE.MeshStandardMaterial({
  color: 'grey'
})

const controlPanel = new THREE.Mesh(controlPlaneGeometry, controlPanelMaterial)
controlPanel.position.x = 0
controlPanel.position.y = 50
controlPanel.position.z = 50
controlPanel.rotation.x = -Math.atan(controlPanel.position.y / controlPanel.position.z)

scene.add(controlPanel)

const toggleSwitches = []

const fontLoader = new FontLoader(loadingManager)
fontLoader.load('./fonts/droid_sans_regular.typeface.json', (font) => {
  const textMaterial = new THREE.MeshNormalMaterial()

  const settingsTextGeometry = new TextGeometry('Settings', {
    font,
    size: 1,
    height: 1,
    curveSegments: 12
  })

  settingsTextGeometry.computeBoundingBox()

  const settingsText = new THREE.Mesh(settingsTextGeometry, textMaterial)

  settingsText.position.x = -(settingsTextGeometry.boundingBox.max.x - settingsTextGeometry.boundingBox.min.x) / 2
  settingsText.position.y = 2.5
  settingsText.position.z = 0.1

  text.add(settingsText)

  const spotlightCount = 3
  const padding = 0.5

  for (let i = 0; i < spotlightCount; i++) {
    const spotlightTextGeometry = new TextGeometry('Spotlight ' + i, {
      font,
      size: 0.5,
      height: 1,
      curveSegments: 12
    })

    spotlightTextGeometry.computeBoundingBox()

    const spotlightText = new THREE.Mesh(spotlightTextGeometry, textMaterial)
    spotlightText.position.x = -controlPanelWidth / 2 + padding
    spotlightText.position.y = -(spotlightTextGeometry.boundingBox.max.y - settingsTextGeometry.boundingBox.min.y) / 2 - i
    spotlightText.position.z = 0.1

    const capsuleMaterial = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.2
    })

    const capsuleWidth = 1
    const capsuleGeometry = new THREE.CapsuleGeometry(0.3, capsuleWidth, 8, 8)

    const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial)
    const estimatedCapsuleCapSegmentHeight = 0.1

    capsule.position.x = controlPanelWidth / 2 - capsuleWidth - estimatedCapsuleCapSegmentHeight - padding
    capsule.position.y = -(spotlightTextGeometry.boundingBox.max.y - settingsTextGeometry.boundingBox.min.y) / 2 - i
    capsule.position.z = 0.5
    capsule.rotation.z = -Math.PI / 2

    const sphrereRadius = 0.2
    const sphereGeometry = new THREE.SphereGeometry(sphrereRadius, 8, 8)
    const sphere = new THREE.Mesh(sphereGeometry, textMaterial)

    sphere.position.x = controlPanelWidth / 2 - capsuleWidth * 1.5 - estimatedCapsuleCapSegmentHeight - padding
    sphere.position.y = -(spotlightTextGeometry.boundingBox.max.y - settingsTextGeometry.boundingBox.min.y) / 2 - i
    sphere.position.z = 0.5

    toggleSwitches.push({
      capsule,
      sphere,
      active: false,
      toggle: (index, active) => {
        active = !active

        active ? scene.add(spotLights[index]) : scene.remove(spotLights[index])

        const newPositionX = active ? controlPanelWidth / 2 - capsuleWidth * 1.5 + estimatedCapsuleCapSegmentHeight + padding - sphrereRadius : +controlPanelWidth / 2 - capsuleWidth * 1.5 - estimatedCapsuleCapSegmentHeight - padding

        gsap.to(sphere.position, {
          x: newPositionX,
          y: sphere.position.y,
          z: sphere.position.z,
          duration: 0.5,
          ease: 'power1.inOut',
          onStart: () => {

          }
        })
      }
    })

    text.add(spotlightText, capsule, sphere)
    text.position.set(controlPanel.position.x, controlPanel.position.y, controlPanel.position.z)
    text.rotation.x = -Math.atan(controlPanel.position.y / controlPanel.position.z)
  }

  const textFolder = gui.addFolder('Text')
  textFolder.add(text.rotation, 'x', 0, 10, 0.001)

  // text.rotateOnAxis(new THREE.Vector3(controlPanel.position.x, controlPanel.position.y, controlPanel.position.z), -Math.atan(controlPanel.position.y / controlPanel.position.z))
})

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

  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

let controlPanelFocused = false

window.addEventListener('click', () => {
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  // Control panel
  let controlPanelClicked = false

  intersects.forEach((intersect) => {
    if (intersect.object === controlPanel) {
      gsap.to(camera.position, {
        x: 0,
        y: controlPanel.position.y + 13,
        z: controlPanel.position.z + 13,
        duration: 2,
        onComplete: () => {
          gsap.to(controls.target, {
            x: 0,
            y: 0,
            z: 0,
            duration: 2,
            ease: 'power1.inOut'
          })
        },
        ease: 'power1.inOut'
      })

      controlPanelClicked = true
      controlPanelFocused = true
    }

    if (!controlPanelClicked && controlPanelFocused) {
      gsap.to(camera.position, {
        x: 0,
        y: initialCameraPositionY,
        z: initialCameraPositionZ,
        duration: 2,
        onStart: () => {
          gsap.to(controls.target, {
            x: model.position.x,
            y: model.position.y,
            z: model.position.z,
            duration: 2,
            ease: 'power1.inOut'
          })
        },
        ease: 'power1.inOut'
      })

      if (controlPanelFocused) {
        const toggleSwitchIndex = toggleSwitches.map(toggleSwitch => toggleSwitch.capsule).indexOf(intersect.object)

        if (toggleSwitchIndex > -1) {
          // Hint: Could be improved by changing the active property in the toggle function
          toggleSwitches[toggleSwitchIndex].toggle(toggleSwitchIndex, toggleSwitches[toggleSwitchIndex].active)
          toggleSwitches[toggleSwitchIndex].active = !toggleSwitches[toggleSwitchIndex].active
        }
      }

      controlPanelFocused = false
    }

    // Toggle switch
    console.log('control', controlPanelFocused)
  })
}, false)
