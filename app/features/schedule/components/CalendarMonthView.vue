<template>
  <div class="bg-(--bg-surface) border border-(--border) rounded-[14px] overflow-hidden">
    <!-- Month header -->
    <div class="flex items-center justify-between px-5 py-3.5 border-b-[1.5px] border-(--border) sticky top-16 bg-(--bg-surface) z-[100]">
      <div class="text-[15px] font-extrabold text-(--text-primary) tracking-[-0.3px]">
        {{ monthLabel }}
      </div>
      <div class="text-[12px] text-(--text-muted) font-semibold">
        {{ totalThisMonth }} session{{ totalThisMonth === 1 ? '' : 's' }}
      </div>
    </div>

    <!-- Weekday names -->
    <div class="grid grid-cols-7 border-b border-(--border-muted)">
      <div
        v-for="name in DAY_NAMES"
        :key="name"
        class="py-2 text-center text-[11px] font-bold uppercase tracking-[0.6px]"
        :class="['Sat', 'Sun'].includes(name) ? 'text-[#B0C4B8] dark:text-(--text-muted)' : 'text-(--text-muted)'"
      >
        {{ name }}
      </div>
    </div>

    <!-- Month grid -->
    <div class="month-grid">
      <div
        v-for="(week, wi) in grid"
        :key="wi"
        class="grid grid-cols-7 border-b border-(--border-muted) last:border-b-0"
      >
        <div
          v-for="cell in week"
          :key="cell.date.toISOString()"
          class="month-cell border-r border-(--border-muted) last:border-r-0 p-2 min-h-[100px] cursor-pointer transition-colors"
          :class="[
            cell.isCurrentMonth ? 'bg-(--bg-surface)' : 'bg-black/[0.012] dark:bg-white/[0.01]',
            cell.isWeekend && cell.isCurrentMonth ? 'bg-black/[0.012] dark:bg-white/[0.012]' : '',
            cell.isToday ? 'ring-1 ring-inset ring-primary/30 dark:ring-(--green-light)/20' : '',
            'hover:bg-primary/[0.04] dark:hover:bg-white/[0.04]',
          ]"
          @click="$emit('day-click', cell.date)"
        >
          <!-- Day number -->
          <div class="flex items-center justify-between mb-1.5">
            <div
              class="flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-extrabold transition-colors"
              :class="[
                cell.isToday ? 'bg-primary text-white' : '',
                !cell.isToday && cell.isCurrentMonth ? 'text-(--text-primary)' : '',
                !cell.isCurrentMonth ? 'text-[#BDC3C7] dark:text-(--text-muted)' : '',
              ]"
            >
              {{ cell.dayNum }}
            </div>
          </div>

          <!-- Session dots -->
          <div class="flex flex-col gap-0.5">
            <div
              v-for="(s, si) in cellSessions(cell.date).slice(0, MAX_DOTS)"
              :key="si"
              class="session-dot flex items-center gap-1 rounded-[5px] px-1.5 py-[2px] text-white truncate"
              :class="dotBg(s.session_type)"
            >
              <span class="text-[10px] font-semibold truncate leading-tight">{{ s.title ?? 'Session' }}</span>
            </div>

            <div
              v-if="cellSessions(cell.date).length > MAX_DOTS"
              class="text-[10px] font-semibold text-(--text-muted) pl-1"
            >
              +{{ cellSessions(cell.date).length - MAX_DOTS }} more
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, isSameDay, isSameMonth, parseISO, startOfMonth } from 'date-fns'
import type { ModelsCoachSession } from '~/services/types.gen'
import { buildMonthGrid } from '~/features/schedule/utils/calendar'

const props = defineProps<{
  currentMonth: Date
  sessions: ModelsCoachSession[]
}>()

defineEmits<{
  'day-click': [date: Date]
}>()

const MAX_DOTS = 3

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const grid = computed(() => buildMonthGrid(props.currentMonth))

const monthLabel = computed(() => format(props.currentMonth, 'MMMM yyyy'))

const totalThisMonth = computed(() =>
  props.sessions.filter(s =>
    s.starts_at && isSameMonth(parseISO(s.starts_at), props.currentMonth),
  ).length,
)

function cellSessions(date: Date): ModelsCoachSession[] {
  return props.sessions.filter(s =>
    s.starts_at && isSameDay(parseISO(s.starts_at), date),
  )
}

function dotBg(type?: string): string {
  if (type === 'virtual')  return 'bg-[#3498DB]'
  if (type === 'group')    return 'bg-[#9B59B6]'
  return 'bg-primary'
}
</script>

<style scoped>
.month-cell {
  min-height: 100px;
}
</style>
