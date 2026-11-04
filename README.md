# Фітнес-трекер — ЛР № 3 (Vue 3 + Vite), варіант 10

Облік виконаних підходів за днями тижня. Усі дані умовні (`public/data/workouts.json`).

## Запуск

Потрібен Node.js 20.19+ або 22.12+.

```bash
npm install
npm run dev       # сервер розробки, http://localhost:5173
npm run build     # збирання в dist/
npm run preview   # перегляд зібраної версії, http://localhost:4173
```

## Демонстрація станів екрана

| Стан | Як побачити |
|---|---|
| Штатна робота | `http://localhost:5173/` |
| Завантаження | `http://localhost:5173/?delay=3000` (штучна затримка 3 с) |
| Помилка | `http://localhost:5173/?fail` (запит до неіснуючого файлу) |
| Порожній список | вкладка «Нд» (на неділю тренувань немає) |

## Структура

```
public/data/workouts.json     умовні дані (12 вправ)
src/data/days.js              довідник днів тижня
src/main.js                   точка входу
src/App.vue                   кореневий компонент, увесь спільний стан
src/components/
  BasePanel.vue               контейнер зі slot (використано 2 рази)
  DayTabs.vue                 вкладки днів (ARIA Tabs, керування стрілками)
  WorkoutList.vue             список вправ дня (v-for, :key = id)
  WorkoutCard.vue             картка вправи
  SetCounter.vue              лічильник підходів (0…targetSets)
  GoalBadge.vue               позначка «ціль виконано»
  WeeklySummary.vue           підсумок тижня
  ProgressBar.vue             смуга прогресу (role="progressbar")
  StatusMessage.vue           завантаження / помилка / порожньо
```
