<script setup lang="ts">
  import gsap from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import Lenis from 'lenis'
  import * as THREE from 'three'
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  gsap.registerPlugin(ScrollTrigger)

  const canvasRef = ref<HTMLCanvasElement | null>(null)

  let lenis: Lenis | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let animationFrameId = 0

  let bookGroup: THREE.Group | null = null
  let frontCoverGroup: THREE.Group | null = null
  let pageGroups: THREE.Group[] = []

  const pageContents = [
    {
      title: 'Nossa Estante',
      subtitle: 'Livros selecionados',
      text: 'Literatura, filosofia, teologia, romance e livros didáticos em uma curadoria especial.',
    },
    {
      title: 'Categorias',
      subtitle: 'Escolha sua leitura',
      text: 'Literatura Brasileira, Estrangeira, Filosofia, Teologia, Romance e muito mais.',
    },
    {
      title: 'FeMello',
      subtitle: 'Além das páginas',
      text: 'Uma livraria online feita para transformar cada busca em uma nova descoberta.',
    },
  ]

  const books = [
    {
      title: 'O Cabeleira',
      author: 'Franklin Távora',
      category: 'Literatura Brasileira',
      price: 'R$ 20,00',
      image: '/images/o-cabeleira.jpg',
    },
    {
      title: 'Jornadas.geo 8',
      author: 'Marcelo Moraes Paula',
      category: 'Livro Didático',
      price: 'R$ 30,00',
      image: '/images/jornadas-geo.jpg',
    },
    {
      title: 'Zadig ou O Destino',
      author: 'Voltaire',
      category: 'Filosofia',
      price: 'R$ 20,00',
      image: '/images/zadig.jpg',
    },
    {
      title: 'Ben-Hur',
      author: 'Lew Wallace',
      category: 'Literatura Estrangeira',
      price: 'R$ 25,00',
      image: '/images/ben-hur.jpg',
    },
  ]

  const categories = [
    'Literatura Brasileira',
    'Literatura Estrangeira',
    'Filosofia',
    'Teologia',
    'Livro Didático',
    'Romance',
  ]

  function createPageTexture (title: string, subtitle: string, text: string) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1400

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = '#f8f0e4'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#eadcc8'
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100)

    ctx.fillStyle = '#f8f0e4'
    ctx.fillRect(70, 70, canvas.width - 140, canvas.height - 140)

    ctx.fillStyle = '#c2185b'
    ctx.font = 'bold 70px Georgia'
    ctx.textAlign = 'center'
    ctx.fillText('FeMello', canvas.width / 2, 180)

    ctx.strokeStyle = '#c2185b'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(260, 230)
    ctx.lineTo(canvas.width - 260, 230)
    ctx.stroke()

    ctx.fillStyle = '#071124'
    ctx.font = 'bold 74px Arial'
    ctx.fillText(title, canvas.width / 2, 390)

    ctx.fillStyle = '#c2185b'
    ctx.font = 'bold 36px Arial'
    ctx.fillText(subtitle, canvas.width / 2, 460)

    ctx.fillStyle = '#4b5563'
    ctx.font = '38px Arial'
    ctx.textAlign = 'left'

    const maxWidth = 760
    const words = text.split(' ')
    let line = ''
    let y = 620

    for (const word of words) {
      const testLine = line + word + ' '
      const width = ctx.measureText(testLine).width

      if (width > maxWidth && line.length > 0) {
        ctx.fillText(line, 132, y)
        line = word + ' '
        y += 60
      } else {
        line = testLine
      }
    }

    ctx.fillText(line, 132, y)

    ctx.fillStyle = 'rgba(194, 24, 91, 0.08)'
    ctx.beginPath()
    ctx.arc(canvas.width / 2, 1120, 170, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#c2185b'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Bookstore', canvas.width / 2, 1135)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true

    return texture
  }

  function createCoverTexture () {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1400

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = '#9f174d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#6d0f35'
    ctx.fillRect(0, 0, 120, canvas.height)

    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.fillRect(170, 130, canvas.width - 260, canvas.height - 260)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 84px Georgia'
    ctx.textAlign = 'center'
    ctx.fillText('FeMello', canvas.width / 2 + 40, 430)

    ctx.font = 'bold 50px Arial'
    ctx.fillText('Bookstore', canvas.width / 2 + 40, 505)

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(330, 590)
    ctx.quadraticCurveTo(512, 520, 694, 590)
    ctx.stroke()

    ctx.font = '32px Arial'
    ctx.fillText('Além das páginas', canvas.width / 2 + 40, 700)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true

    return texture
  }

  function createBookScene () {
    if (!canvasRef.value) return

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    )

    camera.position.set(0, 0.7, 7)

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      alpha: true,
      antialias: true,
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const ambientLight = new THREE.AmbientLight(0xff_ff_ff, 2.3)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xff_ff_ff, 3)
    mainLight.position.set(3, 5, 5)
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0xff_ff_ff, 1.2)
    fillLight.position.set(-4, 2, 3)
    scene.add(fillLight)

    bookGroup = new THREE.Group()
    scene.add(bookGroup)

    const bookWidth = 3.4
    const bookHeight = 2.45
    const pageWidth = 3.08
    const pageHeight = 2.18
    const hingeX = -bookWidth / 2

    const coverMaterial = new THREE.MeshStandardMaterial({
      color: '#9f174d',
      roughness: 0.55,
      metalness: 0.06,
    })

    const backCoverMaterial = new THREE.MeshStandardMaterial({
      color: '#6d0f35',
      roughness: 0.65,
      metalness: 0.04,
    })

    const pageMaterial = new THREE.MeshStandardMaterial({
      color: '#f6efe4',
      roughness: 0.85,
    })

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: '#d8c4a7',
      roughness: 0.9,
    })

    const backCover = new THREE.Mesh(
      new THREE.BoxGeometry(bookWidth, bookHeight, 0.12),
      backCoverMaterial,
    )
    backCover.position.set(0, 0, -0.08)
    bookGroup.add(backCover)

    const pageBlock = new THREE.Mesh(
      new THREE.BoxGeometry(pageWidth, pageHeight, 0.18),
      pageMaterial,
    )
    pageBlock.position.set(0.08, 0, 0.03)
    bookGroup.add(pageBlock)

    const pageEdgeRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, pageHeight, 0.2),
      edgeMaterial,
    )
    pageEdgeRight.position.set(1.58, 0, 0.06)
    bookGroup.add(pageEdgeRight)

    const pageEdgeBottom = new THREE.Mesh(
      new THREE.BoxGeometry(pageWidth, 0.07, 0.2),
      edgeMaterial,
    )
    pageEdgeBottom.position.set(0.08, -1.1, 0.06)
    bookGroup.add(pageEdgeBottom)

    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, bookHeight, 0.32),
      new THREE.MeshStandardMaterial({
        color: '#5b0c2d',
        roughness: 0.62,
      }),
    )
    spine.position.set(hingeX, 0, 0.08)
    bookGroup.add(spine)

    pageGroups = []

    for (const [index, content] of pageContents.entries()) {
      const pageGroup = new THREE.Group()
      pageGroup.position.set(hingeX + 0.08, 0, 0.16 + index * 0.018)

      const texture = createPageTexture(content.title, content.subtitle, content.text)

      const page = new THREE.Mesh(
        new THREE.BoxGeometry(pageWidth, pageHeight, 0.012),
        new THREE.MeshStandardMaterial({
          color: '#f8f0e4',
          map: texture || undefined,
          roughness: 0.85,
          side: THREE.DoubleSide,
        }),
      )

      page.position.set(pageWidth / 2, 0, 0)
      pageGroup.add(page)

      pageGroups.push(pageGroup)
      bookGroup?.add(pageGroup)
    }

    frontCoverGroup = new THREE.Group()
    frontCoverGroup.position.set(hingeX, 0, 0.28)

    const frontCover = new THREE.Mesh(
      new THREE.BoxGeometry(bookWidth, bookHeight, 0.12),
      coverMaterial,
    )
    frontCover.position.set(bookWidth / 2, 0, 0)

    const coverTexture = createCoverTexture()

    const coverArt = new THREE.Mesh(
      new THREE.PlaneGeometry(bookWidth * 0.82, bookHeight * 0.82),
      new THREE.MeshBasicMaterial({
        map: coverTexture || undefined,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    )
    coverArt.position.set(bookWidth / 2 + 0.04, 0, 0.065)

    frontCoverGroup.add(frontCover)
    frontCoverGroup.add(coverArt)
    bookGroup.add(frontCoverGroup)

    /*
    Aqui está o estado inicial correto:
    capa virada para a câmera, livro parecendo estar deitado.
  */
    bookGroup.rotation.x = -0.38
    bookGroup.rotation.y = 0
    bookGroup.rotation.z = 0
    bookGroup.position.y = 0.08
    bookGroup.scale.set(1.22, 1.22, 1.22)

    frontCoverGroup.rotation.y = 0

    for (const pageGroup of pageGroups) {
      pageGroup.rotation.y = 0
    }

    animateThree()
  }

  function animateThree () {
    if (!renderer || !scene || !camera) return

    renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(animateThree)
  }

  function setupScrollAnimations () {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.book-hero',
        start: 'top top',
        end: '+=3600',
        scrub: 1,
        pin: true,
      },
    })

    tl.to('.hero-logo', {
      scale: 0.75,
      y: -120,
      opacity: 0.15,
      duration: 1,
    })

    tl.to(
      {},
      {
        duration: 1,
        onUpdate () {
          if (!bookGroup || !frontCoverGroup) return

          const progress = tl.progress()

          const coverProgress = gsap.utils.clamp(0, 1, progress / 0.45)
          const pagesProgress = gsap.utils.clamp(0, 1, (progress - 0.42) / 0.58)

          const coverEase = gsap.parseEase('power3.inOut')(coverProgress)

          /*
          Abre só a capa da frente.
          -2.45 abre para o lado esquerdo.
        */
          frontCoverGroup.rotation.y = THREE.MathUtils.lerp(0, -2.45, coverEase)

          /*
          Movimento leve da câmera/livro para ficar cinematográfico.
        */
          bookGroup.rotation.x = THREE.MathUtils.lerp(-0.38, -0.52, coverEase)
          bookGroup.rotation.z = THREE.MathUtils.lerp(0, 0.018, coverEase)
          bookGroup.position.y = THREE.MathUtils.lerp(0.08, -0.14, coverEase)

          const scale = THREE.MathUtils.lerp(1.22, 1.58, coverEase)
          bookGroup.scale.set(scale, scale, scale)

          /*
          Depois da capa abrir, as páginas viram.
        */
          for (const [index, pageGroup] of pageGroups.entries()) {
            const pageStart = index / pageGroups.length
            const pageEnd = (index + 1) / pageGroups.length

            const localProgress = gsap.utils.clamp(
              0,
              1,
              (pagesProgress - pageStart) / (pageEnd - pageStart),
            )

            const pageEase = gsap.parseEase('power2.inOut')(localProgress)

            pageGroup.rotation.y = THREE.MathUtils.lerp(0, -2.35, pageEase)
            pageGroup.position.z = THREE.MathUtils.lerp(
              0.16 + index * 0.018,
              0.28 + index * 0.026,
              pageEase,
            )
          }
        },
      },
      '<',
    )

    tl.fromTo(
      '.hero-title',
      {
        opacity: 0,
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      0.72,
    )

    tl.fromTo(
      '.hero-subtitle',
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      0.78,
    )

    tl.fromTo(
      '.hero-actions',
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      0.84,
    )

    gsap.from('.category-card', {
      scrollTrigger: {
        trigger: '.categories-section',
        start: 'top 75%',
      },
      y: 50,
      opacity: 0,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power3.out',
    })

    gsap.from('.book-card', {
      scrollTrigger: {
        trigger: '.books-section',
        start: 'top 75%',
      },
      y: 70,
      opacity: 0,
      stagger: 0.1,
      duration: 0.9,
      ease: 'power3.out',
    })
  }

  function setupLenis () {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.08,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add(time => {
      lenis?.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)
  }

  function handleResize () {
    if (!camera || !renderer) return

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    ScrollTrigger.refresh()
  }

  onMounted(() => {
    setupLenis()
    createBookScene()
    setupScrollAnimations()

    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)

    cancelAnimationFrame(animationFrameId)

    for (const trigger of ScrollTrigger.getAll()) {
      trigger.kill()
    }

    lenis?.destroy()
    lenis = null

    renderer?.dispose()
    renderer = null

    scene = null
    camera = null
    bookGroup = null
    frontCoverGroup = null
    pageGroups = []
  })
