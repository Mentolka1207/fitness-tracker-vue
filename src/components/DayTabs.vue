<script setup>
// Вкладки днів тижня за шаблоном Tabs з ARIA Authoring Practices:
// активна вкладка в порядку Tab, між вкладками — стрілки, Home, End.
// Вибраний день живе в App; компонент лише повідомляє про вибір подією select.
import { nextTick, useTemplateRef } from 'vue';

const props = defineProps({
  days: { type: Array, required: true },
  selected: { type: String, required: true },
  panelId: { type: String, default: 'day-panel' },
});

const emit = defineEmits(['select']);
const listEl = useTemplateRef('list'); // посилання на DOM-вузол, не стан

async function onKeydown(event) {
  const ids = props.days.map((d) => d.id);
  const i = ids.indexOf(props.selected);
  const moves = {
    ArrowRight: (i + 1) % ids.length,
    ArrowLeft: (i - 1 + ids.length) % ids.length,
    Home: 0,
    End: ids.length - 1,
  };
  if (!(event.key in moves)) return;
  event.preventDefault();
  const nextId = ids[moves[event.key]];
  emit('select', nextId);
  await nextTick();
  listEl.value?.querySelector(`#tab-${nextId}`)?.focus();
}
</script>

<template>
  <div ref="list" class="tabs" role="tablist" aria-label="Дні тижня" @keydown="onKeydown">
    <button
      v-for="day in props.days"
      :id="`tab-${day.id}`"
      :key="day.id"
      type="button"
      role="tab"
      class="tab"
      :class="{ 'tab--complete': day.total > 0 && day.done === day.total }"
      :aria-selected="day.id === props.selected"
      :aria-controls="props.panelId"
      :tabindex="day.id === props.selected ? 0 : -1"
      @click="emit('select', day.id)"
    >
      <span class="tab__name">
        <abbr :title="day.label">{{ day.short }}</abbr>
      </span>
      <span class="tab__progress">
        {{ day.total === 0 ? 'відпочинок' : `${day.done}/${day.total}` }}
      </span>
    </button>
  </div>
</template>
