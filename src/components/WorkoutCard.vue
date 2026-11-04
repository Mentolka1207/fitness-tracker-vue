<script setup>
// Картка однієї вправи. Власного стану немає: кількість підходів (done)
// приходить з App, а зміну картка передає нагору подією change(id, value).
import { computed } from 'vue';
import SetCounter from './SetCounter.vue';
import GoalBadge from './GoalBadge.vue';

const props = defineProps({
  workout: { type: Object, required: true },
  done: { type: Number, default: 0 },
});

const emit = defineEmits(['change']);

// Похідні значення — не зберігаються в стані, а обчислюються з props.
const goalDone = computed(() => props.done >= props.workout.targetSets);
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
    <SetCounter
      :value="props.done"
      :max="props.workout.targetSets"
      :label="props.workout.title"
      @change="(value) => emit('change', props.workout.id, value)"
    />
  </article>
</template>
