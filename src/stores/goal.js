// Store «goal»: тижнева ціль, яку задає користувач (кількість підходів на тиждень).
// Записано у вигляді setup-store: ref – стан, computed – геттери, функції – дії.
import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useWorkoutsStore } from './workouts.js';

export const GOAL_MIN = 1;
export const GOAL_MAX = 999; // верхня межа, поки план ще не завантажено
export const GOAL_DEFAULT = 20;

export const useGoalStore = defineStore('goal', () => {
  // ---- стан ----
  const weeklyTarget = ref(GOAL_DEFAULT);

  // Геттери цього store читають дані іншого store – журнал підходів.
  const workouts = useWorkoutsStore();

  // ---- геттери ----
  // Найбільша допустима ціль: більше, ніж заплановано підходів, виконати неможливо.
  const maxTarget = computed(() =>
    workouts.setsPlanned > 0 ? Math.min(workouts.setsPlanned, GOAL_MAX) : GOAL_MAX
  );

  // «Прогрес до цілі» (додаткова вимога варіанта 10), у відсотках 0…100.
  const progressPercent = computed(() =>
    Math.min(100, Math.round((workouts.setsDone / weeklyTarget.value) * 100))
  );

  // Скільки підходів залишилося до цілі.
  const remaining = computed(() => Math.max(0, weeklyTarget.value - workouts.setsDone));

  // Чи досягнуто цілі.
  const reached = computed(() => workouts.setsDone >= weeklyTarget.value);

  // ---- дії ----
  // Задати ціль. Некоректне значення відхиляється, стан не змінюється.
  function setTarget(value) {
    if (!Number.isInteger(value) || value < GOAL_MIN || value > maxTarget.value) return false;
    weeklyTarget.value = value;
    return true;
  }

  // Узгодити ціль із планом. Під час відновлення з localStorage план ще не
  // завантажено, тому ціль перевіряється лише за GOAL_MAX. Коли план з'являється,
  // maxTarget зменшується, і завелика ціль обмежується ним.
  function fitToPlan() {
    if (weeklyTarget.value > maxTarget.value) weeklyTarget.value = maxTarget.value;
  }
  watch(maxTarget, fitToPlan);

  return { weeklyTarget, maxTarget, progressPercent, remaining, reached, setTarget, fitToPlan };
});
