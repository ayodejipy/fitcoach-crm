<template>
  <div class="flex items-center justify-between bg-(--bg-surface) border border-(--border) rounded-xl py-3 px-5 gap-4 flex-wrap">
    <div class="flex items-center gap-3">
      <button type="button" class="nav-arrow" title="Previous week" @click="$emit('prev')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3L5 7l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div>
        <div class="text-[15px] font-bold text-(--text-primary) tracking-[-0.2px] whitespace-nowrap min-w-[180px] text-center">{{ label }}</div>
        <div class="text-[11px] text-(--text-muted) font-medium text-center mt-px">{{ sub }}</div>
      </div>
      <button type="button" class="nav-arrow" title="Next week" @click="$emit('next')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        type="button"
        class="text-xs font-semibold text-primary dark:text-(--green-light) bg-transparent border-none cursor-pointer py-1 px-2 rounded-md ml-1"
        @click="$emit('today')"
      >Today</button>
    </div>

    <CalendarViewToggle :model-value="view" @update:model-value="$emit('update:view', $event)" />

    <div class="flex gap-2.5 items-center">
      <button type="button" class="btn-outline" @click="$emit('set-availability')">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M6.5 4v2.5M4 7.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Set Availability
      </button>
      <button type="button" class="btn-primary" @click="$emit('schedule-session')">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1v11M1 6.5h11" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        Schedule Session
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import CalendarViewToggle, { type CalendarView } from './CalendarViewToggle.vue'

defineProps<{
  label: string
  sub: string
  view: CalendarView
}>()

defineEmits<{
  prev: []
  next: []
  today: []
  'update:view': [view: CalendarView]
  'set-availability': []
  'schedule-session': []
}>()
</script>

<style scoped>
.nav-arrow {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #D1E0D5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  color: #3D5A45;
  transition: border-color .12s, background .12s, color .12s;
  flex-shrink: 0;
}
.nav-arrow:hover { border-color: var(--green-brand); background: #F0F9F4; color: var(--green-brand); }

.btn-outline {
  border: 1.5px solid #D1E0D5;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #3D5A45;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color .15s, background .15s, color .15s;
  font-family: inherit;
  white-space: nowrap;
}
.btn-outline:hover { border-color: var(--green-brand); background: #F0F9F4; color: var(--green-brand); }

.btn-primary {
  background: var(--green-brand);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background .15s;
  font-family: inherit;
  white-space: nowrap;
}
.btn-primary:hover { background: var(--green-hover); }
</style>

<style>
.dark .nav-arrow { background: var(--bg-surface); border-color: var(--border); color: var(--text-secondary); }
.dark .nav-arrow:hover { border-color: var(--green-light); background: var(--bg-primary-soft); color: var(--green-light); }

.dark .btn-outline { background: var(--bg-surface); border-color: var(--border); color: var(--text-secondary); }
.dark .btn-outline:hover { border-color: var(--green-light); background: var(--bg-primary-soft); color: var(--green-light); }
</style>
