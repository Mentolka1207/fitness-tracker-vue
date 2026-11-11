// Збереження стану між сеансами в localStorage.
// Зберігається лише те, що вводить користувач: журнал підходів і тижнева ціль.
// План тренувань і статус завантаження не зберігаються – їх дає файл даних.
import { GOAL_DEFAULT, GOAL_MAX, GOAL_MIN } from './goal.js';

export const STORAGE_KEY = 'fitness-tracker:v1';
const MAX_SETS = 99; // розумна верхня межа для одного запису журналу

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

// Із журналу беремо лише записи «ціле число від 1 до MAX_SETS», решту відкидаємо.
function cleanDoneSets(raw) {
  const clean = {};
  if (!isPlainObject(raw)) return clean;
  for (const [id, sets] of Object.entries(raw)) {
    if (Number.isInteger(sets) && sets >= 1 && sets <= MAX_SETS) clean[id] = sets;
  }
  return clean;
}

function cleanTarget(raw) {
  return Number.isInteger(raw) && raw >= GOAL_MIN && raw <= GOAL_MAX ? raw : GOAL_DEFAULT;
}

// Повертає { doneSets, weeklyTarget } або null, якщо запису немає, сховище
// недоступне чи дані пошкоджені (не JSON або не об'єкт).
export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const data = JSON.parse(raw);
    if (!isPlainObject(data)) throw new Error('очікувався об\'єкт');
    return {
      doneSets: cleanDoneSets(data.doneSets),
      weeklyTarget: cleanTarget(data.weeklyTarget),
    };
  } catch (e) {
    console.warn(`Збережений стан не відновлено (${e.message}) – починаємо з початкового.`);
    return null;
  }
}

let lastJson = null; // щоб не переписувати запис, якщо нічого не змінилося

export function saveState({ doneSets, weeklyTarget }) {
  try {
    const json = JSON.stringify({ doneSets, weeklyTarget });
    if (json === lastJson) return;
    localStorage.setItem(STORAGE_KEY, json);
    lastJson = json;
  } catch {
    /* сховище недоступне або переповнене – працюємо без збереження */
  }
}
