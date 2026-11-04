<script setup>
// Презентаційний компонент: смуга прогресу з ARIA-атрибутами.
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, default: 100 },
  label: { type: String, required: true },
});

// Похідне значення: відсоток заповнення, обмежений діапазоном 0–100.
const percent = computed(() =>
  props.max > 0 ? Math.min(100, Math.round((props.value / props.max) * 100)) : 0
);
</script>

<template>
  <div
    class="progress"
    role="progressbar"
    :aria-label="props.label"
    aria-valuemin="0"
    :aria-valuemax="props.max"
    :aria-valuenow="props.value"
    :aria-valuetext="`${percent}%`"
  >
    <div class="progress__fill" :style="{ width: `${percent}%` }"></div>
  </div>
</template>
