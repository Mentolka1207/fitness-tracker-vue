<script setup>
// Презентаційний компонент: показує кількість виконаних підходів.
// Значення приходить ззовні (props.value); про натискання кнопок компонент
// повідомляє подіями increment і decrement – зі сховищем працює картка.
const props = defineProps({
  value: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 10 },
  label: { type: String, required: true },
});

const emit = defineEmits(['increment', 'decrement']);
</script>

<template>
  <div class="counter" role="group" :aria-label="`Підходи: ${props.label}`">
    <button
      type="button"
      class="btn btn--round"
      :disabled="props.value <= props.min"
      :aria-label="`Мінус підхід: ${props.label}`"
      @click="emit('decrement')"
    >
      −
    </button>
    <output class="counter__value" aria-live="polite">
      {{ props.value }} / {{ props.max }}
    </output>
    <button
      type="button"
      class="btn btn--round"
      :disabled="props.value >= props.max"
      :aria-label="`Плюс підхід: ${props.label}`"
      @click="emit('increment')"
    >
      +
    </button>
  </div>
</template>
