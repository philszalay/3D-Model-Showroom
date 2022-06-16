import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import * as dat from 'dat.gui'

const gltfPath = './gltfs/01.gltf'

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

const controlPanelText = new THREE.Group()
scene.add(controlPanelText)

const backButton = new THREE.Group()
scene.add(backButton)

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
 * Animate
 */
const controls = new OrbitControls(camera, canvas)
controls.enablePan = false
controls.enableDamping = true
controls.dampingFactor = 0.05

const wallAndFloorDimension = 250

controls.maxPolarAngle = Math.PI / 1.9
controls.maxDistance = wallAndFloorDimension / 2
controls.minDistance = 1

/**
 * Loading Manager
 */
const loadingManager = new THREE.LoadingManager()
const loadingAnimationContainer = document.querySelector('.loading-animation-container')
const progressBar = document.getElementById('progress-bar')

loadingManager.onStart = () => {
  console.log('Loading start')
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
 * Textures
 */
const textureLoader = new THREE.TextureLoader(loadingManager)
const standTexture = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_albedo.png')
const standTextureNormal = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_normal.png')
const standTextureRoughness = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_roughness.png')
const floorTextureNormal = textureLoader.load('./textures/sl2qedtp_8K_Normal.jpg')

/**
 * glTF Loader
 */
const gltfLoader = new GLTFLoader(loadingManager)

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
const roomGeometry = new THREE.PlaneBufferGeometry(wallAndFloorDimension, wallAndFloorDimension)

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
wallBehind.position.y = wallAndFloorDimension / 2
wallBehind.position.z = -wallAndFloorDimension / 2
room.add(wallBehind)

const wallFront = new THREE.Mesh(roomGeometry, roomMaterial)
wallFront.position.y = wallAndFloorDimension / 2
wallFront.position.z = wallAndFloorDimension / 2
wallFront.rotation.x = Math.PI
room.add(wallFront)

const wallLeft = new THREE.Mesh(roomGeometry, roomMaterial)
wallLeft.position.x = -wallAndFloorDimension / 2
wallLeft.position.y = wallAndFloorDimension / 2
wallLeft.rotation.y = Math.PI / 2
room.add(wallLeft)

const wallRight = new THREE.Mesh(roomGeometry, roomMaterial)
wallRight.position.x = wallAndFloorDimension / 2
wallRight.position.y = wallAndFloorDimension / 2
wallRight.rotation.y = -Math.PI / 2
room.add(wallRight)

const wallTop = new THREE.Mesh(roomGeometry, roomMaterial)
wallTop.position.y = wallAndFloorDimension
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

const lowQualityCapsuleMaterial = new THREE.MeshPhysicalMaterial({
  metalness: 1,
  roughness: 0.1,
  transparent: true,
  opacity: 0.2,
  side: THREE.DoubleSide
})

const highQualityCapsuleMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0,
  transmission: 1,
  thickness: 0.7,
  side: THREE.DoubleSide
})

const modelCapsule = new THREE.Mesh(capsuleGeometry, highQualityCapsuleMaterial)
modelCapsule.position.y = cylinderHeight + capsuleGeometryLenght / 2 + estimatedCapsuleCapSegmentHeight + boxHeight
modelCapsule.castShadow = true
showcase.add(modelCapsule)

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
showcaseFolder.add(highQualityCapsuleMaterial, 'roughness', 0, 1, 0.001)
showcaseFolder.add(highQualityCapsuleMaterial, 'metalness', 0, 1, 0.001)
showcaseFolder.add(highQualityCapsuleMaterial, 'thickness', 0, 1, 0.001)

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
const controlPanelWidth = 24
const controlPanelHeight = 8

const controlPlaneGeometry = new THREE.BoxBufferGeometry(controlPanelWidth, controlPanelHeight, 1)
const controlPanelMaterial = new THREE.MeshStandardMaterial({
  color: 'grey'
})

