<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const boxMove = ref(null)
const boxFade = ref(null)
const boxScale = ref(null)
const boxRotate = ref(null)
const boxColor = ref(null)
const boxScrub = ref(null)
const boxPin = ref(null)
const boxTimeline = ref(null)
const boxStaggerContainer = ref(null)

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    // 1. Move para a direita
    gsap.to(boxMove.value, {
      x: 500,
      duration: 1,
      scrollTrigger: {
        trigger: boxMove.value,
        start: 'top 80%',
        end: 'top 30%',
        scrub: true,
        markers: true,
      },
    })

    // 2. Aparece com fade
    gsap.from(boxFade.value, {
      opacity: 0,
      y: 100,
      duration: 1,
      scrollTrigger: {
        trigger: boxFade.value,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
        markers: true,
      },
    })

    // 3. Aumenta de tamanho
    gsap.to(boxScale.value, {
      scale: 2,
      duration: 1,
      scrollTrigger: {
        trigger: boxScale.value,
        start: 'top 80%',
        end: 'top 40%',
        scrub: true,
        markers: true,
      },
    })

    // 4. Gira
    gsap.to(boxRotate.value, {
      rotation: 360,
      duration: 1,
      scrollTrigger: {
        trigger: boxRotate.value,
        start: 'top 80%',
        end: 'top 30%',
        scrub: true,
        markers: true,
      },
    })

    // 5. Muda cor e arredonda borda
    gsap.to(boxColor.value, {
      backgroundColor: '#2a9df4',
      borderRadius: '50%',
      duration: 1,
      scrollTrigger: {
        trigger: boxColor.value,
        start: 'top 80%',
        end: 'top 40%',
        scrub: true,
        markers: true,
      },
    })

    // 6. Scrub mais cinematográfico
    gsap.to(boxScrub.value, {
      x: 400,
      y: -100,
      rotation: 180,
      scale: 1.5,
      duration: 2,
      scrollTrigger: {
        trigger: boxScrub.value,
        start: 'top 85%',
        end: 'top 20%',
        scrub: 1,
        markers: true,
      },
    })

    // 7. Caixa fixa na tela enquanto anima
    gsap.to(boxPin.value, {
      x: 500,
      rotation: 360,
      backgroundColor: '#459c50',
      scrollTrigger: {
        trigger: boxPin.value,
        start: 'top 50%',
        end: '+=500',
        scrub: true,
        pin: true,
        markers: true,
      },
    })

    // 8. Timeline com várias etapas
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: boxTimeline.value,
        start: 'top 80%',
        end: 'top 20%',
        scrub: true,
        markers: true,
      },
    })

    tl.to(boxTimeline.value, {
      x: 300,
      duration: 1,
    })
      .to(boxTimeline.value, {
        rotation: 180,
        duration: 1,
      })
      .to(boxTimeline.value, {
        scale: 1.8,
        backgroundColor: '#ff9800',
        duration: 1,
      })
      .to(boxTimeline.value, {
        borderRadius: '50%',
        duration: 1,
      })

    // 9. Várias caixas animando em sequência
    gsap.from('.stagger-box', {
      opacity: 0,
      y: 100,
      scale: 0.5,
      stagger: 0.2,
      duration: 1,
      scrollTrigger: {
        trigger: boxStaggerContainer.value,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
        markers: true,
      },
    })
  })
})

onBeforeUnmount(() => {
  ctx?.revert()
})
</script>

<template>
  <main class="page">
    <section class="hero">
      <h1>Exemplos GSAP + ScrollTrigger</h1>
      <p>Role para baixo para ver cada animação acontecendo.</p>
    </section>

    <section class="demo-section">
      <h2>1. Mover no eixo X</h2>
      <div ref="boxMove" class="box">x</div>
    </section>

    <section class="demo-section">
      <h2>2. Fade + subir</h2>
      <div ref="boxFade" class="box">fade</div>
    </section>

    <section class="demo-section">
      <h2>3. Scale</h2>
      <div ref="boxScale" class="box">scale</div>
    </section>

    <section class="demo-section">
      <h2>4. Rotation</h2>
      <div ref="boxRotate" class="box">rotate</div>
    </section>

    <section class="demo-section">
      <h2>5. Cor + border-radius</h2>
      <div ref="boxColor" class="box">color</div>
    </section>

    <section class="demo-section">
      <h2>6. Scrub com várias propriedades</h2>
      <div ref="boxScrub" class="box">scrub</div>
    </section>

    <section class="demo-section pin-section">
      <h2>7. Pin: prende o elemento na tela</h2>
      <div ref="boxPin" class="box">pin</div>
    </section>

    <section class="demo-section">
      <h2>8. Timeline: várias animações em sequência</h2>
      <div ref="boxTimeline" class="box">tl</div>
    </section>

    <section ref="boxStaggerContainer" class="demo-section">
      <h2>9. Stagger: várias caixas em sequência</h2>

      <div class="stagger-grid">
        <div class="box small stagger-box">1</div>
        <div class="box small stagger-box">2</div>
        <div class="box small stagger-box">3</div>
        <div class="box small stagger-box">4</div>
        <div class="box small stagger-box">5</div>
      </div>
    </section>

    <section class="hero">
      <h1>Fim dos exemplos</h1>
    </section>
  </main>
</template>

<style scoped>
.page {
  overflow-x: hidden;
  background: #111;
  color: white;
  font-family: Arial, sans-serif;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.3rem;
  color: #ccc;
}

.demo-section {
  min-height: 100vh;
  padding: 120px 80px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.demo-section h2 {
  font-size: 2rem;
  margin-bottom: 80px;
}

.box {
  width: 130px;
  height: 130px;
  background: bisque;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 16px;
}

.small {
  width: 90px;
  height: 90px;
}

.stagger-grid {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.pin-section {
  min-height: 140vh;
}
</style>
