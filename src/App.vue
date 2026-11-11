<script setup>
// Кореневий компонент. Глобальний стан тепер живе у сховищах Pinia, тому App
// лише запускає завантаження, показує стан екрана і зберігає стан у localStorage.
// Локальним лишився один фрагмент – вибраний день (вкладка).
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { DAYS } from './data/days.js';
import { DATA_URL, useWorkoutsStore } from './stores/workouts.js';
import { useGoalStore } from './stores/goal.js';
import { saveState } from './stores/persist.js';
import BasePanel from './components/BasePanel.vue';
import DayTabs from './components/DayTabs.vue';
import GoalPanel from './components/GoalPanel.vue';
import HeaderStats from './components/HeaderStats.vue';
import StatusMessage from './components/StatusMessage.vue';
import WeeklySummary from './components/WeeklySummary.vue';
import WorkoutList from './components/WorkoutList.vue';

// Параметри адреси для демонстрації станів у звіті:
//   ?fail       – запит до неіснуючого файлу (стан помилки)
//   ?delay=3000 – штучна затримка перед запитом (стан завантаження)
const params = new URLSearchParams(window.location.search);
const loadOptions = {
  url: params.has('fail') ? '/data/no-such-file.json' : DATA_URL,
  delayMs: Number(params.get('delay')) || 0,
};

const workouts = useWorkoutsStore();
const goal = useGoalStore();
// storeToRefs зберігає реактивність; App читає лише status і error.
const { status, error } = storeToRefs(workouts);

// Збереження між сеансами: підписка на зміни обох store.
function persist() {
  saveState({ doneSets: workouts.doneSets, weeklyTarget: goal.weeklyTarget });
}
workouts.$subscribe(persist);
goal.$subscribe(persist);

// Локальний стан: вибрана вкладка потрібна лише цьому екрану.
const selectedDay = ref('mon');
const selectedDayLabel = computed(
  () => DAYS.find((d) => d.id === selectedDay.value)?.label ?? ''
);

onMounted(() => workouts.load(loadOptions));
</script>

<template>
  <div class="app">
    <header class="app__head">
      <h1>Фітнес-трекер</h1>
      <HeaderStats v-if="status === 'succeeded'" />
    </header>

    <main>
      <StatusMessage
        v-if="status === 'idle' || status === 'loading'"
        kind="loading"
        text="Завантаження тренувань…"
      />
      <div v-else-if="status === 'failed'" class="failure">
        <StatusMessage
          kind="error"
          :text="`Не вдалося завантажити тренування: ${error}`"
        />
        <button type="button" class="btn" @click="workouts.load(loadOptions)">
          Спробувати ще раз
        </button>
      </div>
      <template v-else>
        <DayTabs :selected="selectedDay" @select="(id) => (selectedDay = id)" />

        <div class="layout">
          <div id="day-panel" role="tabpanel" :aria-labelledby="`tab-${selectedDay}`">
            <BasePanel :title="`Тренування: ${selectedDayLabel}`">
              <WorkoutList :day="selectedDay" />
            </BasePanel>
          </div>

          <div class="side">
            <BasePanel title="Тижнева ціль">
              <GoalPanel />
            </BasePanel>
            <BasePanel title="Підсумок тижня" collapsible>
              <WeeklySummary />
              <template #footer>Дані умовні, створені для навчання.</template>
            </BasePanel>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
