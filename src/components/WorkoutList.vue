<script setup>
// Список вправ вибраного дня. Ключ елемента — id з даних, а не індекс масиву.
import WorkoutCard from './WorkoutCard.vue';

const props = defineProps({
  workouts: { type: Array, required: true },
  doneSets: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['change']);
</script>

<template>
  <ul class="workout-list">
    <li v-for="w in props.workouts" :key="w.id">
      <WorkoutCard
        :workout="w"
        :done="props.doneSets[w.id] ?? 0"
        @change="(id, value) => emit('change', id, value)"
      />
    </li>
  </ul>
</template>
