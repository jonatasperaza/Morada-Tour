<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
const sectionRef = ref(null)

let renderer
let scene
let camera
let animationId
let clock
let blob
let modelGroup

let targetRotationX = 0
let targetRotationY = 0

const baseRotationX = 0
const baseRotationY = 0
const baseRotationZ = 0

const tiltStrength = 0.22

let width = 1
let height = 1

const gu = {
  time: { value: 0 },
  dTime: { value: 0 },
  aspect: { value: 1 },
}

class LiquidBlob {
  constructor(renderer, width, height) {
    this.renderer = renderer

    this.fbTexture = {
      value: new THREE.FramebufferTexture(width, height),
    }

    this.rtOutput = new THREE.WebGLRenderTarget(width, height)

    this.uniforms = {
      pointer: {
        value: new THREE.Vector2(10, 10),
      },
      pointerDown: {
        value: 1,
      },
      pointerRadius: {
        value: 0.18,
      },
      pointerDuration: {
        value: 2.6,
      },
    }

    this.rtScene = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        onBeforeCompile: (shader) => {
          shader.uniforms.dTime = gu.dTime
          shader.uniforms.aspect = gu.aspect
          shader.uniforms.pointer = this.uniforms.pointer
          shader.uniforms.pointerDown = this.uniforms.pointerDown
          shader.uniforms.pointerRadius = this.uniforms.pointerRadius
          shader.uniforms.pointerDuration = this.uniforms.pointerDuration
          shader.uniforms.fbTexture = this.fbTexture

          shader.fragmentShader = `
            uniform float dTime;
            uniform float aspect;
            uniform vec2 pointer;
            uniform float pointerDown;
            uniform float pointerRadius;
            uniform float pointerDuration;
            uniform sampler2D fbTexture;

            ${shader.fragmentShader}
          `.replace(
            '#include <color_fragment>',
            `
              #include <color_fragment>

              float rVal = texture2D(fbTexture, vUv).r;

              // faz o rastro antigo sumir devagar
              rVal -= clamp(dTime / pointerDuration, 0.0, 0.08);
              rVal = clamp(rVal, 0.0, 1.0);

              float f = 0.0;

              if (pointerDown > 0.5) {
                vec2 uv = (vUv - 0.5) * 2.0 * vec2(aspect, 1.0);
                vec2 mouse = pointer * vec2(aspect, 1.0);

                float dist = distance(uv, mouse);

                f = 1.0 - smoothstep(pointerRadius * 0.12, pointerRadius, dist);
              }

              // força da mancha nova
              rVal += f * 0.08;;
              rVal = clamp(rVal, 0.0, 1.0);

              diffuseColor.rgb = vec3(rVal);
            `
          )
        },
      })
    )

    this.rtScene.material.defines = {
      USE_UV: '',
    }

    this.rtCamera = new THREE.Camera()
  }

  render() {
    this.renderer.setRenderTarget(this.rtOutput)
    this.renderer.render(this.rtScene, this.rtCamera)
    this.renderer.copyFramebufferToTexture(this.fbTexture.value)
    this.renderer.setRenderTarget(null)
  }

  setPointer(x, y) {
    this.uniforms.pointer.value.set(x, y)
  }

  hidePointer() {
    this.uniforms.pointer.value.set(10, 10)
  }

  setSize(width, height) {
    this.rtOutput.setSize(width, height)

    this.fbTexture.value.dispose()
    this.fbTexture.value = new THREE.FramebufferTexture(width, height)
  }

  dispose() {
    this.rtOutput.dispose()
    this.fbTexture.value.dispose()
    this.rtScene.geometry.dispose()
    this.rtScene.material.dispose()
  }
}

