// Автоматичні сценарії перевірки (таблиця 6.1 звіту) у браузері Chromium.
// Запуск: спочатку npm run dev (або npm run build && npm run preview), потім
//   node tests/scenarios.mjs http://localhost:5173
// Стан сховищ сценарії читають через екземпляр Pinia, який застосунок
// реєструє в app.config.globalProperties.$pinia.
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:5173';
const KEY = 'fitness-tracker:v1';

let failed = 0;
function check(name, ok, details = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${details ? ' — ' + details : ''}`);
  if (!ok) failed += 1;
}

// Виконати функцію fn(workouts, goal) у сторінці з доступом до обох store.
function inStores(page, fn, arg) {
  return page.evaluate(
    ([src, a]) => {
      const pinia = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia;
      const f = new Function('return ' + src)();
      return f(pinia._s.get('workouts'), pinia._s.get('goal'), a);
    },
    [fn.toString(), arg]
  );
}

const saved = (page) => page.evaluate((k) => localStorage.getItem(k), KEY);
const header = (page) => page.locator('.app__sub').innerText();
const plus = (page, title) => page.getByRole('button', { name: `Плюс підхід: ${title}` });
const minus = (page, title) => page.getByRole('button', { name: `Мінус підхід: ${title}` });

async function waitLoaded(page) {
  await page.waitForFunction(() => document.querySelector('.app__sub') !== null);
}

// Відкрити сторінку з наперед записаним значенням у localStorage.
async function openWith(context, value, path = '/') {
  const page = await context.newPage();
  const warnings = [];
  page.on('console', (m) => m.type() === 'warning' && warnings.push(m.text()));
  await page.goto(BASE + '/');
  await page.evaluate(
    ([k, v]) => (v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v)),
    [KEY, value]
  );
  await page.goto(BASE + path);
  return { page, warnings };
}

const browser = await chromium.launch();
console.log(`Адреса: ${BASE}; браузер: Chromium ${browser.version()}; ${new Date().toISOString()}`);

// ---------- сценарії 1–8: один сеанс користувача ----------
const context = await browser.newContext();
const { page } = await openWith(context, null);
await waitLoaded(page);

const actionLog = [];
await page.exposeFunction('logAction', (s) => actionLog.push(s));
await page.evaluate(() => {
  const pinia = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia;
  for (const id of ['workouts', 'goal']) {
    pinia._s.get(id).$onAction(({ name, args }) =>
      window.logAction(`${id}/${name}(${args.map((a) => JSON.stringify(a)).join(', ')})`)
    );
  }
});

// 1
const s1 = await inStores(page, (w) => w.status);
const cards = await page.locator('.card').count();
check('1 штатне завантаження', s1 === 'succeeded' && cards === 3, `status=${s1}, карток понеділка: ${cards}`);

// 2 – через інтерфейс
for (let i = 0; i < 3; i++) await plus(page, 'Присідання зі штангою').click();
await minus(page, 'Присідання зі штангою').click();
await plus(page, 'Планка').click();
await page.getByRole('button', { name: 'Скинути підходи: Планка' }).click();
const d2 = await inStores(page, (w) => JSON.stringify(w.doneSets));
check('2 додавання, зміна, видалення з інтерфейсу', d2 === '{"101":2}', `doneSets=${d2}; localStorage=${await saved(page)}`);

// 3 – дії відхиляють некоректні аргументи
const r3 = await inStores(page, (w) => {
  w.setSets(101, 4); // план вправи 101 – 4 підходи
  const res = [w.addSet(101), w.addSet(99999), w.setSets(101, 2.5)];
  const after = JSON.stringify(w.doneSets);
  w.setSets(101, 2);
  return { res, after };
});
check('3 некоректні аргументи дій', r3.res.every((x) => x === false) && r3.after === '{"101":4}',
  `повернуто ${JSON.stringify(r3.res)}, doneSets=${r3.after}`);

// 4 – геттери streak і progressPercent
const r4 = await inStores(page, (w, g) => {
  w.setSets(101, 4); w.addSet(201); w.addSet(402);
  const before = w.streak;
  w.addSet(301);
  return { before, after: w.streak, done: w.setsDone, pct: g.progressPercent };
});
check('4 серія днів і прогрес', r4.before === 2 && r4.after === 4 && r4.pct === 35,
  `серія ${r4.before} → ${r4.after}, виконано ${r4.done}, прогрес ${r4.pct} %`);

// 5 – некоректна ціль через форму
const input = page.getByLabel('Підходів на тиждень');
const save = page.getByRole('button', { name: 'Зберегти' });
const alerts = [];
for (const v of ['0', '37', '2.5', '']) {
  await input.fill(v);
  await save.click();
  alerts.push(await page.getByRole('alert').count());
}
const t5 = await inStores(page, (w, g) => g.weeklyTarget);
check('5 некоректна ціль відхилена', alerts.every((n) => n === 1) && t5 === 20,
  `role=alert показано ${alerts.join('/')} рази, ціль ${t5}`);

// 6 – ціль 10 і ще три підходи
await input.fill('10');
await save.click();
await inStores(page, (w) => { w.addSet(402); w.addSet(402); w.addSet(402); });
const r6 = await inStores(page, (w, g) => ({ reached: g.reached, pct: g.progressPercent }));
const doneText = await page.getByText('Ціль тижня виконано!').count();
check('6 ціль досягнуто', r6.reached && r6.pct === 100 && doneText === 1,
  `reached=${r6.reached}, ${r6.pct} %, напис «Ціль тижня виконано!»: ${doneText}`);

// 7 – перезавантаження
const before7 = await saved(page);
await page.reload();
await waitLoaded(page);
const r7 = await inStores(page, (w, g) => JSON.stringify({ doneSets: w.doneSets, weeklyTarget: g.weeklyTarget }));
const tab7 = await page.locator('[role=tab][aria-selected=true]').innerText();
check('7 стан відновлено після перезавантаження', r7 === before7 && (await saved(page)) === before7,
  `${r7}; активна вкладка: ${tab7.replace(/\s+/g, ' ')}`);

// 8 – очищення тижня
await page.getByRole('button', { name: 'Скинути тиждень' }).click();
check('8 «Скинути тиждень»', (await saved(page)) === '{"doneSets":{},"weeklyTarget":10}', `localStorage=${await saved(page)}`);

// 14 – кешування геттерів (завдання 4)
const r8 = await inStores(page, (w) => {
  const byDay1 = w.byDay, stats1 = w.dayStats;
  const same = w.byDay === byDay1 && w.dayStats === stats1;
  w.addSet(101);
  const res = { same, byDayAfter: w.byDay === byDay1, statsAfter: w.dayStats === stats1 };
  w.clearWeek();
  return res;
});
check('14 кешування геттерів', r8.same && r8.byDayAfter && !r8.statsAfter,
  `без змін стану: той самий об'єкт = ${r8.same}; після addSet: byDay той самий = ${r8.byDayAfter}, dayStats той самий = ${r8.statsAfter}`);
await context.close();

// ---------- сценарії 9–10, 13: пошкоджені та завеликі збережені дані ----------
const cases = [
  ['9 не JSON', 'це не JSON {', '{"doneSets":{},"weeklyTarget":20}'],
  ['9 масив замість об\'єкта', '[1,2,3]', '{"doneSets":{},"weeklyTarget":20}'],
  ['9 null', 'null', '{"doneSets":{},"weeklyTarget":20}'],
  ['10 частково зіпсовані поля', '{"doneSets":{"101":"x","102":2,"103":-1},"weeklyTarget":"abc"}', '{"doneSets":{"102":2},"weeklyTarget":20}'],
  ['13 ціль більша за план', '{"doneSets":{"101":1},"weeklyTarget":500}', '{"doneSets":{"101":1},"weeklyTarget":36}'],
];
for (const [name, value, expected] of cases) {
  const ctx = await browser.newContext();
  const { page: p, warnings } = await openWith(ctx, value);
  await waitLoaded(p);
  const state = await inStores(p, (w, g) => JSON.stringify({ doneSets: w.doneSets, weeklyTarget: g.weeklyTarget }));
  const stored = await saved(p);
  check(name, state === expected && stored === expected,
    `записано ${value} → стан ${state}; у localStorage ${stored}; попередження: ${warnings.join(' | ') || '—'}`);
  await ctx.close();
}

// ---------- сценарії 11–12: стани завантаження ----------
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto(BASE + '/?fail');
  const alert = p.getByRole('alert');
  await alert.waitFor();
  const s = await inStores(p, (w) => w.status);
  const retry = await p.getByRole('button', { name: 'Спробувати ще раз' }).count();
  check('11 помилка завантаження', s === 'failed' && retry === 1, `status=${s}; ${await alert.innerText()}`);

  await p.goto(BASE + '/?delay=1500');
  const s1 = await inStores(p, (w) => w.status);
  const loadingText = await p.getByRole('status').first().innerText();
  await waitLoaded(p);
  const s2 = await inStores(p, (w) => w.status);
  check('12 стан завантаження', s1 === 'loading' && s2 === 'succeeded', `${s1} («${loadingText.trim()}») → ${s2}`);
  await ctx.close();
}

await browser.close();

console.log('\nЖурнал дій ($onAction) у сценаріях 2–8:');
for (const line of actionLog) console.log('  ' + line);
console.log(`\nРезультат: ${failed === 0 ? 'усі перевірки пройдено' : `не пройдено: ${failed}`}`);
process.exit(failed === 0 ? 0 : 1);
