<template>
  <ClientProfileCard title="Current Program" link-label="Edit program">
    <template #icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="2" y="2" width="11" height="11" stroke="currentColor" stroke-width="1.3"/>
        <path d="M5 7.5l2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </template>

    <div class="flex items-center gap-2 text-sm font-bold text-(--text-primary) mb-1">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-primary dark:text-(--green-light)">
        <path d="M1 7a6 6 0 1012 0A6 6 0 001 7z" stroke="currentColor" stroke-width="1.3"/>
        <path d="M7 4v4l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      {{ programTitle }}
    </div>
    <div class="text-xs text-[#8FAD97] dark:text-(--text-muted) mb-3.5">{{ programSub }}</div>

    <WorkoutDayRow
      v-for="(day, i) in days"
      :key="day.label"
      :label="day.label"
      :type="day.type"
      :duration="day.duration"
      :done="day.done"
      @toggle="toggleDay(i)"
    />

    <div class="mt-3 py-2.5 px-3 bg-[#F7FAF8] dark:bg-white/[.03] rounded-lg border border-[#E8F0EB] dark:border-(--border) text-xs text-[#6B8F72] dark:text-(--text-muted) flex items-center gap-1.5">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="text-primary dark:text-(--green-light) shrink-0">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/>
        <path d="M6.5 4v3M6.5 8.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      <span>Coach view only — clients see their program through the client portal.</span>
    </div>
  </ClientProfileCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ClientProfileCard from './ClientProfileCard.vue'
import WorkoutDayRow from './WorkoutDayRow.vue'

export interface WorkoutDay {
  label: string
  type: string
  duration: string
  done: boolean
}

const props = defineProps<{
  programTitle: string
  programSub: string
  workoutDays: WorkoutDay[]
}>()

const days = ref<WorkoutDay[]>(props.workoutDays.map((d) => ({ ...d })))

watch(
  () => props.workoutDays,
  (next) => { days.value = next.map((d) => ({ ...d })) },
  { deep: true },
)

const toggleDay = (i: number) => {
  const d = days.value[i]
  if (d) d.done = !d.done
}
</script>