function applyLiquidRevealToMaterial(material) {
  material.transparent = true

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBlob = {
      value: blob.rtOutput.texture,
    }

    shader.uniforms.uLiquidTime = gu.time

    shader.vertexShader = `
      varying vec4 vPositionProjected;

      ${shader.vertexShader}
    `.replace(
      '#include <project_vertex>',
      `
        #include <project_vertex>
        vPositionProjected = gl_Position;
      `
    )

    shader.fragmentShader = `
      uniform sampler2D uBlob;
      uniform float uLiquidTime;
      varying vec4 vPositionProjected;

      ${shader.fragmentShader}
    `.replace(
      '#include <clipping_planes_fragment>',
      `
        vec2 blobUv = ((vPositionProjected.xy / vPositionProjected.w) + 1.0) * 0.5;

        vec4 blobData = texture2D(uBlob, blobUv);

        float mask = smoothstep(0.04, 0.35, blobData.r);

        if (mask < 0.02) discard;

        #include <clipping_planes_fragment>
      `
    ).replace(
  '#include <dithering_fragment>',
  `
    #include <dithering_fragment>
  `
)
  }

  material.needsUpdate = true
}

function loadTexture(path, isColor = false) {
  const texture = new THREE.TextureLoader().load(path)

  texture.flipY = false
  texture.colorSpace = isColor
    ? THREE.SRGBColorSpace
    : THREE.NoColorSpace

  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return texture
}

function createHelmetMaterials() {
  const helmetMaterial = new THREE.MeshStandardMaterial({
    map: loadTexture('/Norris_Helmet_mat_BaseColor.webp', true),
    normalMap: loadTexture('/Norris_Helmet_mat_Normal.webp'),
    roughnessMap: loadTexture('/Norris_Helmet_mat_Roughness.webp'),
    metalnessMap: loadTexture('/Norris_Helmet_mat_Metallic.webp'),

    metalness: 1,
    roughness: 1,
    envMapIntensity: 0.9,
  })

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    map: loadTexture('/Norris_Glass_mat_BaseColor.webp', true),
    normalMap: loadTexture('/Norris_Glass_mat_Normal.webp'),
    roughnessMap: loadTexture('/Norris_Glass_mat_Roughness.webp'),
    metalnessMap: loadTexture('/Norris_Glass_mat_Metallic.webp'),

    metalness: 0.6,
    roughness: 0.18,
    transparent: true,
    opacity: 0.78,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.4,
  })

  const plasticMaterial = new THREE.MeshStandardMaterial({
    color: '#111111',
    metalness: 0.15,
    roughness: 0.42,
    envMapIntensity: 0.7,
  })

  return {
    helmetMaterial,
    glassMaterial,
    plasticMaterial,
  }
}

function loadEnvironment() {
  const hdrLoader = new HDRLoader()

  hdrLoader.load('/studio_small_08_1k--light.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping

    scene.environment = texture
  })
}

function createBackgroundPlane() {
  const geometry = new THREE.PlaneGeometry(2, 2)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uBlob: {
        value: blob.rtOutput.texture,
      },
      uTime: gu.time,
      uBaseColor: {
        value: new THREE.Color('#101400'),
      },
      uLiquidColor: {
        value: new THREE.Color('#d2ff00'),
      },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uBlob;
      uniform float uTime;
      uniform vec3 uBaseColor;
      uniform vec3 uLiquidColor;

      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        float blob = texture2D(uBlob, uv).r;
        float mask = smoothstep(0.02, 0.75, blob);

        float wave1 = sin(uv.y * 28.0 + uTime * 2.0);
        float wave2 = cos(uv.x * 22.0 - uTime * 1.7);

        float wave = (wave1 + wave2) * 0.5;

        vec3 color = mix(uBaseColor, uLiquidColor, mask);

        color += mask * wave * 0.08;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    depthWrite: false,
    depthTest: false,
  })

  const plane = new THREE.Mesh(geometry, material)

  // garante que ele fique no fundo da renderização
  plane.renderOrder = -10

  scene.add(plane)
}

