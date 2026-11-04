# Матеріали до звіту ЛР № 3 — варіант 10 «Фітнес-трекер» (Vue)

Це факти й таблиці з проєкту. Текст звіту варто писати своїми словами:
у таблиці оцінювання є критерій «Оригінальність (не LLM)» (10 балів).

## 1. Дерево компонентів (завдання 2)

```
App
├── StatusMessage            (loading / error)
├── DayTabs
└── BasePanel  «Тренування: <день>»        ← slot
│   ├── WorkoutList
│   │   └── WorkoutCard  (× кількість вправ, :key = id)
│   │       ├── GoalBadge
│   │       └── SetCounter
│   └── StatusMessage        (empty)
└── BasePanel  «Підсумок тижня»            ← slot + slot footer
    └── WeeklySummary
        ├── ProgressBar
        └── GoalBadge
```

Глибина: App → BasePanel → WorkoutList → WorkoutCard → SetCounter (5 рівнів; вимога — щонайменше 3).
Компонентів, крім App, 9 (вимога — щонайменше 6).

Примітка до контрольного питання 8: у Vue devtools вміст slot (WorkoutList, WeeklySummary)
показується як дочірній вузол BasePanel, хоча props і обробники подій йому передає App.

## 2. Таблиця контрактів

| Компонент | Відповідальність | Props (вхід) | Події (вихід) | Власний стан |
|---|---|---|---|---|
| App | завантаження даних, лічильники підходів, вибраний день, стан екрана | — | — | workouts, doneSets, selectedDay, loading, error |
| BasePanel | рамка з заголовком; вміст через slot | title: String (обов.), collapsible: Boolean = false | — | open (згорнута/розгорнута) |
| DayTabs | вкладки днів тижня, керування з клавіатури | days: Array (обов.), selected: String (обов.), panelId: String = 'day-panel' | select(dayId) | немає |
| WorkoutList | список вправ дня | workouts: Array (обов.), doneSets: Object = {} | change(id, value) — передає далі | немає |
| WorkoutCard | одна вправа | workout: Object (обов.), done: Number = 0 | change(id, value) | немає |
| SetCounter | кнопки −/+ і значення | value: Number (обов.), min: Number = 0, max: Number = 10, label: String (обов.) | change(value) | немає |
| GoalBadge | позначка «виконано / у процесі» | done: Boolean (обов.), doneText, pendingText: String (є типові) | — | немає |
| WeeklySummary | підсумок тижня, кнопка скидання | setsDone, setsTarget, workoutsDone, workoutsTotal: Number (обов.), goalDone: Boolean = false | reset | немає |
| ProgressBar | смуга прогресу з ARIA | value: Number (обов.), max: Number = 100, label: String (обов.) | — | немає |
| StatusMessage | службові стани екрана | kind: 'loading' / 'error' / 'empty' (обов., validator), text: String (обов.) | — | немає |

Презентаційні (без стану, лише props): DayTabs, WorkoutList, WorkoutCard, SetCounter, GoalBadge,
WeeklySummary, ProgressBar, StatusMessage (вимога — щонайменше 4).
computed усередині WorkoutCard і ProgressBar — похідні значення від props, а не власний стан.
`useTemplateRef('list')` у DayTabs — посилання на DOM-вузол для фокусу, не стан.

## 3. Де живе стан і що від нього залежить (завдання 4)

`doneSets` у App (рядок 22) показується узгоджено в чотирьох місцях:
1. лічильник у WorkoutCard → SetCounter («4 / 4»);
2. позначка на вкладці DayTabs («Пн 1/3»);
3. WeeklySummary («Підходів виконано 5 з 36», смуга прогресу);
4. підзаголовок у App («Цього тижня: 1 з 12 вправ виконано»).

Події дітей → батька: SetCounter `change` → WorkoutCard `change(id, value)` → WorkoutList → App `updateSets`;
DayTabs `select` → App `selectDay`; WeeklySummary `reset` → App `resetWeek`.
Props ніде не змінюються; App замінює об'єкт, а не мутує його (App.vue:70).

Додаткова вимога варіанта: «ціль виконано» — похідне значення:
- для вправи — `goalDone` у WorkoutCard.vue:16;
- для тижня — `weekGoalDone` у App.vue:53;
- для дня — поле `done` у `dayTabs`, App.vue:35.

## 4. Експеримент: попередження про тип props (завдання 3)

