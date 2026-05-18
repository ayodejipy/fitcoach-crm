<template>
  <div class="w-[268px] shrink-0 sticky top-20 flex flex-col gap-3.5">
    <div class="panel-card bg-(--bg-surface) border border-(--border) rounded-[14px] overflow-hidden">
      <div class="py-3.5 px-[18px] pb-2.5 border-b border-(--border-muted) flex items-center justify-between">
        <span class="text-sm font-bold text-(--text-primary)">This Week</span>
        <a href="#" class="text-xs font-semibold text-primary dark:text-(--green-light) cursor-pointer">Print schedule</a>
      </div>

      <div class="py-1">
        <template v-for="group in groupedSessions" :key="group.label">
          <div class="py-1.5 px-[18px] pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-[0.7px] text-[#8FAD97] dark:text-(--text-muted) bg-[#FAFCFB] dark:bg-white/[.02] border-b border-[#F5F7F5] dark:border-(--border-muted)">
            {{ group.label }}
          </div>
          <UpcomingSessionItem
            v-for="session in group.items"
            :key="`${group.label}-${session.name}-${session.time}`"
            v-bind="session"
          />
        </template>
      </div>

      <div class="py-3.5 px-[18px] border-t-[1.5px] border-(--border-muted)">
        <div class="flex justify-between items-center text-xs mb-1.5">
          <strong class="font-bold text-(--text-primary)">{{ confirmed }} of {{ total }} sessions confirmed</strong>
          <span class="text-(--text-muted)">{{ total - confirmed }} pending</span>
        </div>
        <div class="h-1.5 bg-[#E8F2EC] dark:bg-white/5 rounded-[10px] overflow-hidden">
          <div
            class="h-full rounded-[10px] transition-[width] duration-300"
            :style="{ width: `${confirmPct}%`, background: 'linear-gradient(90deg, #1A7A4A, #2ECC71)' }"
          ></div>
        </div>
        <div class="text-[11px] text-[#8FAD97] dark:text-(--text-muted) mt-1.5">{{ footerHint }}</div>
      </div>
    </div>

    <WeekAtAGlance :sessions="total" :hours="hours" :delta-sessions="deltaSessions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UpcomingSessionItem from './UpcomingSessionItem.vue'
import WeekAtAGlance from './WeekAtAGlance.vue'

export interface UpcomingSession {
  time: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  type: string
  status: 'confirmed' | 'pending'
  today?: boolean
  past?: boolean
}

export interface UpcomingGroup {
  label: string
  items: UpcomingSession[]
}

const props = defineProps<{
  groupedSessions: UpcomingGroup[]
  confirmed: number
  total: number
  footerHint: string
  hours: string
  deltaSessions: string
}>()

const confirmPct = computed(() => props.total ? (props.confirmed / props.total) * 100 : 0)
</script>
