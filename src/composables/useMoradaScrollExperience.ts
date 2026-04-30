import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { onBeforeUnmount, onMounted } from 'vue'

gsap.registerPlugin(ScrollTrigger)

export function useMoradaScrollExperience () {
  let lenis: Lenis | null = null
  let ctx: gsap.Context | null = null

  const rafLenis = (time: number) => {
    lenis?.raf(time * 1000)
  }

  onMounted(() => {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.08,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add(rafLenis)
    gsap.ticker.lagSmoothing(0)

    ctx = gsap.context(() => {
      gsap.set('.band-layer', {
        scale: 1,
        y: 0,
        opacity: 1,
      })

      gsap.set('.tour-logo', {
        scale: 1,
        y: 0,
        opacity: 1,
      })

      gsap.set('.hero-subtitle', {
        y: 0,
        opacity: 1,
      })

      gsap.set('.hero-actions', {
        y: 0,
        opacity: 1,
      })

      gsap.set('.story-panel', {
        opacity: 0,
        y: 160,
        scale: 0.94,
      })

      gsap.set('.story-image', {
        opacity: 0,
        x: 180,
        rotate: 4,
      })

      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.morada-hero',
          start: 'top top',
          end: '+=1200',
          scrub: true,
          pin: true,
        },
      })

      heroTl
        .fromTo(
          '.hero-bg',
          {
            scale: 1.08,
            opacity: 1,
          },
          {
            scale: 1.02,
            opacity: 1,
            duration: 1,
          },
          0,
        )
        .to(
          '.tour-logo',
          {
            scale: 1.35,
            opacity: 0,
            y: -160,
            duration: 0.35,
          },
          0.35,
        )
        .to(
          '.hero-subtitle',
          {
            opacity: 0,
            y: -80,
            duration: 0.25,
          },
          0.35,
        )
        .to(
          '.hero-actions',
          {
            opacity: 0,
            y: 90,
            duration: 0.25,
          },
          0.35,
        )
        .to(
          '.story-panel',
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.35,
          },
          0.58,
        )
        .to(
          '.story-image',
          {
            opacity: 1,
            x: 0,
            rotate: 0,
            duration: 0.35,
          },
          0.62,
        )
        .to(
          '.band-layer',
          {
            scale: 1.14,
            opacity: 0.35,
            y: -60,
            duration: 0.45,
          },
          0.6,
        )
        .to(
          '.hero-bg',
          {
            scale: 1.22,
            filter: 'brightness(0.35)',
            duration: 0.45,
          },
          0.6,
        )

      gsap.fromTo(
        '.ticket-card',
        {
          opacity: 0,
          y: 100,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.tickets-section',
            start: 'top 70%',
          },
        },
      )

      gsap.fromTo(
        '.invite-content',
        {
          opacity: 0,
          y: 100,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.invite-section',
            start: 'top 70%',
          },
        },
      )
    })
  })

  onBeforeUnmount(() => {
    ctx?.revert()
    ctx = null

    for (const trigger of ScrollTrigger.getAll()) {
      trigger.kill()
    }

    gsap.ticker.remove(rafLenis)

    lenis?.destroy()
    lenis = null
  })
}