</script>

<template>
  <v-app>
    <main class="femello-page">
      <section class="book-hero">
        <canvas ref="canvasRef" class="book-canvas" />

        <div class="hero-gradient" />

        <div class="hero-logo">
          <img alt="FeMello Bookstore" src="/images/femello-logo.jpeg">
        </div>

        <v-container class="hero-content">
          <v-row justify="center">
            <v-col class="text-center" cols="12" md="8">
              <p class="eyebrow">
                FeMello Bookstore
              </p>

              <h1 class="hero-title">
                Abra uma nova história.
              </h1>

              <p class="hero-subtitle">
                Uma experiência feita para quem acredita que cada livro carrega
                um mundo inteiro além das páginas.
              </p>

              <div class="hero-actions">
                <v-btn
                  class="primary-btn"
                  elevation="0"
                  rounded="xl"
                  size="large"
                >
                  Explorar estante
                </v-btn>

                <v-btn
                  class="outline-btn"
                  rounded="xl"
                  size="large"
                  variant="outlined"
                >
                  Ver categorias
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>

        <div class="scroll-hint">
          <span>Role para abrir</span>
          <div class="mouse" />
        </div>
      </section>

      <section class="intro-section">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="6">
              <p class="section-kicker">
                Além das páginas
              </p>

              <h2 class="section-title">
                Uma livraria online com alma de catálogo editorial.
              </h2>
            </v-col>

            <v-col cols="12" md="6">
              <p class="section-text">
                A FeMello Bookstore reúne literatura, filosofia, teologia,
                didáticos e clássicos em uma experiência visual elegante,
                fluida e memorável.
              </p>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section class="categories-section">
        <v-container>
          <div class="section-header">
            <p class="section-kicker">
              Categorias
            </p>

            <h2 class="section-title">
              Escolha sua próxima página
            </h2>
          </div>

          <v-row>
            <v-col
              v-for="category in categories"
              :key="category"
              cols="12"
              md="4"
              sm="6"
            >
              <v-card class="category-card" elevation="0" rounded="xl">
                <div class="category-book-shape">
                  <div class="category-book-line" />
                  <div class="category-book-line short" />
                </div>

                <h3>{{ category }}</h3>

                <p>
                  Explore títulos selecionados da nossa estante.
                </p>

                <v-btn class="category-link" variant="text">
                  Ver livros
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section class="books-section">
        <v-container>
          <div class="section-header">
            <p class="section-kicker">
              Nossa Estante
            </p>

            <h2 class="section-title">
              Livros em destaque
            </h2>
          </div>

          <v-row>
            <v-col
              v-for="book in books"
              :key="book.title"
              cols="12"
              md="3"
              sm="6"
            >
              <v-card class="book-card" elevation="0" rounded="xl">
                <div class="book-image-wrapper">
                  <img :alt="book.title" :src="book.image">

                  <span class="book-category">
                    {{ book.category }}
                  </span>

                  <span class="book-price">
                    {{ book.price }}
                  </span>
                </div>

                <div class="book-info">
                  <h3>{{ book.title }}</h3>

                  <p>Por: {{ book.author }}</p>

                  <v-btn
                    block
                    class="details-btn"
                    elevation="0"
                    rounded="lg"
                  >
                    Ver detalhes
                  </v-btn>

                  <v-btn
                    block
                    class="cart-btn"
                    elevation="0"
                    rounded="lg"
                  >
                    Adicionar ao carrinho
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section class="final-section">
        <v-container>
          <v-row justify="center">
            <v-col class="text-center" cols="12" md="8">
              <p class="section-kicker">
                FeMello Bookstore
              </p>

              <h2 class="section-title">
                Encontre o livro que vai acompanhar seu próximo capítulo.
              </h2>

              <v-btn
                class="primary-btn mt-6"
                elevation="0"
                rounded="xl"
                size="large"
              >
                Entrar na livraria
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </section>
    </main>
  </v-app>
