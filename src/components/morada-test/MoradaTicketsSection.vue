<script setup lang="ts">
  const tickets = [
    {
      label: 'Tour Brasil',
      title: 'Nenhum pr\u00F3ximo show encontrado',
      description: 'Novas datas ser\u00E3o anunciadas em breve.',
      linkText: 'acompanhar novidades',
    },
    {
      label: 'Tour Internacional',
      title: 'Nenhum pr\u00F3ximo show encontrado',
      description: 'Fique ligado nas redes oficiais do Morada.',
      linkText: 'ver canais oficiais',
    },
  ]
</script>

<template>
  <section id="tickets" class="tickets-section">
    <div class="section-heading">
      <span>agenda</span>
      <h2>Pr&oacute;ximos eventos</h2>

      <p>
        Confira as pr&oacute;ximas datas da tour e acompanhe os canais oficiais para
        novas cidades.
      </p>
    </div>

    <div class="tickets-grid">
      <article
        v-for="ticket in tickets"
        :key="ticket.label"
        class="ticket-card"
      >
        <span class="ticket-label">{{ ticket.label }}</span>
        <h3>{{ ticket.title }}</h3>
        <p>{{ ticket.description }}</p>
        <a href="#">{{ ticket.linkText }} &rarr;</a>
      </article>
    </div>
  </section>
</template>