function loadModel() {
  const gltfLoader = new GLTFLoader()

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('/draco/')

  gltfLoader.setDRACOLoader(dracoLoader)

  const {
    helmetMaterial,
    glassMaterial,
    plasticMaterial,
  } = createHelmetMaterials()

  gltfLoader.load(
    '/helmet-21.glb',
    (gltf) => {
      modelGroup = gltf.scene

      modelGroup.scale.setScalar(30)
      modelGroup.position.set(0, 0, 0)
      modelGroup.rotation.set(baseRotationX, baseRotationY, baseRotationZ)

      modelGroup.traverse((child) => {
        if (!child.isMesh) return

        const name = child.name.toLowerCase()

        let material

        if (name === 'helmet') {
          material = helmetMaterial.clone()
        } else if (name === 'glass') {
          material = glassMaterial.clone()
        } else if (name === 'plastic') {
          material = plasticMaterial.clone()
        } else {
          material = helmetMaterial.clone()
        }

        applyLiquidRevealToMaterial(material)

        child.material = material
      })

      scene.add(modelGroup)
    },
    undefined,
    (error) => {
      console.error('Erro ao carregar o helmet-21.glb:', error)
    }
  )
}


function initThree() {
  const section = sectionRef.value
  if (!section) return

  width = section.clientWidth
  height = section.clientHeight

  gu.aspect.value = width / height

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#101400')

  camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
  camera.position.set(0, 0.2, 6)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)

  section.appendChild(renderer.domElement)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
directionalLight.position.set(3, 5, 4)
scene.add(directionalLight)

const pointLight = new THREE.PointLight(0xb2c73a, 0.8, 10)
pointLight.position.set(-3, 2, 3)
scene.add(pointLight)

  blob = new LiquidBlob(renderer, width, height)

  createBackgroundPlane()

  loadModel()
  loadEnvironment()

  clock = new THREE.Clock()
}

function animate() {
  animationId = requestAnimationFrame(animate)

  const dt = clock.getDelta()

  gu.time.value += dt
  gu.dTime.value = dt

  blob.render()

  if (modelGroup) {
    modelGroup.rotation.x += (targetRotationX - modelGroup.rotation.x) * 0.08
    modelGroup.rotation.y += (targetRotationY - modelGroup.rotation.y) * 0.08
  }

  renderer.render(scene, camera)
}
function onPointerMove(event) {
  if (!sectionRef.value || !blob) return

  const rect = sectionRef.value.getBoundingClientRect()

  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  blob.setPointer(x, y)

  targetRotationY = baseRotationY + x * tiltStrength
  targetRotationX = baseRotationX - y * tiltStrength * 0.6
}

function onPointerLeave() {
  blob?.hidePointer()

  targetRotationX = baseRotationX
  targetRotationY = baseRotationY
}

function onResize() {
  const section = sectionRef.value
  if (!section || !renderer || !camera || !blob) return

  width = section.clientWidth
  height = section.clientHeight

  gu.aspect.value = width / height

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.75
  blob.setSize(width, height)
}

onMounted(() => {
  initThree()
  animate()

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)

  window.removeEventListener('resize', onResize)

  blob?.dispose()

  scene?.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose()

      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => mat.dispose())
      } else {
        child.material?.dispose()
      }
    }
  })

  renderer?.dispose()

  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
})
</script>

<template>
  <section
    ref="sectionRef"
    class="liquid-section"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <div class="content">
      <p>REDD BULL TE DÁ ASSSAAAAS</p>
      <h2>VERSTAPPEN É MELHOR</h2>
    </div>
  </section>
</template>

<style scoped>
.liquid-section {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #111;
}

.liquid-section :deep(canvas) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.content {
  position: absolute;
  z-index: 2;
  left: 7vw;
  bottom: 9vh;
  color: white;
  pointer-events: none;
  mix-blend-mode: difference;
}

.content p {
  margin: 0 0 12px;
  color: #b2c73a;
  font-weight: 800;
  letter-spacing: 0.2em;
}

.content h2 {
  margin: 0;
  font-size: clamp(3rem, 9vw, 8rem);
  line-height: 0.85;
}

.content span {
  display: block;
  margin-top: 20px;
  font-size: 1.1rem;
  opacity: 0.75;
}
</style>
