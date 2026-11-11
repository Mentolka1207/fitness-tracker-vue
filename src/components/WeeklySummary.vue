<script setup>
// Підсумок тижня. Усі числа – геттери сховища workouts;
// кнопка «Скинути тиждень» викликає дію очищення.
import { storeToRefs } from 'pinia';
import { useWorkoutsStore } from '../stores/workouts.js';
import { DAYS_FORMS, plural } from '../utils/plural.js';
import ProgressBar from './ProgressBar.vue';

const workouts = useWorkoutsStore();
const { list, setsDone, setsPlanned, exercisesDone, streak } = storeToRefs(workouts);
</script>

<template>
  <div class="summary">
    <dl class="summary__stats">
      <div>
        <dt>Підходів виконано</dt>
        <dd>{{ setsDone }} з {{ setsPlanned }}</dd>
      </div>
      <div>
        <dt>Вправ завершено</dt>
        <dd>{{ exercisesDone }} з {{ list.length }}</dd>
      </div>
      <div>
        <dt>Серія днів поспіль</dt>
        <dd>{{ streak }} {{ plural(streak, DAYS_FORMS) }}</dd>
      </div>
    </dl>
    <ProgressBar :value="setsDone" :max="setsPlanned" label="Виконання плану тижня" />
    <button
      type="button"
      class="btn btn--ghost"
      :disabled="setsDone === 0"
      @click="workouts.clearWeek()"
    >
      Скинути тиждень
    </button>
  </div>
</template>
