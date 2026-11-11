// Точка входу: створення Pinia, відновлення збереженого стану, запуск застосунку.
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import { createWorkoutsState } from './stores/workouts.js';
import { loadSavedState } from './stores/persist.js';

const pinia = createPinia();

// Відновлення виконується до створення застосунку: дані записуються в
// pinia.state.value, і кожен store під час першого виклику стартує вже з ними.
// Pinia не доповнює такий стан початковим, тому об'єкти передаються повними.
const saved = loadSavedState();
if (saved) {
  pinia.state.value.workouts = { ...createWorkoutsState(), doneSets: saved.doneSets };
  pinia.state.value.goal = { weeklyTarget: saved.weeklyTarget };
}

createApp(App).use(pinia).mount('#app');
