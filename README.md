# Фітнес-трекер — ЛР № 4 (Vue 3 + Pinia), варіант 10

Продовження проєкту ЛР № 3: облік виконаних підходів за днями тижня, тепер із
глобальним сховищем Pinia. Усі дані умовні (`public/data/workouts.json`).

Звіт з лабораторної роботи № 4 (версія 1.1): [`docs/lab4-report-v1.1.pdf`](docs/lab4-report-v1.1.pdf).

## Запуск

Потрібен Node.js 20.19+ або 22.12+.

```bash
npm install       # встановлює vue, pinia та @vue/devtools-api (обов'язкова залежність pinia 4)
npm run dev       # сервер розробки, http://localhost:5173
npm run build     # збирання в dist/
npm run preview   # перегляд зібраної версії, http://localhost:4173
```

## Сховища

| Store | Запис | Стан | Геттери | Дії |
|---|---|---|---|---|
| `workouts` (`src/stores/workouts.js`) | options-store | `list`, `status`, `error`, `doneSets` | `byId`, `byDay`, `setsPlanned`, `setsDone`, `exercisesDone`, `dayStats`, `streak` | `load` (асинхронна), `addSet`, `setSets`, `removeEntry`, `clearWeek` |
| `goal` (`src/stores/goal.js`) | setup-store | `weeklyTarget` | `maxTarget`, `progressPercent`, `remaining`, `reached` | `setTarget` |

Додаткова вимога варіанта 10: геттер «прогрес до цілі» — `goal.progressPercent`,
геттер «серія днів поспіль» — `workouts.streak`.

У `localStorage` (ключ `fitness-tracker:v1`) зберігаються лише `doneSets` і
`weeklyTarget`. Відновлення — у `src/main.js` через `pinia.state.value`,
збереження — підписка `$subscribe` у `src/App.vue`, перевірка даних —
`src/stores/persist.js`.

## Демонстрація станів екрана

| Стан | Як побачити |
|---|---|
| Штатна робота | `http://localhost:5173/` |
| Завантаження | `http://localhost:5173/?delay=3000` (штучна затримка 3 с) |
| Помилка | `http://localhost:5173/?fail` (запит до неіснуючого файлу) |
| Порожній список | вкладка «Нд» (на неділю тренувань немає) |
| Пошкоджені збережені дані | DevTools → Application → Local Storage → змінити значення `fitness-tracker:v1`, наприклад на `abc`, і перезавантажити сторінку |

## Експеримент із повторними відображеннями (завдання 6)

Тимчасово додати в `<script setup>` компонентів `App.vue` і `WorkoutCard.vue`:

```js
import { onUpdated } from 'vue';
onUpdated(() => console.log('[render] App')); // у картці: `[render] WorkoutCard #${props.workout.id}`
```

Виконати кілька дій над підходами, порахувати рядки в консолі й прибрати виведення.

## Структура

```
public/data/workouts.json     умовні дані (12 вправ)
src/main.js                   точка входу: createPinia, відновлення стану
src/App.vue                   кореневий компонент: запуск завантаження, збереження стану
src/stores/
  workouts.js                 store плану тренувань і журналу підходів
  goal.js                     store тижневої цілі
  persist.js                  читання та запис localStorage з перевіркою даних
src/data/days.js              довідник днів тижня
src/utils/plural.js           форми слів для чисел
src/components/
  HeaderStats.vue             рядок у заголовку: прогрес до цілі та серія днів   (сховище)
  DayTabs.vue                 вкладки днів (ARIA Tabs)                           (сховище)
  WorkoutList.vue             список вправ дня                                   (сховище)
  WorkoutCard.vue             картка вправи: дії addSet, setSets, removeEntry    (сховище)
  GoalPanel.vue               форма тижневої цілі та прогрес                     (сховище)
  WeeklySummary.vue           підсумок тижня, дія clearWeek                      (сховище)
  SetCounter.vue              лічильник підходів                                 (лише props)
  BasePanel.vue               контейнер зі slot                                  (лише props)
  GoalBadge.vue               позначка «ціль виконано»                           (лише props)
  ProgressBar.vue             смуга прогресу (role="progressbar")                (лише props)
  StatusMessage.vue           завантаження / помилка / порожньо                  (лише props)
```

## Автоматичні сценарії перевірки

Сценарії з таблиці 6.1 звіту записано у `tests/scenarios.mjs` (бібліотека Playwright).
Перед першим запуском потрібно завантажити браузер:

```bash
npx playwright install chromium
npm run dev                                   # в одному терміналі
npm run test:e2e -- http://localhost:5173     # в іншому
# або для зібраної версії: npm run build && npm run preview, потім
npm run test:e2e -- http://localhost:4173
```
