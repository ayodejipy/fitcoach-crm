<script setup lang="ts">
import { format, isSameDay, isSameMonth, parseISO } from 'date-fns'
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
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

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
  if (type === 'virtual')  return 'bg-(--info)'
  if (type === 'group')    return 'bg-[#9B59B6]'
  return 'bg-(--green-brand)'
}
</script>

<template>
  <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden">
    <header class="flex items-baseline justify-between px-5 py-3 border-b border-(--border)">
      <h2 class="text-[14px] font-semibold tracking-tight text-(--text-primary)">{{ monthLabel }}</h2>
      <span class="text-[11.5px] text-(--text-secondary) tabular-nums font-medium">
        {{ totalThisMonth }} session{{ totalThisMonth === 1 ? '' : 's' }}
      </span>
    </header>

    <div class="grid grid-cols-7 border-b border-(--border) bg-(--bg-subtle)/40" role="row">
      <div
        v-for="(name, idx) in DAY_NAMES"
        :key="name"
        class="py-2 text-center text-[10.5px] font-semibold uppercase tracking-wide"
        :class="idx >= 5 ? 'text-(--text-muted)' : 'text-(--text-secondary)'"
        role="columnheader"
      >
        {{ name }}
      </div>
    </div>

    <div>
      <div
        v-for="(week, wi) in grid"
        :key="wi"
        class="grid grid-cols-7 border-b border-(--border-muted) last:border-b-0"
      >
        <button
          v-for="cell in week"
          :key="cell.date.toISOString()"
          type="button"
          class="month-cell border-r border-(--border-muted) last:border-r-0 p-2 min-h-[108px] text-left transition-colors hover:bg-(--bg-subtle)/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--green-brand)"
          :class="[
            cell.isCurrentMonth ? 'bg-(--bg-surface)' : 'bg-(--bg-subtle)/30',
            cell.isWeekend && cell.isCurrentMonth ? 'bg-(--bg-subtle)/40' : '',
            cell.isToday ? 'ring-1 ring-inset ring-(--green-brand)/40' : '',
          ]"
          @click="$emit('day-click', cell.date)"
        >
          <div
            class="inline-flex items-center justify-center w-7 h-7 rounded-full text-[12.5px] font-semibold tabular-nums mb-1.5"
            :class="[
              cell.isToday
                ? 'bg-(--green-brand) text-white'
                : !cell.isCurrentMonth
                  ? 'text-(--text-muted)'
                  : 'text-(--text-primary)',
            ]"
          >
            {{ cell.dayNum }}
          </div>

          <div class="flex flex-col gap-0.5">
            <div
              v-for="(session, si) in cellSessions(cell.date).slice(0, MAX_DOTS)"
              :key="si"
              class="flex items-center gap-1 rounded px-1.5 py-[2px] truncate"
              :class="dotBg(session.session_type)"
            >
              <span class="text-[10px] font-semibold text-white truncate leading-tight">{{ session.title ?? 'Session' }}</span>
            </div>

            <div
              v-if="cellSessions(cell.date).length > MAX_DOTS"
              class="text-[10.5px] font-semibold text-(--text-secondary) pl-1"
            >
              +{{ cellSessions(cell.date).length - MAX_DOTS }} more
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
