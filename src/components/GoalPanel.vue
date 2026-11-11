<script setup>
// Тижнева ціль: форма для її зміни та прогрес до цілі.
// Сама ціль – глобальний стан (store goal). Текст у полі введення і
// повідомлення про помилку – локальний стан: вони потрібні лише цій формі
// й потрапляють у сховище тільки після натискання «Зберегти».
import { ref, useId, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { GOAL_MIN, useGoalStore } from '../stores/goal.js';
import { useWorkoutsStore } from '../stores/workouts.js';
import { SETS_FORMS, plural } from '../utils/plural.js';
import GoalBadge from './GoalBadge.vue';
import ProgressBar from './ProgressBar.vue';

const goal = useGoalStore();
const { weeklyTarget, maxTarget, progressPercent, remaining, reached } = storeToRefs(goal);
const { setsDone } = storeToRefs(useWorkoutsStore());

const draft = ref(weeklyTarget.value); // чернетка поля (локальний стан)
const formError = ref(''); // текст помилки форми (локальний стан)
const inputId = useId();
const errorId = useId();

// Якщо ціль змінилася у сховищі, показуємо у полі актуальне значення.
watch(weeklyTarget, (value) => {
  draft.value = value;
});

function submit() {
  // setTarget сам перевіряє значення і повертає false, якщо воно неприпустиме.
  if (goal.setTarget(Number(draft.value))) {
    formError.value = '';
  } else {
    formError.value = `Введіть ціле число від ${GOAL_MIN} до ${maxTarget.value}.`;
  }
}
</script>

<template>
  <div class="goal">
    <form class="goal__form" novalidate @submit.prevent="submit">
      <label :for="inputId">Підходів на тиждень</label>
      <div class="goal__row">
        <input
          :id="inputId"
          v-model="draft"
          class="goal__input"
          type="number"
          inputmode="numeric"
          step="1"
          :min="GOAL_MIN"
          :max="maxTarget"
          :aria-invalid="formError !== ''"
          :aria-describedby="formError ? errorId : undefined"
        />
        <button type="submit" class="btn">Зберегти</button>
      </div>
      <p v-if="formError" :id="errorId" class="goal__error" role="alert">{{ formError }}</p>
    </form>

    <ProgressBar
      :value="Math.min(setsDone, weeklyTarget)"
      :max="weeklyTarget"
      label="Прогрес до тижневої цілі"
    />
    <p class="goal__text">
      Виконано {{ setsDone }} з {{ weeklyTarget }} – {{ progressPercent }}&nbsp;%
    </p>
    <p v-if="reached" class="goal__text goal__text--done" role="status">
      Ціль тижня виконано!
    </p>
    <p v-else class="goal__text">
      До цілі залишилось {{ remaining }} {{ plural(remaining, SETS_FORMS) }}.
    </p>
    <GoalBadge
      :done="reached"
      done-text="Ціль тижня виконано"
      pending-text="Ціль тижня ще не виконано"
    />
  </div>
</template>
