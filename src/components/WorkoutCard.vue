<script setup>
// Картка однієї вправи. Опис вправи приходить від списку через props,
// а кількість виконаних підходів картка читає зі сховища і змінює його діями.
import { computed } from 'vue';
import { useWorkoutsStore } from '../stores/workouts.js';
import GoalBadge from './GoalBadge.vue';
import SetCounter from './SetCounter.vue';

const props = defineProps({
  workout: { type: Object, required: true },
});

const workouts = useWorkoutsStore();

// Похідні значення – обчислюються зі стану сховища та props.
const hasEntry = computed(() => props.workout.id in workouts.doneSets);
const done = computed(() =>
  Math.min(workouts.doneSets[props.workout.id] ?? 0, props.workout.targetSets)
);
const goalDone = computed(() => done.value >= props.workout.targetSets);
const plan = computed(() => {
  const { targetSets, reps, weightKg, unit } = props.workout;
  const amount = `${targetSets} × ${reps} ${unit ?? 'повт.'}`;
  return weightKg > 0 ? `${amount} · ${weightKg} кг` : amount;
});
</script>

<template>
  <article class="card" :class="{ 'card--done': goalDone }">
    <div class="card__info">
      <h3 class="card__title">{{ props.workout.title }}</h3>
      <p class="card__meta">{{ props.workout.muscle }} · {{ plan }}</p>
      <GoalBadge :done="goalDone" />
    </div>
    <div class="card__actions">
      <SetCounter
        :value="done"
        :max="props.workout.targetSets"
        :label="props.workout.title"
        @increment="workouts.addSet(props.workout.id)"
        @decrement="workouts.setSets(props.workout.id, done - 1)"
      />
      <button
        type="button"
        class="btn btn--ghost btn--small"
        :disabled="!hasEntry"
        :aria-label="`Скинути підходи: ${props.workout.title}`"
        @click="workouts.removeEntry(props.workout.id)"
      >
        Скинути
      </button>
    </div>
  </article>
</template>
