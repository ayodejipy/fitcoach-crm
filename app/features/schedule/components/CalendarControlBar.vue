<template>
  <div class="flex items-center justify-between bg-(--bg-surface) border border-(--border) rounded-xl py-3 px-5 gap-4 flex-wrap">
    <div class="flex items-center gap-3">
      <UButton
        variant="outline"
        color="neutral"
        class="size-8 justify-center hover:border-primary hover:text-primary hover:bg-primary/5 dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
        title="Previous week"
        aria-label="Previous week"
        @click="$emit('prev')"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3L5 7l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </UButton>

      <div>
        <div class="text-[15px] font-bold text-(--text-primary) tracking-[-0.2px] whitespace-nowrap min-w-[180px] text-center">{{ label }}</div>
        <div class="text-[11px] text-(--text-muted) font-medium text-center mt-px">{{ sub }}</div>
      </div>

      <UButton
        variant="outline"
        color="neutral"
        class="size-8 justify-center hover:border-primary hover:text-primary hover:bg-primary/5 dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
        title="Next week"
        aria-label="Next week"
        @click="$emit('next')"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </UButton>

      <UButton
        variant="ghost"
        color="primary"
        size="xs"
        class="ml-1 font-semibold"
        @click="$emit('today')"
      >Today</UButton>
    </div>

    <CalendarViewToggle :model-value="view" @update:model-value="$emit('update:view', $event)" />

    <div class="flex gap-2.5 items-center">
      <UButton
        variant="outline"
        color="neutral"
        class="hover:border-primary hover:text-primary hover:bg-primary/5 dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
        @click="$emit('set-availability')"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M6.5 4v2.5M4 7.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Set Availability
      </UButton>

      <UButton
        color="primary"
        @click="$emit('schedule-session')"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1v11M1 6.5h11" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        Schedule Session
      </UButton>
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
