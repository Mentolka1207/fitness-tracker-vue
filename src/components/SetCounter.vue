<script setup>
// Презентаційний компонент: показує кількість виконаних підходів.
// Значення приходить ззовні (props.value), зміну компонент лише пропонує
// подією change — сам лічильник живе в App.
const props = defineProps({
  value: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 10 },
  label: { type: String, required: true },
});

const emit = defineEmits(['change']);

function step(delta) {
  const next = props.value + delta;
  if (next < props.min || next > props.max) return;
  emit('change', next);
}
</script>

<template>
  <div class="counter" role="group" :aria-label="`Підходи: ${props.label}`">
    <button
      type="button"
      class="btn btn--round"
      :disabled="props.value <= props.min"
      :aria-label="`Мінус підхід: ${props.label}`"
      @click="step(-1)"
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
      @click="step(1)"
    >
      +
    </button>
  </div>
</template>
