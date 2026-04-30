<script setup lang="ts">
  import MoradaHeader from '@/components/morada-test/MoradaHeader.vue'
  import MoradaHero from '@/components/morada-test/MoradaHero.vue'
  import MoradaInviteSection from '@/components/morada-test/MoradaInviteSection.vue'
  import MoradaTicketsSection from '@/components/morada-test/MoradaTicketsSection.vue'
  import { useMoradaScrollExperience } from '@/composables/useMoradaScrollExperience'
  import '@/styles/morada-test.scss'

  useMoradaScrollExperience()
</script>

<template>
  <main class="morada-page">
    <MoradaHeader />
    <MoradaHero />
    <MoradaTicketsSection />
    <MoradaInviteSection />
  </main>
</template>
