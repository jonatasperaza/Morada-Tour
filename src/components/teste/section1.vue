  <script setup>
  import { onMounted, onBeforeUnmount, onBeforeUpdate, ref, nextTick } from 'vue'
  import gsap from 'gsap'

  let introRunning = true
  const boxScrub1 = ref(null)
  const boxScrub2 = ref(null)
  const boxScrub3 = ref(null)
  const boxScrub4Wrap = ref(null)
  const boxScrub4Inner = ref(null)
  const omaga = ref(null)

  const texto = 'OOOOOOOOOOOOOOOOOOOOOMAGA'
  const letrasTexto = texto.split('')
  const letrasRefs = ref([])
  const svgContainer = ref(null)


  function onMouseOutWindow(event) {
    const to = event.relatedTarget || event.toElement

    if (!to) {
      mouseleave()
    }
  }
  function onWindowBlur() {
    mouseleave()
  }

  let min = 48
  let max = 90
  let bound = min * Math.PI

  const boxes = ref([])
  const boxStyle = ref({})

  const boxesRefs = ref([])

  onBeforeUpdate(() => {
    boxesRefs.value = []
  })

  function setBoxRef(el) {
    if (el) boxesRefs.value.push(el)
  }

  async function animateBoxesIntro() {
    await nextTick()

    const boxes = boxesRefs.value

    if (!boxes.length) return

    gsap.set(boxes, {
      y: -window.innerHeight,
      opacity: 0,
      scale: 0.8,
      rotation: () => gsap.utils.random(-50, 50),
    })

    gsap.to(boxes, {
      y: 0,
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1.2,
      ease: 'bounce.out',
      stagger: {
        each: 0.025,
        from: 'random',
      },
      onComplete: () => {
        introRunning = false
      },
    })
  }
  function mousemoveBackground(e) {
      if (introRunning) return
    const mouseX = e.clientX
    const mouseY = e.clientY

    const radius = 180
    const maxMove = 55
    const maxScale = 0.18

    boxesRefs.value.forEach((box) => {
      const rect = box.getBoundingClientRect()

      const boxX = rect.left + rect.width / 2
      const boxY = rect.top + rect.height / 2

      const dx = boxX - mouseX
      const dy = boxY - mouseY

      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < radius) {
        const force = 1 - distance / radius

        const angle = Math.atan2(dy, dx)

        const moveX = Math.cos(angle) * maxMove * force
        const moveY = Math.sin(angle) * maxMove * force

        gsap.to(box, {
          x: moveX,
          y: moveY,
          scale: 1 - maxScale * force,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
          borderRadius: `${force * 60}%`,
        })
      } else {
        gsap.to(box, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto',
          borderRadius: '0%',
        })
      }
    })
  }

  function mouseleaveBackground() {
    gsap.to(boxesRefs.value, {
      x: 0,
      y: 0,
      scale: 1,
      borderRadius: '0%',
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    })
  }


  const baseBoxSize = 130

  function updateBoxes() {
    const width = window.innerWidth
    const height = window.innerHeight

    const cols = Math.max(1, Math.round(width / baseBoxSize))
    const rows = Math.max(1, Math.round(height / baseBoxSize))

    const boxWidth = width / cols
    const boxHeight = height / rows

    boxes.value = Array.from({ length: cols * rows })

    boxStyle.value = {
      width: `${boxWidth}px`,
      height: `${boxHeight}px`,
    }
  }


  let ctx

  const strength = 0.15

  async function mysignaturasvgomaga() {
    await nextTick()

    const response = await fetch('/aaa.svg')
    const svgText = await response.text()

    svgContainer.value.innerHTML = svgText

    const svg = svgContainer.value.querySelector('svg')

    if (!svg) {
      console.warn('SVG não encontrado')
      return
    }

  const clipPaths = Array.from(svg.querySelectorAll('clipPath path'))
    .filter((path) => {
      const d = path.getAttribute('d') || ''

      if (!d.includes('C') && !d.includes('c')) return false

      try {
        return path.getTotalLength() > 80
      } catch {
        return false
      }
    })
    .filter((path, index) => index === 0 || index === 2)
      console.log(
    clipPaths.map((path) => ({
      length: path.getTotalLength(),
      d: path.getAttribute('d')?.slice(0, 80),
    }))
  )

    if (!clipPaths.length) {
      console.warn('Nenhum path animável encontrado')
      return
    }

    Array.from(svg.children).forEach((child) => {
      if (child.tagName.toLowerCase() !== 'defs') {
        child.remove()
      }
    })

    svg.querySelectorAll('.animated-signature-paths').forEach((el) => el.remove())

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.classList.add('animated-signature-paths')
    svg.appendChild(group)

    const animatedPaths = clipPaths.map((oldPath) => {
      const path = oldPath.cloneNode(true)

      path.removeAttribute('clip-path')
      path.removeAttribute('clip-rule')
      path.removeAttribute('fill-rule')

      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', '#B2C73A')
      path.setAttribute('stroke-width', '2')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')

      group.appendChild(path)

      return path
    })

    animatedPaths.forEach((path) => {
      const length = path.getTotalLength()

      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 1,
      })
    })

    gsap.set(svgContainer.value, {
      visibility: 'visible',
    })

    gsap.to(animatedPaths, {
      strokeDashoffset: 0,
      duration: 3,
      ease: 'power2.inOut',
      stagger: 0.2,
      overwrite: 'auto',
    })
  }


  onMounted(async() => {
      await mysignaturasvgomaga()
      updateBoxes()
      await animateBoxesIntro()
      window.addEventListener('resize', updateBoxes)
        window.addEventListener('mouseout', onMouseOutWindow)
    window.addEventListener('blur', onWindowBlur)
    ctx = gsap.context(() => {
      gsap.to(boxScrub1.value, {
        x: 150,
        y: 300,
        rotation: 360,
        scale: 1.5,
        duration: 1,
        borderRadius: '30%',
      })

      gsap.to(boxScrub2.value, {
        x: -200,
        y: 300,
        rotation: 360,
        scale: 1.5,
        duration: 1.2,
        borderRadius: '60%',
      })

      gsap.to(boxScrub3.value, {
        x: 170,
        y: -130,
        rotation: 360,
        scale: 1.5,
        duration: 1,
        borderRadius: '20%',
      })

      // Essa animação mexe no bla bla bla ble ble ble blu blu blu
      gsap.to(boxScrub4Wrap.value, {
        x: -400,
        y: -100,
        rotation: 360,
        scale: 1.5,
        duration: 1,
        borderRadius: '10%',
      })
    })
  })

  function mousemove(e) {
    const rect = boxScrub4Wrap.value.getBoundingClientRect()

    const x = gsap.utils.mapRange(
      rect.left,
      rect.right,
      -rect.width / 2,
      rect.width / 2,
      e.clientX
    )

    const y = gsap.utils.mapRange(
      rect.top,
      rect.bottom,
      -rect.height / 2,
      rect.height / 2,
      e.clientY
    )

    gsap.to(boxScrub4Inner.value, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

    function mouseleave() {
    gsap.to(boxScrub4Inner.value, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    })
  }

  function mousemoveoomaga(e) {
    const firstLetra = letrasRefs.value[0]

    if (!firstLetra) return

    const offset = omaga.value.getBoundingClientRect().left + firstLetra.offsetLeft

    updateLetrasss(e.clientX - offset)
  }

  function mouseleaveomaga() {
    gsap.to(letrasRefs.value, {
      duration: 0.3,
      scale: 1,
      x: 0,
      overwrite: 'auto',
    })
  }

  function updateLetrasss(pointer) {
    for (let i = 0; i < letrasRefs.value.length; i++) {
      const letra = letrasRefs.value[i]

      const distance = i * min + min / 2 - pointer

      let x = 0
      let scale = 1

      if (-bound < distance && distance < bound) {
        const rad = distance / min * 0.5

        scale = 1 + (max / min - 1) * Math.cos(rad)
        x = 2 * (max - min) * Math.sin(rad)
      } else {
        x = (-bound < distance ? 2 : -2) * (max - min)
      }

      gsap.to(letra, {
        duration: 0.3,
        x,
        scale,
        overwrite: 'auto',
      })
    }
  }

  onBeforeUnmount(() => {
    ctx?.revert()

  window.removeEventListener('resize', updateBoxes)
  window.removeEventListener('mouseout', onMouseOutWindow)
  window.removeEventListener('blur', onWindowBlur)  })
  </script>

  <template>
    <section
    class="demo-section"
    @mousemove="mousemoveBackground"
    @mouseleave="mouseleaveBackground"
  >
      <div class="grid-screen">
  <div
    v-for="(_, index) in boxes"
    :key="index"
    :ref="setBoxRef"
    class="boxcaixa"
    :style="boxStyle"
  >
    {{ index + 1 }}
  </div>
      </div>
      <div ref="boxScrub1" class="box box1">box1</div>
      <div ref="boxScrub2" class="box box2">box2</div>
        <section class="signature-section">
      <div ref="svgContainer" class="signature-svg"></div>
    </section>
      <div ref="boxScrub3" class="box box3">box3</div>

      <div
        ref="boxScrub4Wrap"
        class="box4-wrap"
        @mousemove="mousemove"
        @mouseleave="mouseleave"
      >
        <div ref="boxScrub4Inner" class="box box4">
          box4
        </div>
      </div>

      <!-- <div
        class="h1"
        ref="omaga"
        @mousemove="mousemoveoomaga"
        @mouseleave="mouseleaveomaga"
      >
        <span
          v-for="(letra, index) in letrasTexto"
          :key="index"
          ref="letrasRefs"
          class="letra"
        >
          {{ letra }}
        </span>
      </div> -->
    </section>
  </template>

  <style scoped>
  .h1 {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #B2C73A;
    white-space: nowrap;
    font-size: 40px;
    font-weight: bold;
    line-height: 1;
    display: inline-flex;
    align-items: flex-end;
  }

  .demo-section {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #111;
  }

  .box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 130px;
    height: 130px;
    background: rgb(255, 255, 255);
    color: #111;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .box1 {
    position: absolute;
    left: 0;
    top: 0;
  }

  .box2 {
    position: absolute;
    right: 0;
    top: 0;
  }

  .box3 {
    position: absolute;
    left: 0;
    bottom: 0;
  }

  .box4-wrap {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 130px;
    height: 130px;
  }

  .box4 {
    width: 100%;
    height: 100%;
  }
  .letra {
    display: inline-block;
    width: 40px;
    margin: 0 4px;
    text-align: center;
    transform-origin: 50% 120%;
    will-change: transform;
  }


  .grid-screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
  }

  .boxcaixa {
    background: #282C20;
    color: #111;
    border: 1px solid #111;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: center;

    transform-origin: center;
    will-change: transform;
  }

  .box,
  .box4-wrap,
  .h1 {
    position: absolute;
    z-index: 2;
  }
  .signature-section {
    position: absolute;
    inset: 0;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    pointer-events: none;
  }

  .signature-svg {
    width: min(80vw, 700px);
    color: #B2C73A;
  }

  .signature-svg :deep(svg) {
    width: 100%;
    height: auto;
    overflow: visible;
  }
  </style>
