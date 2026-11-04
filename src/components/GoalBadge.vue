<script setup>
// Презентаційний компонент: позначка «ціль виконано / в процесі».
// Сам нічого не обчислює — отримує готове логічне значення.
const props = defineProps({
  done: { type: Boolean, required: true },
  doneText: { type: String, default: 'Ціль виконано' },
  pendingText: { type: String, default: 'У процесі' },
});
</script>

<template>
  <span class="badge" :class="props.done ? 'badge--done' : 'badge--pending'">
    <span aria-hidden="true">{{ props.done ? '✓' : '…' }}</span>
    {{ props.done ? props.doneText : props.pendingText }}
  </span>
</template>
