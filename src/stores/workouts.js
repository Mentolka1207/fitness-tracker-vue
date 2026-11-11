// Store «workouts»: план тренувань (завантажується з файлу) та журнал
// виконаних підходів. Записано у вигляді options-store: state, getters, actions.
import { defineStore } from 'pinia';
import { DAYS } from '../data/days.js';

export const DATA_URL = '/data/workouts.json';

// Початковий стан винесено у функцію: вона потрібна і самому store,
// і main.js під час відновлення збереженого стану.
// Увесь стан серіалізований: масив, рядки, null і простий об'єкт з числами.
export function createWorkoutsState() {
  return {
    list: [], // план тижня: масив вправ із public/data/workouts.json
    status: 'idle', // idle | loading | succeeded | failed
    error: null, // текст помилки завантаження (рядок) або null
    doneSets: {}, // журнал: id вправи -> кількість виконаних підходів (ціле ≥ 1)
  };
}

export const useWorkoutsStore = defineStore('workouts', {
  state: createWorkoutsState,

  // Похідні значення не зберігаються у стані, а обчислюються з list і doneSets.
  getters: {
    // Довідник «id -> вправа»: дії знаходять вправу без перебору масиву.
    byId: (state) => Object.fromEntries(state.list.map((w) => [w.id, w])),

    // Вправи, згруповані за днем тижня: { mon: [...], tue: [...], ... }.
    byDay(state) {
      const groups = Object.fromEntries(DAYS.map((d) => [d.id, []]));
      for (const w of state.list) groups[w.day]?.push(w);
      return groups;
    },

    // Скільки підходів заплановано на тиждень.
    setsPlanned: (state) => state.list.reduce((sum, w) => sum + w.targetSets, 0),

    // Скільки підходів виконано (не більше запланованого для кожної вправи).
    setsDone(state) {
      return state.list.reduce(
        (sum, w) => sum + Math.min(state.doneSets[w.id] ?? 0, w.targetSets),
        0
      );
    },

    // Скільки вправ виконано повністю.
    exercisesDone(state) {
      return state.list.filter((w) => (state.doneSets[w.id] ?? 0) >= w.targetSets).length;
    },

    // Зведення за днями: { mon: { total, done, sets }, ... }, де
    // total – вправ у дні, done – завершених вправ, sets – виконаних підходів.
    dayStats(state) {
      const stats = {};
      for (const day of DAYS) {
        const items = this.byDay[day.id];
        let done = 0;
        let sets = 0;
        for (const w of items) {
          const n = Math.min(state.doneSets[w.id] ?? 0, w.targetSets);
          sets += n;
          if (n >= w.targetSets) done += 1;
        }
        stats[day.id] = { total: items.length, done, sets };
      }
      return stats;
    },

    // «Серія днів поспіль» (додаткова вимога варіанта 10): найдовша низка
    // сусідніх днів тижня, у кожен з яких виконано хоча б один підхід.
    streak() {
      let best = 0;
      let run = 0;
      for (const day of DAYS) {
        run = this.dayStats[day.id].sets > 0 ? run + 1 : 0;
        if (run > best) best = run;
      }
      return best;
    },
  },

  actions: {
    // Асинхронна дія: завантаження плану. Параметри url і delayMs потрібні
    // лише для демонстрації станів помилки та завантаження (див. App.vue).
    async load({ url = DATA_URL, delayMs = 0 } = {}) {
      if (this.status === 'loading') return; // повторний виклик під час запиту ігноруємо
      this.status = 'loading';
      this.error = null;
      try {
        if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Сервер розробки Vite на невідому адресу відповідає сторінкою index.html
        // з кодом 200, тому перевіряємо ще й тип вмісту.
        const type = res.headers.get('content-type') ?? '';
        if (!type.includes('json')) {
          throw new Error(
            `за адресою ${url} сервер повернув не JSON (${type || 'тип невідомий'})`
          );
        }
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('файл даних має містити масив вправ');
        this.list = data;
        this.status = 'succeeded';
      } catch (e) {
        this.error = e.message;
        this.status = 'failed';
      }
    },

    // Додавання: +1 виконаний підхід (створює запис у журналі, якщо його ще немає).
    addSet(id) {
      const workout = this.byId[id];
      if (!workout) return false;
      const current = this.doneSets[id] ?? 0;
      if (current >= workout.targetSets) return false; // понад план не додаємо
      this.doneSets[id] = current + 1;
      return true;
    },

    // Зміна: задати кількість підходів; 0 і менше – запис видаляється.
    setSets(id, value) {
      const workout = this.byId[id];
      if (!workout || !Number.isInteger(value)) return false;
      if (value <= 0) delete this.doneSets[id];
      else this.doneSets[id] = Math.min(value, workout.targetSets);
      return true;
    },

    // Видалення: прибрати запис однієї вправи з журналу.
    removeEntry(id) {
      delete this.doneSets[id];
    },

    // Очищення: почати тиждень спочатку.
    clearWeek() {
      this.doneSets = {};
    },
  },
});