</template>

<style scoped>
.femello-page {
  background:
    radial-gradient(circle at top, rgba(159, 23, 77, 0.08), transparent 36%),
    #f7f7f8;
  color: #071124;
  overflow-x: hidden;
}

.book-hero {
  position: relative;
  height: 100vh;
  min-height: 720px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(247, 247, 248, 0.85), rgba(247, 247, 248, 1)),
    radial-gradient(circle at center, rgba(159, 23, 77, 0.16), transparent 50%);
}

.book-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(
      180deg,
      rgba(247, 247, 248, 0.05) 0%,
      rgba(247, 247, 248, 0.18) 45%,
      rgba(247, 247, 248, 0.96) 100%
    );
  pointer-events: none;
}

.hero-logo {
  position: absolute;
  top: 44px;
  left: 50%;
  z-index: 4;
  width: 260px;
  transform: translateX(-50%);
  transform-origin: center;
  text-align: center;
}

.hero-logo img {
  width: 100%;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 16px 34px rgba(7, 17, 36, 0.12));
}

.hero-content {
  position: relative;
  z-index: 5;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding-bottom: 105px;
  pointer-events: none;
}

.hero-actions {
  pointer-events: auto;
}

.eyebrow,
.section-kicker {
  margin-bottom: 12px;
  color: #c2185b;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.78rem;
}

