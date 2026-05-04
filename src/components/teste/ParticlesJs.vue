<script setup lang="ts">
import { ref, onMounted } from 'vue'

const particlesOptions = ref<any | null>(null)

onMounted(async () => {
  const response = await fetch('/particlesjs-config.json')
  particlesOptions.value = await response.json()
})
</script>

<template>
  <div class="particles-wrapper">
    <vue-particles
      v-if="particlesOptions"
      id="tsparticles"
      class="particles"
      :options="particlesOptions"
    />
  </div>
</template>

<style scoped>
.particles-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.particles-wrapper,
.particles-canvas,
.particles-wrapper :deep(canvas) {
  position: absolute;
  inset: 0;
  z-index: 0 !important;
  width: 100%;
  height: 100%;
}
</style>
