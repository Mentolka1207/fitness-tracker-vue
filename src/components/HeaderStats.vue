<script setup>
// Рядок у заголовку: прогрес до тижневої цілі та серія днів.
// Дані бере зі сховищ напряму – App їх не передає.
import { storeToRefs } from 'pinia';
import { useGoalStore } from '../stores/goal.js';
import { useWorkoutsStore } from '../stores/workouts.js';
import { DAYS_FORMS, SETS_FORMS, plural } from '../utils/plural.js';

const { weeklyTarget, progressPercent } = storeToRefs(useGoalStore());
const { setsDone, streak } = storeToRefs(useWorkoutsStore());
</script>

<template>
  <p class="app__sub">
    Ціль тижня: {{ setsDone }} з {{ weeklyTarget }}
    {{ plural(weeklyTarget, SETS_FORMS) }} ({{ progressPercent }}&nbsp;%) · серія:
    {{ streak }} {{ plural(streak, DAYS_FORMS) }} поспіль
  </p>
</template>
