/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

import Particles from "@tsparticles/vue3";
import { loadSlim } from "@tsparticles/slim";

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'

const app = createApp(App)

app.use(Particles, {
  init: async (engine) => {
    await loadSlim(engine);
  },
});

registerPlugins(app)

app.mount('#app')
