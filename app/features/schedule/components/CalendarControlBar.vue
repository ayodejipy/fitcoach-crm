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

<template>
  <div class="flex items-center justify-between gap-4 flex-wrap rounded-[10px] border border-(--border) bg-(--bg-surface) px-4 py-2.5">
    <div class="flex items-center gap-1.5">
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-lucide-chevron-left"
        aria-label="Previous week"
        @click="$emit('prev')"
      />
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-lucide-chevron-right"
        aria-label="Next week"
        @click="$emit('next')"
      />
      <UButton
        variant="outline"
        color="neutral"
        size="xs"
        class="ml-1.5"
        @click="$emit('today')"
      >
        Today
      </UButton>

      <div class="ml-3 min-w-0">
        <div class="text-[13.5px] font-semibold text-(--text-primary) tracking-[-0.01em] whitespace-nowrap">{{ label }}</div>
        <div class="text-[10.5px] text-(--text-muted) tabular-nums">{{ sub }}</div>
      </div>
    </div>

    <CalendarViewToggle :model-value="view" @update:model-value="$emit('update:view', $event)" />
  </div>
</template>