.hero-title {
  margin: 0 auto;
  max-width: 850px;
  font-size: clamp(3rem, 8vw, 7.4rem);
  line-height: 0.92;
  letter-spacing: -0.08em;
  color: #071124;
  font-weight: 950;
}

.hero-subtitle {
  max-width: 680px;
  margin: 28px auto 0;
  color: #4b5563;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  line-height: 1.65;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.primary-btn {
  background: #c2185b !important;
  color: white !important;
  font-weight: 900;
  text-transform: none;
  padding-inline: 28px !important;
}

.outline-btn {
  border-color: rgba(7, 17, 36, 0.24) !important;
  color: #071124 !important;
  font-weight: 900;
  text-transform: none;
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(12px);
}

.scroll-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  z-index: 6;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7a8292;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.mouse {
  width: 18px;
  height: 30px;
  border: 2px solid rgba(7, 17, 36, 0.35);
  border-radius: 999px;
  position: relative;
}

.mouse::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #c2185b;
  transform: translateX(-50%);
  animation: mouseMove 1.2s infinite;
}

@keyframes mouseMove {
  0% {
    opacity: 0;
    transform: translate(-50%, 0);
  }

  40% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
}

.intro-section,
.categories-section,
.books-section,
.final-section {
  position: relative;
  padding: 110px 0;
}

