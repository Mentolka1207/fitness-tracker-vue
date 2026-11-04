<script setup>
// Кореневий компонент: володіє всім спільним станом застосунку
// (дані, лічильники підходів, вибраний день, стани завантаження/помилки)
// і передає його вниз через props.
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { DAYS } from './data/days.js';
import BasePanel from './components/BasePanel.vue';
import DayTabs from './components/DayTabs.vue';
import WorkoutList from './components/WorkoutList.vue';
import WeeklySummary from './components/WeeklySummary.vue';
import StatusMessage from './components/StatusMessage.vue';

// Параметри адреси для демонстрації станів у звіті:
//   ?fail       — запит до неіснуючого файлу (стан помилки)
//   ?delay=2000 — штучна затримка перед запитом (стан завантаження)
const params = new URLSearchParams(window.location.search);
const DATA_URL = params.has('fail') ? '/data/no-such-file.json' : '/data/workouts.json';
const DELAY_MS = Number(params.get('delay')) || 0;

// ---- Стан ----
const workouts = ref([]);
const doneSets = ref({}); // { [id вправи]: кількість виконаних підходів }
const selectedDay = ref('mon');
const loading = ref(true);
const error = ref(null);

// ---- Похідні значення (computed, без окремого стану) ----
const setsOf = (w) => doneSets.value[w.id] ?? 0;
const isGoalDone = (w) => setsOf(w) >= w.targetSets;

const dayWorkouts = computed(() =>
  workouts.value.filter((w) => w.day === selectedDay.value)
);

const dayTabs = computed(() =>
  DAYS.map((day) => {
    const list = workouts.value.filter((w) => w.day === day.id);
    return { ...day, total: list.length, done: list.filter(isGoalDone).length };
  })
);

const week = computed(() => {
  const list = workouts.value;
  return {
    setsTarget: list.reduce((sum, w) => sum + w.targetSets, 0),
    setsDone: list.reduce((sum, w) => sum + Math.min(setsOf(w), w.targetSets), 0),
    workoutsTotal: list.length,
    workoutsDone: list.filter(isGoalDone).length,
  };
});

// «Ціль тижня виконано» — похідне значення (додаткова вимога варіанта 10).
const weekGoalDone = computed(
  () => week.value.workoutsTotal > 0 && week.value.workoutsDone === week.value.workoutsTotal
);

const selectedDayLabel = computed(
  () => DAYS.find((d) => d.id === selectedDay.value)?.label ?? ''
);

// ---- Обробники подій від дочірніх компонентів ----
function selectDay(dayId) {
  selectedDay.value = dayId;
}

function updateSets(id, value) {
  // межі 0…targetSets уже перевіряє SetCounter;
  // тут лише створюємо новий об'єкт замість мутації старого
  doneSets.value = { ...doneSets.value, [id]: value };
}

function resetWeek() {
  doneSets.value = {};
}

// ---- Побічний ефект: завантаження даних з очищенням ----
const controller = new AbortController();

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

onMounted(async () => {
  try {
    if (DELAY_MS) await wait(DELAY_MS, controller.signal);
    const res = await fetch(DATA_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('json')) {
      throw new Error(
        `за адресою ${DATA_URL} сервер повернув не JSON (${type || 'тип невідомий'})`
      );
    }
    workouts.value = await res.json();
  } catch (e) {
    if (e.name !== 'AbortError') error.value = e;
  } finally {
    if (!controller.signal.aborted) loading.value = false;
  }
});

onUnmounted(() => controller.abort());
</script>

<template>
  <div class="app">
    <header class="app__head">
      <h1>Фітнес-трекер</h1>
      <p v-if="!loading && !error" class="app__sub">
        Цього тижня: {{ week.workoutsDone }} з {{ week.workoutsTotal }} вправ виконано
      </p>
    </header>

    <main>
      <StatusMessage v-if="loading" kind="loading" text="Завантаження тренувань…" />
      <StatusMessage
        v-else-if="error"
        kind="error"
        :text="`Не вдалося завантажити тренування: ${error.message}`"
      />
      <template v-else>
        <DayTabs :days="dayTabs" :selected="selectedDay" @select="selectDay" />

        <div
          id="day-panel"
          class="layout"
          role="tabpanel"
          :aria-labelledby="`tab-${selectedDay}`"
        >
          <BasePanel :title="`Тренування: ${selectedDayLabel}`">
            <WorkoutList
              v-if="dayWorkouts.length > 0"
              :workouts="dayWorkouts"
              :done-sets="doneSets"
              @change="updateSets"
            />
            <StatusMessage
              v-else
              kind="empty"
              text="На цей день тренувань не заплановано — день відпочинку."
            />
          </BasePanel>

          <BasePanel title="Підсумок тижня" collapsible>
            <WeeklySummary
              :sets-done="week.setsDone"
              :sets-target="week.setsTarget"
              :workouts-done="week.workoutsDone"
              :workouts-total="week.workoutsTotal"
              :goal-done="weekGoalDone"
              @reset="resetWeek"
            />
            <template #footer>
              Дані умовні, створені для навчання.
            </template>
          </BasePanel>
        </div>
      </template>
    </main>
  </div>
</template>
