import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'

const gltfPath = './gltfs/01.gltf'

/**
 * Colors
 */
const colors = {
  floorMaterial: 0xffffff,
  pointLightRed: 0xff0000,
  pointLightGreen: 0x00ff00,
  spotlight: 0xffffff,
  room: 0x2121ff,
  backButton: 0xff0000
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * Groups
 */
const estimatedCapsuleCapSegmentHeight = 2.1
const floorPositionY = -10 - estimatedCapsuleCapSegmentHeight

const room = new THREE.Group()
room.position.y = floorPositionY
scene.add(room)

const showcase = new THREE.Group()
showcase.position.y = floorPositionY
scene.add(showcase)

const controlPanelText = new THREE.Group()
scene.add(controlPanelText)

const backButton = new THREE.Group()
scene.add(backButton)

const controlPanelButton = new THREE.Group()
scene.add(controlPanelButton)

/**
 * Stats
 */
const stats = Stats()
stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0px'
document.body.appendChild(stats.domElement)

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 325)

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

/**
 * Composer and outline pass
 */
const composer = new EffectComposer(renderer)
composer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const outlinePass = new OutlinePass(new THREE.Vector2(sizes.width, sizes.height), scene, camera)
outlinePass.pulsePeriod = 2
composer.addPass(outlinePass)

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
controls.minDistance = 2

/**
 * Loading Manager
 */
const loadingManager = new THREE.LoadingManager()
const loadingAnimationContainer = document.querySelector('.loading-animation-container')
const progressBar = document.querySelector('.bar')
const progressAnimationPercentage = document.getElementById('loading-animation-percentage')
progressAnimationPercentage.textContent = '0%'

loadingManager.onStart = () => {
  console.log('Loading start')
}

loadingManager.onProgress = (url, loaded, total) => {
  const percent = Math.ceil((loaded / total) * 100) + '%'
  progressBar.style.width = percent
  progressAnimationPercentage.textContent = percent
}