.intro-section {
  background: #f7f7f8;
}

.categories-section {
  background:
    linear-gradient(180deg, #f7f7f8, #f2edf0);
}

.books-section {
  background: #f7f7f8;
}

.final-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  background:
    radial-gradient(circle at center, rgba(194, 24, 91, 0.12), transparent 45%),
    #071124;
  color: white;
}

.final-section .section-title {
  color: white;
}

.final-section .section-kicker {
  color: #ff7fb2;
}

.section-header {
  max-width: 760px;
  margin-bottom: 42px;
}

.section-title {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 5rem);
  line-height: 0.98;
  letter-spacing: -0.06em;
  font-weight: 950;
  color: #071124;
}

.section-text {
  color: #4b5563;
  font-size: 1.2rem;
  line-height: 1.8;
  font-weight: 500;
}

.category-card {
  min-height: 260px;
  padding: 30px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(255, 248, 251, 0.94));
  border: 1px solid rgba(7, 17, 36, 0.08);
  box-shadow: 0 20px 60px rgba(7, 17, 36, 0.08);
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 28px 80px rgba(7, 17, 36, 0.14);
}

.category-card h3 {
  margin: 22px 0 10px;
  color: #071124;
  font-size: 1.45rem;
  font-weight: 950;
  letter-spacing: -0.04em;
}

