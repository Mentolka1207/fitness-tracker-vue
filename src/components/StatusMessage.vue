<script setup>
// Презентаційний компонент для службових станів екрана:
// завантаження, помилка, порожній результат.
const props = defineProps({
  kind: {
    type: String,
    required: true,
    validator: (v) => ['loading', 'error', 'empty'].includes(v),
  },
  text: { type: String, required: true },
});
</script>

<template>
  <p v-if="props.kind === 'error'" class="status status--error" role="alert">
    {{ props.text }}
  </p>
  <p v-else-if="props.kind === 'loading'" class="status status--loading" role="status">
    <span class="spinner" aria-hidden="true"></span>
    {{ props.text }}
  </p>
  <p v-else class="status status--empty">{{ props.text }}</p>
</template>