const controlPanel = new THREE.Mesh(controlPlaneGeometry, controlPanelMaterial)
controlPanel.position.x = 50
controlPanel.position.y = 30
controlPanel.position.z = 50
controlPanel.rotation.y = Math.atan(controlPanel.position.z / controlPanel.position.x)
controlPanel.rotateOnWorldAxis(new THREE.Vector3(1, 0, -1).normalize(), -Math.atan(controlPanel.position.y / controlPanel.position.z))

scene.add(controlPanel)

/**
 * Back Button Background
 */
const backButtonGeometryWidth = 4
const backButtonGeometryHeight = 2

const backButtonGeometry = new THREE.BoxBufferGeometry(backButtonGeometryWidth, backButtonGeometryHeight, 0.1)

const backButtonMaterial = new THREE.MeshMatcapMaterial({
  color: 0xff0000
})

const padding = 0.5

const backButtonBackground = new THREE.Mesh(backButtonGeometry, backButtonMaterial)
backButtonBackground.position.x = controlPanelWidth / 2 - backButtonGeometryWidth / 2 - padding
backButtonBackground.position.y = -controlPanelHeight / 2 + backButtonGeometryHeight / 2 + padding
backButtonBackground.position.z = 0.5

const toggleSwitches = []

const fontLoader = new FontLoader(loadingManager)
fontLoader.load('./fonts/droid_sans_regular.typeface.json', (font) => {
  const textMaterial = new THREE.MeshNormalMaterial()

  const settingsTextGeometry = new TextGeometry('Control Panel', {
    font,
    size: 1,
    height: 0.1,
    curveSegments: 12
  })

  settingsTextGeometry.computeBoundingBox()

  const settingsText = new THREE.Mesh(settingsTextGeometry, textMaterial)

  settingsText.position.x = -(settingsTextGeometry.boundingBox.max.x - settingsTextGeometry.boundingBox.min.x) / 2
  settingsText.position.y = 2.5
  settingsText.position.z = 0.5

  controlPanelText.add(settingsText)

  const rowCount = 4

  for (let i = 0; i < rowCount; i++) {
    const spotlightTextGeometry = new TextGeometry(i === rowCount - 1 ? 'Low Quality' : 'Spotlight ' + (rowCount - i), {
      font,
      size: 0.5,
      height: 0.1,
      curveSegments: 12
    })

    spotlightTextGeometry.computeBoundingBox()

    const spotlightText = new THREE.Mesh(spotlightTextGeometry, textMaterial)
    spotlightText.position.x = -controlPanelWidth / 2 + padding
    spotlightText.position.y = -controlPanelHeight / 2 + (spotlightTextGeometry.boundingBox.max.y - settingsTextGeometry.boundingBox.min.y) / 2 + i + padding
    spotlightText.position.z = 0.5

    const capsuleMaterial = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.2
    })

    const capsuleWidth = 1
    const capsuleRadius = 0.3
    const capsuleGeometry = new THREE.CapsuleGeometry(capsuleRadius, capsuleWidth, 8, 8)

    const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial)

    capsule.position.x = capsuleWidth / 2
    capsule.position.y = spotlightText.position.y + capsuleRadius / 2
    capsule.position.z = 0.5
    capsule.rotation.z = -Math.PI / 2

    const sphrereGeometryRadius = 0.2
    const sphereGeometry = new THREE.SphereGeometry(sphrereGeometryRadius, 8, 8)
    const sphere = new THREE.Mesh(sphereGeometry, textMaterial)

    sphere.position.x = sphrereGeometryRadius / 2
    sphere.position.y = spotlightText.position.y + capsuleRadius / 2
    sphere.position.z = 0.5

    const toggle = function () {
      this.active = !this.active

      if (this.index === rowCount - 1) {
        if (this.active) {
          console.log('new material')
          modelCapsule.material = lowQualityCapsuleMaterial
        } else {
          modelCapsule.material = highQualityCapsuleMaterial
        }
      } else {
        this.active ? scene.add(spotLights[this.index]) : scene.remove(spotLights[this.index])
      }

      const newPositionX = this.active ? capsuleWidth - sphrereGeometryRadius / 2 : sphrereGeometryRadius / 2
      gsap.to(sphere.position, {
        x: newPositionX,
        y: sphere.position.y,
        z: sphere.position.z,
        duration: 0.5,
        ease: 'power1.inOut'
      })
    }

    toggleSwitches.push({
      capsule,
      sphere,
      index: i,
      active: false,
      toggle
    })

    controlPanelText.add(spotlightText, capsule, sphere)
  }

  controlPanelText.position.set(controlPanel.position.x, controlPanel.position.y, controlPanel.position.z)
  controlPanelText.rotation.y = Math.atan(controlPanelText.position.z / controlPanelText.position.x)
  controlPanelText.rotateOnWorldAxis(new THREE.Vector3(1, 0, -1).normalize(), -Math.atan(controlPanelText.position.y / controlPanelText.position.z))

  const backButtonTextGeometry = new TextGeometry('Back', {
    font,
    size: 0.5,
    height: 0.1,
    curveSegments: 12
  })

  backButtonTextGeometry.computeBoundingBox()

  const backButtonText = new THREE.Mesh(backButtonTextGeometry, textMaterial)
  backButtonText.position.x = controlPanelWidth / 2 - backButtonGeometryWidth / 2 - (backButtonTextGeometry.boundingBox.max.x - backButtonTextGeometry.boundingBox.min.x) / 2 - padding
  backButtonText.position.y = -controlPanelHeight / 2 + backButtonGeometryHeight / 2 - (backButtonTextGeometry.boundingBox.max.y - backButtonTextGeometry.boundingBox.min.y) / 2 + padding
  backButtonText.position.z = 0.5

  backButton.add(backButtonBackground, backButtonText)
  backButton.position.set(controlPanel.position.x, controlPanel.position.y, controlPanel.position.z)
  backButton.rotation.y = Math.atan(controlPanelText.position.z / controlPanelText.position.x)
  backButton.rotateOnWorldAxis(new THREE.Vector3(1, 0, -1).normalize(), -Math.atan(controlPanelText.position.y / controlPanelText.position.z))
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

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