Тимчасово в WorkoutCard передано `:value="String(props.done)"` замість числа. Консоль (dev-режим):

```
[Vue warn]: Invalid prop: type check failed for prop "value".
Expected Number with value 0, got String with value "0".
  at <SetCounter value="0" max=4 label="Присідання зі штангою" ... >
  at <WorkoutCard ...> at <WorkoutList ...> at <BasePanel ...> at <App>
```

Попередження є лише в режимі розробки; у зібраній версії перевірки props немає. Зміну повернуто.

## 5. Експеримент: key = індекс (завдання 5)

Тимчасово: у кожному `li` поле `<input>`, ключ `:key="index"`, кнопка, що змінює порядок вправ на протилежний.
У поля введено назву «своєї» вправи, потім порядок змінено.

| key | Після зміни порядку |
|---|---|
| index | Планка ← «нотатка до: Присідання»; Присідання ← «нотатка до: Планка» — текст лишився на місці |
| w.id | кожна нотатка переїхала разом зі своєю вправою |

Пояснення: з ключем-індексом Vue зіставляє вузли за позицією (0, 1, 2), тому оновлює лише текст
props у наявних `li`, а DOM-стан поля (value) залишається у старому вузлі. З ключем id вузли
переставляються разом зі своїм вмістом. Після експерименту повернуто `:key="w.id"` (WorkoutList.vue:15).

## 6. Побічний ефект і мережа (завдання 6)

- Завантаження: `onMounted` (App.vue:90), очищення `onUnmounted(() => controller.abort())` (App.vue:107).
- Кількість запитів до `workouts.json`: **1** і в dev, і в preview. У Vue немає аналога StrictMode,
  який повторно монтує компонент, тому подвоєння, як у React, немає.
- Помилка: `?fail` → запит до `/data/no-such-file.json`.
  Спостереження: dev-сервер Vite відповідає на такий запит **200 і повертає index.html**
  (перевірено: `Content-Type: text/html`), а не 404. Тому, крім `res.ok`, код перевіряє
  `content-type` (App.vue:94–98). Інакше помилка була б малозрозумілим SyntaxError з `res.json()`.
- `wait()` (App.vue:80) — штучна затримка для знімка стану завантаження; таймер теж очищається через сигнал abort.

## 7. Перевірки (завдання 7), виконані мною в headless Chromium

- `npm run build`: 21 модуль, JS 74.53 kB (gzip 29.19 kB), CSS 3.79 kB.
- Lighthouse 13.6.0 на `npm run preview`: Accessibility **100**, Best Practices 100.
- Клавіатура: Tab доходить до вкладок і кнопок; стрілки ←/→, Home, End перемикають дні (шаблон Tabs з APG).
- Скриншоти Lighthouse, Vue devtools (вкладка Components) і термінала треба зробити на своєму комп'ютері.

## 8. Таблиця 4 (заготовка з посиланнями на код)

| Критерій | Базовий підхід (Vue) | Моя реалізація |
|---|---|---|
| Передача даних у дочірній компонент | defineProps | defineProps з type/required/default у всіх 9 компонентах, напр. SetCounter.vue:5–10, WorkoutCard.vue:8–11 |
| Повідомлення батьківського компонента | emit | SetCounter.vue:12,17 → WorkoutCard.vue:35 → WorkoutList.vue:19 → App.vue:66; DayTabs.vue:28,47; WeeklySummary.vue:44 |
| Локальний стан | ref | App.vue:21–25 (спільний стан); BasePanel.vue:12 (`open`, потрібен лише панелі) |
| Похідні значення | computed | App.vue:31, 35, 42, 53; WorkoutCard.vue:16–17; ProgressBar.vue:12 |
| Побічні ефекти й очищення | onMounted і onUnmounted | App.vue:78 (AbortController), 90 (onMounted), 107 (abort) |
| Композиція вкладеного вмісту | slot | BasePanel.vue:33 (default), 36 (footer); використано у App.vue:135 і 149 з різним вмістом |
| Відображення списків | v-for і :key | WorkoutList.vue:15 (`:key="w.id"`), DayTabs.vue:37–39 (`:key="day.id"`) |
| Бал Lighthouse (Accessibility) | не менше 90 | 100 (вставити свій знімок) |

Номери рядків актуальні для поточних файлів. Якщо редагуєте код, перевірте їх ще раз.
