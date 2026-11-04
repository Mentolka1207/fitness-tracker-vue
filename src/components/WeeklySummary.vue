<script setup>
// Підсумок тижня. Отримує готові числа з App і показує їх;
// кнопка «Скинути» лише повідомляє батька подією reset.
import ProgressBar from './ProgressBar.vue';
import GoalBadge from './GoalBadge.vue';

const props = defineProps({
  setsDone: { type: Number, required: true },
  setsTarget: { type: Number, required: true },
  workoutsDone: { type: Number, required: true },
  workoutsTotal: { type: Number, required: true },
  goalDone: { type: Boolean, default: false },
});

const emit = defineEmits(['reset']);
</script>

<template>
  <div class="summary">
    <dl class="summary__stats">
      <div>
        <dt>Підходів виконано</dt>
        <dd>{{ props.setsDone }} з {{ props.setsTarget }}</dd>
      </div>
      <div>
        <dt>Вправ завершено</dt>
        <dd>{{ props.workoutsDone }} з {{ props.workoutsTotal }}</dd>
      </div>
    </dl>
    <ProgressBar
      :value="props.setsDone"
      :max="props.setsTarget"
      label="Прогрес тижня за підходами"
    />
    <GoalBadge
      :done="props.goalDone"
      done-text="Ціль тижня виконано"
      pending-text="Ціль тижня ще не виконано"
    />
    <button
      type="button"
      class="btn btn--ghost"
      :disabled="props.setsDone === 0"
      @click="emit('reset')"
    >
      Скинути тиждень
    </button>
  </div>
</template>