loadingManager.onLoad = () => {
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('click', onClick, false)

  setTimeout(() => {
    loadingAnimationContainer.style.display = 'none'

    window.requestAnimationFrame(tick)

    gsap.fromTo(camera.position, { x: -25, y: 25, z: 25 }, {
      x: camera.position.x,
      y: initialCameraPositionY,
      z: initialCameraPositionZ,
      duration: 2,
      ease: 'power1.inOut',
      onStart: () => {
        controls.enableRotate = false
        controls.enableZoom = false
      },
      onComplete: () => {
        controls.enableRotate = true
        controls.enableZoom = true
      }
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
const floorTextureNormal = textureLoader.load('./textures/sl2qedtp_8K_Normal.jpg')
const standTextureNormal = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_normal.png')
const standTexture = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_albedo.png')
const standTextureRoughness = textureLoader.load('./textures/TexturesCom_Marble_TilesSquare_512_roughness.png')

/**
 * glTF Loader
 */
const gltfLoader = new GLTFLoader(loadingManager)

/**
 * Listeners
 */
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  composer.setSize(sizes.width, sizes.height)
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

/**
 * Light
 */
const pointLightsCount = 2

for (let i = 0; i < pointLightsCount; i++) {
  const pointLight = new THREE.PointLight(colors.pointLightGreen, 0.5, 0, 2)
  pointLight.position.set((Math.random() - 0.5) * 50, Math.random() * 5, (Math.random() - 0.5) * 50)
  scene.add(pointLight)
}

for (let i = 0; i < pointLightsCount; i++) {
  const pointLight = new THREE.PointLight(colors.pointLightRed, 0.5, 0, 2)
  pointLight.position.set((Math.random() - 0.5) * 50, Math.random() * 10, (Math.random() - 0.5) * 50)
  scene.add(pointLight)
}

const spotLights = []

const spotLightAmbient = new THREE.SpotLight(colors.spotlight, 0.512)
spotLightAmbient.position.set(6, -149, -49)
scene.add(spotLightAmbient)

const spotLightRight = new THREE.SpotLight(colors.spotlight)
spotLightRight.position.set(15, 15, 15)
spotLights.push(spotLightRight)

const spotLightLeft = new THREE.SpotLight(colors.spotlight)
spotLightLeft.position.set(-15, 15, 15)
spotLights.push(spotLightLeft)

const spotLightFront = new THREE.SpotLight(colors.spotlight, 0.5)
spotLightFront.position.set(0, 250, 0)
spotLights.push(spotLightFront)

/**
 * Walls and Floor
 */
const roomGeometry = new THREE.PlaneBufferGeometry(wallAndFloorDimension, wallAndFloorDimension / 2)
const floorGeometry = new THREE.PlaneBufferGeometry(wallAndFloorDimension, wallAndFloorDimension)

const floorMaterial = new THREE.MeshStandardMaterial({
  color: colors.floorMaterial,
  metalness: 0.65,
  roughness: 0,
  normalMap: floorTextureNormal
})

const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -Math.PI / 2

room.add(floor)

const roomMaterial = new THREE.MeshPhysicalMaterial({
  color: colors.room,
  metalness: 1,
  roughness: 0.644
})

const ceiling = new THREE.Mesh(floorGeometry, roomMaterial)
ceiling.position.y = wallAndFloorDimension / 2
ceiling.rotation.x = Math.PI / 2

room.add(ceiling)

const wallBehind = new THREE.Mesh(roomGeometry, roomMaterial)
wallBehind.position.y = wallAndFloorDimension / 4
wallBehind.position.z = -wallAndFloorDimension / 2
room.add(wallBehind)

const wallFront = new THREE.Mesh(roomGeometry, roomMaterial)
wallFront.position.y = wallAndFloorDimension / 4
wallFront.position.z = wallAndFloorDimension / 2
wallFront.rotation.x = Math.PI
room.add(wallFront)

const wallLeft = new THREE.Mesh(roomGeometry, roomMaterial)
wallLeft.position.x = -wallAndFloorDimension / 2
wallLeft.position.y = wallAndFloorDimension / 4
wallLeft.rotation.y = Math.PI / 2
room.add(wallLeft)

const wallRight = new THREE.Mesh(roomGeometry, roomMaterial)
wallRight.position.x = wallAndFloorDimension / 2
wallRight.position.y = wallAndFloorDimension / 4
wallRight.rotation.y = -Math.PI / 2
room.add(wallRight)

const wallTop = new THREE.Mesh(roomGeometry, roomMaterial)
wallTop.position.y = wallAndFloorDimension
wallTop.rotation.x = Math.PI / 2
room.add(wallTop)

const baseBoardHeight = 5

const baseBoardGeometry = new THREE.BoxBufferGeometry(wallAndFloorDimension, baseBoardHeight, 0.1, 64, 64)
const baseBoardMaterial = new THREE.MeshStandardMaterial({
  metalness: 1,
  roughness: 0.388
})

const baseBoardCount = 4

for (let i = 0; i < baseBoardCount; i++) {
  const baseBoard = new THREE.Mesh(baseBoardGeometry, baseBoardMaterial)
  baseBoard.position.set(i === 2 ? -wallAndFloorDimension / 2 : i === 3 ? wallAndFloorDimension / 2 : 0, baseBoardHeight / 2, i === 0 ? -wallAndFloorDimension / 2 : i === 1 ? wallAndFloorDimension / 2 : 0)

  baseBoard.rotation.y = (i === 2 || i === 3) ? Math.PI / 2 : 0

  room.add(baseBoard)
}

/**
 * Showcase
 */
const standMaterial = new THREE.MeshStandardMaterial({
  map: standTexture,
  normalMap: standTextureNormal,
  roughnessMap: standTextureRoughness
})

const boxHeight = 0.3
const capsuleBoxGeometry = new THREE.BoxBufferGeometry(5, boxHeight, 5)
const capsuleBox = new THREE.Mesh(capsuleBoxGeometry, standMaterial)
capsuleBox.translateY(boxHeight / 2)
showcase.add(capsuleBox)

const capsuleCylinderHeight = 7
const capsuleCylinderGeometry = new THREE.CylinderBufferGeometry(2, 1, capsuleCylinderHeight, 32, 32)
const capsuleCylinder = new THREE.Mesh(capsuleCylinderGeometry, standMaterial)
capsuleCylinder.translateY(capsuleCylinderHeight / 2)
capsuleCylinder.position.y = boxHeight + capsuleCylinderHeight / 2
showcase.add(capsuleCylinder)

const modelCapsuleGeometryLenght = 5
const modelCapsuleGeometry = new THREE.CapsuleGeometry(3, modelCapsuleGeometryLenght, 64, 64)

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

const modelCapsule = new THREE.Mesh(modelCapsuleGeometry, lowQualityCapsuleMaterial)
modelCapsule.position.y = capsuleCylinderHeight + modelCapsuleGeometryLenght / 2 + estimatedCapsuleCapSegmentHeight + boxHeight
showcase.add(modelCapsule)

/**
 * Control Panel
 */
const controlPanelWidth = 24
const controlPanelHeight = 8
const controlPlaneGeometry = new THREE.BoxBufferGeometry(controlPanelWidth, controlPanelHeight, 1.1)
const controlPanelMaterial = standMaterial

const controlPanel = new THREE.Mesh(controlPlaneGeometry, controlPanelMaterial)
controlPanel.position.x = 50
controlPanel.position.y = 30
controlPanel.position.z = 50
controlPanel.rotation.y = Math.atan(controlPanel.position.z / controlPanel.position.x)
controlPanel.rotateOnWorldAxis(new THREE.Vector3(1, 0, -1).normalize(), -Math.atan(controlPanel.position.y / controlPanel.position.z))

scene.add(controlPanel)

/**
 * Back button
 */
const backButtonGeometryWidth = 3
const backButtonGeometryHeight = 1.5

const backButtonGeometry = new THREE.BoxBufferGeometry(backButtonGeometryWidth, backButtonGeometryHeight, 0.1)

const backButtonMaterial = new THREE.MeshMatcapMaterial({
  color: colors.backButton
})

const padding = 0.5

const backButtonBackground = new THREE.Mesh(backButtonGeometry, backButtonMaterial)
backButtonBackground.position.x = controlPanelWidth / 2 - backButtonGeometryWidth / 2 - padding
backButtonBackground.position.y = -controlPanelHeight / 2 + backButtonGeometryHeight / 2 + padding
backButtonBackground.position.z = 0.6

/**
 * Control panel button
 */
const controlPanelButtonGeometryWidth = 6
const controlPanelButtonGeometryHeight = 2

const controlPanelButtonBackgroundGeometry = new THREE.BoxBufferGeometry(controlPanelButtonGeometryWidth, controlPanelButtonGeometryHeight, 0.2)
const controlPanelButtonBackground = new THREE.Mesh(controlPanelButtonBackgroundGeometry, standMaterial)

const controlPanelButtonCylinderHeight = -floorPositionY - controlPanelButtonGeometryHeight / 2 - 4
const controlPanelButtonCylinderGeometry = new THREE.CylinderBufferGeometry(0.1, 0.05, controlPanelButtonCylinderHeight, 32, 32)
const controlPanelButtonCylinder = new THREE.Mesh(controlPanelButtonCylinderGeometry, standMaterial)
controlPanelButtonCylinder.position.y = floorPositionY + controlPanelButtonCylinderHeight / 2 + boxHeight / 2
controlPanelButtonCylinder.position.x = 8
scene.add(controlPanelButtonCylinder)

const controlPanelBoxGeometry = new THREE.BoxBufferGeometry(2, boxHeight, 2)
const controlPanelBox = new THREE.Mesh(controlPanelBoxGeometry, standMaterial)
controlPanelBox.translateY(boxHeight / 2)
controlPanelBox.position.y = boxHeight + floorPositionY
controlPanelBox.position.x = 8
scene.add(controlPanelBox)

const toggleSwitches = []

const fontLoader = new FontLoader(loadingManager)
fontLoader.load('./fonts/droid_sans_regular.typeface.json', (font) => {
  const textMaterial = new THREE.MeshToonMaterial()

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
    const spotlightTextGeometry = new TextGeometry(i === rowCount - 1 ? 'High Quality' : i === rowCount - 2 ? 'Spotlight Ambient' : i === rowCount - 3 ? 'Spotlight Left' : 'Spotlight Right', {
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

    const capsuleOffset = 0

    capsule.position.x = capsuleWidth / 2 + capsuleOffset
    capsule.position.y = spotlightText.position.y + capsuleRadius / 2
    capsule.position.z = 0.6
    capsule.rotation.z = -Math.PI / 2

    const sphrereGeometryRadius = 0.2
    const sphereGeometry = new THREE.SphereGeometry(sphrereGeometryRadius, 8, 8)
    const sphere = new THREE.Mesh(sphereGeometry, textMaterial)

    sphere.position.x = sphrereGeometryRadius / 2 + capsuleOffset
    sphere.position.y = spotlightText.position.y + capsuleRadius / 2
    sphere.position.z = 0.6

    const toggle = function () {
      this.active = !this.active

      if (this.index === rowCount - 1) {
        if (this.active) {
          modelCapsule.material = highQualityCapsuleMaterial
        } else {
          modelCapsule.material = lowQualityCapsuleMaterial
        }
      } else {
        this.active ? scene.add(spotLights[this.index]) : scene.remove(spotLights[this.index])
      }

      const newPositionX = this.active ? capsuleWidth - sphrereGeometryRadius / 2 + capsuleOffset : sphrereGeometryRadius / 2 + capsuleOffset

      gsap.to(sphere.position, {
        x: newPositionX,
        duration: 0.5,
        ease: 'power1.inOut'
      })
    }

    const toggleSwitch = new THREE.Group()
    toggleSwitch.add(capsule, sphere)

    toggleSwitches.push({
      toggleSwitch,
      index: i,
      active: false,
      toggle
    })

    controlPanelText.add(spotlightText, toggleSwitch)
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
  backButtonText.position.z = 0.61

  backButton.add(backButtonBackground, backButtonText)
  backButton.position.set(controlPanel.position.x, controlPanel.position.y, controlPanel.position.z)
  backButton.rotation.y = Math.atan(controlPanelText.position.z / controlPanelText.position.x)
  backButton.rotateOnWorldAxis(new THREE.Vector3(1, 0, -1).normalize(), -Math.atan(controlPanelText.position.y / controlPanelText.position.z))

  /**
   * Control panel button
   */
  const controlPanelButtonTextGeometry = new TextGeometry('Control Panel', {
    font,
    size: 0.5,
    height: 0.1,
    curveSegments: 12
  })

  controlPanelButtonTextGeometry.center()

  const controlPanelButtonText = new THREE.Mesh(controlPanelButtonTextGeometry, textMaterial)
  controlPanelButtonText.position.z = 0.1

  controlPanelButton.add(controlPanelButtonBackground, controlPanelButtonText)
  controlPanelButton.position.set(8, -5, 0)
  controlPanelButton.rotateX(-Math.PI / 8)
})

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function onPointerMove (event) {
  pointer.x = (event.clientX / sizes.width) * 2 - 1
  pointer.y = -(event.clientY / sizes.height) * 2 + 1

  checkForObjectHover()
}

/**
   *  Animation loop
   */
const clock = new THREE.Clock()

const tick = () => {
  stats.update()

  // Composer
  composer.render()

  // Controls
  controls.update()

  // Model animation
  model.position.y = 0.25 * Math.sin(clock.getElapsedTime() * 2)

  // Control panel animation
  controlPanel.position.y = controlPanel.position.y + 0.01 * Math.sin(clock.getElapsedTime() * 2)
  controlPanelText.position.y = controlPanelText.position.y + 0.01 * Math.sin(clock.getElapsedTime() * 2)
  backButton.position.y = backButton.position.y + 0.01 * Math.sin(clock.getElapsedTime() * 2)
  window.requestAnimationFrame(tick)
}

function checkForObjectHover () {
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length) {
    switch (intersects[0].object.parent) {
      case controlPanelButton:
        outlinePass.selectedObjects = [controlPanelButtonBackground]
        break
      case backButton:
        outlinePass.selectedObjects = [backButton]
        break
      case toggleSwitches[0].toggleSwitch:
        outlinePass.selectedObjects = [toggleSwitches[0].toggleSwitch]
        break
      case toggleSwitches[1].toggleSwitch:
        outlinePass.selectedObjects = [toggleSwitches[1].toggleSwitch]
        break
      case toggleSwitches[2].toggleSwitch:
        outlinePass.selectedObjects = [toggleSwitches[2].toggleSwitch]
        break
      case toggleSwitches[3].toggleSwitch:
        outlinePass.selectedObjects = [toggleSwitches[3].toggleSwitch]
        break
      default:
        outlinePass.selectedObjects = []
        break
    }
  }
}

function onClick () {
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length) {
    if (intersects[0].object.parent === controlPanelButton) {
      gsap.to(camera.position, {
        x: controlPanel.position.x + 10,
        y: controlPanel.position.y + 25,
        z: controlPanel.position.z + 10,
        duration: 1.5,
        onStart: () => {
          window.removeEventListener('click', onClick, false)
          outlinePass.selectedObjects = []
          controls.enableRotate = false
          controls.enableZoom = false

          gsap.to(controls.target, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1.5,
            ease: 'power1.inOut',
            onComplete: () => {
            }
          })
        },
        onComplete: () => {
          window.addEventListener('click', onClick, false)
        },
        ease: 'power1.inOut'
      })
    } else if (intersects[0].object.parent === backButton) {
      gsap.to(camera.position, {
        x: 0,
        y: initialCameraPositionY,
        z: initialCameraPositionZ + 50,
        duration: 1,
        onStart: () => {
          window.removeEventListener('click', onClick, false)
          outlinePass.selectedObjects = []
          gsap.to(controls.target, {
            x: model.position.x,
            y: model.position.y,
            z: model.position.z,
            duration: 1.5,
            ease: 'power1.inOut'
          })
        },
        onComplete: () => {
          gsap.to(camera.position, {
            x: 0,
            y: initialCameraPositionY,
            z: initialCameraPositionZ,
            duration: 1.5,
            ease: 'power1.inOut',
            onComplete: () => {
              controls.enableRotate = true
              controls.enableZoom = true
              window.addEventListener('click', onClick, false)
            }
          })
        },
        ease: 'power1.inOut'
      })
    }

    const toggleSwitchIndex = toggleSwitches.map(toggleSwitch => toggleSwitch.toggleSwitch).indexOf(intersects[0].object.parent)

    if (toggleSwitchIndex > -1) {
      toggleSwitches[toggleSwitchIndex].toggle()
    }
  }
}
