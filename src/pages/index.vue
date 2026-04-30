<script setup lang="ts">
  import MoradaHeader from '@/components/morada-test/MoradaHeader.vue'
  import MoradaHero from '@/components/morada-test/MoradaHero.vue'
  import MoradaInviteSection from '@/components/morada-test/MoradaInviteSection.vue'
  import MoradaTicketsSection from '@/components/morada-test/MoradaTicketsSection.vue'
  import { useMoradaScrollExperience } from '@/composables/useMoradaScrollExperience'
  import '@/styles/morada-test.scss'

  const currentYear = new Date().getFullYear()

  useMoradaScrollExperience()
</script>

<template>
  <main class="morada-page">
    <MoradaHeader />
    <MoradaHero />
    <MoradaTicketsSection />
    <MoradaInviteSection />

    <footer class="morada-footer">
      <span>MORADA</span>
      <div class="footer-credit">
        <a
          aria-label="Instagram de Jonatas Silva Peraza"
          href="https://www.instagram.com/jonatasperaza"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span aria-hidden="true" class="mdi mdi-instagram" />
          @jonatasperaza
        </a>

        <p>&copy; {{ currentYear }} Jonatas Silva Peraza. Todos os direitos reservados.</p>
      </div>
    </footer>
  </main>
</template>