.category-card p {
  color: #6b7280;
  line-height: 1.6;
  font-weight: 500;
}

.category-link {
  color: #c2185b !important;
  font-weight: 900;
  text-transform: none;
  padding-left: 0 !important;
}

.category-book-shape {
  width: 74px;
  height: 52px;
  border: 3px solid #c2185b;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  position: relative;
  transform: skewY(-4deg);
}

.category-book-shape::after {
  content: '';
  position: absolute;
  left: 50%;
  top: -3px;
  height: calc(100% + 6px);
  width: 3px;
  background: #c2185b;
}

.category-book-line {
  position: absolute;
  left: 10px;
  bottom: 14px;
  width: 22px;
  height: 3px;
  border-radius: 999px;
  background: rgba(194, 24, 91, 0.5);
}

.category-book-line.short {
  left: 43px;
  width: 16px;
  bottom: 22px;
}

.book-card {
  overflow: hidden;
  background: white;
  border: 1px solid rgba(7, 17, 36, 0.08);
  box-shadow: 0 18px 50px rgba(7, 17, 36, 0.1);
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 26px 70px rgba(7, 17, 36, 0.16);
}

.book-image-wrapper {
  position: relative;
  height: 360px;
  overflow: hidden;
  background: #e5e7eb;
}

.book-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.book-card:hover .book-image-wrapper img {
  transform: scale(1.06);
}

.book-category {
  position: absolute;
  top: 18px;
  left: 18px;
  max-width: calc(100% - 36px);
  padding: 8px 13px;
  border-radius: 8px;
  background: #c2185b;
  color: white;
  font-size: 0.7rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.book-price {
  position: absolute;
  right: 16px;
  bottom: 16px;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #071124;
  font-weight: 950;
  box-shadow: 0 10px 24px rgba(7, 17, 36, 0.16);
}

.book-info {
  padding: 22px;
}

.book-info h3 {
  min-height: 56px;
  margin: 0 0 8px;
  color: #071124;
  font-size: 1.1rem;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.book-info p {
  margin-bottom: 18px;
  color: #6b7280;
  font-size: 0.92rem;
  font-weight: 600;
}

.details-btn {
  background: #071124 !important;
  color: white !important;
  font-weight: 900;
  text-transform: none;
  margin-bottom: 12px;
}

.cart-btn {
  background: #c2185b !important;
  color: white !important;
  font-weight: 900;
  text-transform: none;
}

@media (max-width: 960px) {
  .book-hero {
    min-height: 680px;
  }

  .hero-logo {
    width: 210px;
  }

  .hero-content {
    padding-bottom: 100px;
  }

  .book-image-wrapper {
    height: 320px;
  }

  .intro-section,
  .categories-section,
  .books-section,
  .final-section {
    padding: 78px 0;
  }
}

@media (max-width: 600px) {
  .book-hero {
    min-height: 620px;
  }

  .hero-logo {
    width: 180px;
    top: 34px;
  }

  .hero-content {
    align-items: flex-end;
    padding-bottom: 90px;
  }

  .hero-title {
    font-size: 3.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .scroll-hint {
    bottom: 18px;
  }

  .book-image-wrapper {
    height: 380px;
  }
}
</style>
