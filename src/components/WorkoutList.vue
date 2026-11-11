<script setup>
// Список вправ вибраного дня. Від батька приходить лише ідентифікатор дня,
// самі вправи список бере зі сховища (геттер byDay).
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useWorkoutsStore } from '../stores/workouts.js';
import StatusMessage from './StatusMessage.vue';
import WorkoutCard from './WorkoutCard.vue';

const props = defineProps({
  day: { type: String, required: true },
});

const { byDay } = storeToRefs(useWorkoutsStore());
const items = computed(() => byDay.value[props.day] ?? []);
</script>

<template>
  <ul v-if="items.length > 0" class="workout-list">
    <!-- ключ елемента – id з даних, а не індекс масиву -->
    <li v-for="w in items" :key="w.id">
      <WorkoutCard :workout="w" />
    </li>
  </ul>
  <StatusMessage
    v-else
    kind="empty"
    text="На цей день тренувань не заплановано – день відпочинку."
  />
</template>
