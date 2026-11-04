<script setup>
// Контейнерний компонент: рамка з заголовком, вміст приходить через slot.
// Власний стан: open — чи розгорнута панель. Він потрібен лише самій панелі,
// тому не піднімається в App.
import { ref, useId } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  collapsible: { type: Boolean, default: false },
});

const open = ref(true);
const headingId = useId();
const bodyId = useId();
</script>

<template>
  <section class="panel" :aria-labelledby="headingId">
    <header class="panel__head">
      <h2 :id="headingId" class="panel__title">{{ props.title }}</h2>
      <button
        v-if="props.collapsible"
        type="button"
        class="btn btn--ghost"
        :aria-expanded="open"
        :aria-controls="bodyId"
        @click="open = !open"
      >
        {{ open ? 'Згорнути' : 'Розгорнути' }}
      </button>
    </header>
    <div v-show="open" :id="bodyId" class="panel__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="panel__foot">
      <slot name="footer" />
    </footer>
  </section>
</template>
