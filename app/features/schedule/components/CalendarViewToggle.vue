<template>
  <div class="flex bg-[#F0F4F1] dark:bg-white/5 rounded-lg p-[3px]">
    <button
      v-for="view in views"
      :key="view"
      type="button"
      class="view-btn py-1.5 px-4 rounded-md text-[13px] font-semibold cursor-pointer border-none bg-transparent transition-colors"
      :class="modelValue === view ? 'view-btn-active' : 'text-(--text-muted) hover:text-[#3D5A45]'"
      @click="$emit('update:modelValue', view)"
    >{{ labels[view] }}</button>
  </div>
</template>

<script setup lang="ts">
export type CalendarView = 'day' | 'week' | 'month' | 'agenda'

const views: CalendarView[] = ['day', 'week', 'month', 'agenda']
const labels: Record<CalendarView, string> = { day: 'Day', week: 'Week', month: 'Month', agenda: 'Agenda' }

defineProps<{
  modelValue: CalendarView
}>()

defineEmits<{
  'update:modelValue': [view: CalendarView]
}>()
</script>

<style scoped>
.view-btn-active {
  background: #fff;
  color: var(--green-brand);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
</style>

<style>
.dark .view-btn-active { background: var(--bg-surface-raised); color: var(--green-light); }
</style>