let controlPanelFocused = false

window.addEventListener('click', () => {
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  // Control panel
  intersects.forEach((intersect) => {
    if (intersect.object === modelCapsule) {
      gsap.to(camera.position, {
        x: controlPanel.position.x + 10,
        y: controlPanel.position.y + 25,
        z: controlPanel.position.z + 10,
        duration: 1,
        onStart: () => {
          controls.enableRotate = false
          controls.enableZoom = false
        },
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

      controlPanelFocused = true
    } else if (intersect.object === backButtonBackground) {
      gsap.to(camera.position, {
        x: 0,
        y: initialCameraPositionY,
        z: initialCameraPositionZ + 50,
        duration: 1,
        onStart: () => {
          gsap.to(controls.target, {
            x: model.position.x,
            y: model.position.y,
            z: model.position.z,
            duration: 1,
            ease: 'power1.inOut'
          })
        },
        onComplete: () => {
          gsap.to(camera.position, {
            x: 0,
            y: initialCameraPositionY,
            z: initialCameraPositionZ,
            duration: 2,
            ease: 'power1.inOut',
            onComplete: () => {
              controls.enableRotate = true
              controls.enableZoom = true
            }
          })
        },
        ease: 'power1.inOut'
      })

      controlPanelFocused = false
    }

    // Toggle switches
    if (controlPanelFocused) {
      const toggleSwitchIndex = toggleSwitches.map(toggleSwitch => toggleSwitch.capsule).indexOf(intersect.object)

      if (toggleSwitchIndex > -1) {
        // Hint: Could be improved by changing the active property in the toggle function
        toggleSwitches[toggleSwitchIndex].toggle()
      }
    }
  })
}, false)
