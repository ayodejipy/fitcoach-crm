<script setup lang="ts">
export type CalendarView = 'day' | 'week' | 'month' | 'agenda'

const views: CalendarView[] = ['agenda', 'day', 'week', 'month']
const labels: Record<CalendarView, string> = { day: 'Day', week: 'Week', month: 'Month', agenda: 'Agenda' }

defineProps<{
  modelValue: CalendarView
}>()

defineEmits<{
  'update:modelValue': [view: CalendarView]
}>()
</script>

<template>
  <div role="tablist" aria-label="Calendar view" class="inline-flex rounded-md border border-(--border) bg-(--bg-subtle) p-[2px]">
    <button
      v-for="view in views"
      :key="view"
      type="button"
      role="tab"
      :aria-selected="modelValue === view"
      class="px-3 py-1 rounded-[5px] text-[11.5px] font-medium transition-colors"
      :class="modelValue === view
        ? 'bg-(--bg-surface) text-(--text-primary) shadow-sm'
        : 'text-(--text-secondary) hover:text-(--text-primary)'"
      @click="$emit('update:modelValue', view)"
    >
      {{ labels[view] }}
    </button>
  </div>
</template>
