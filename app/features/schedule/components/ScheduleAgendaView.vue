<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import Avatar from '~/components/Avatar.vue'
import type { DayColumn, SessionData } from './CalendarGrid.vue'

const props = defineProps<{
  days: DayColumn[]
}>()

defineEmits<{
  sessionClick: [event: MouseEvent, session: SessionData]
}>()

const todayIdx = computed(() => props.days.findIndex(day => day.today))

const upcomingDays = computed(() =>
  todayIdx.value >= 0 ? props.days.slice(todayIdx.value) : props.days,
)

const earlierDays = computed(() =>
  todayIdx.value > 0
    ? props.days.slice(0, todayIdx.value).filter(day => day.sessions.length > 0)
    : [],
)

const earlierSessionCount = computed(() =>
  earlierDays.value.reduce((sum, day) => sum + day.sessions.length, 0),
)

function dayLabel(day: DayColumn): string {
  if (day.today) return `${format(parseISO(day.id), 'EEEE')} · Today`
  return `${format(parseISO(day.id), 'EEEE')}, ${format(parseISO(day.id), 'MMM d')}`
}

function dayMeta(day: DayColumn): string {
  const count = day.sessions.length
  if (count === 0) return ''
  const mins = day.sessions.reduce((sum, s) => sum + s.durationMins, 0)
  const hrs = (mins / 60).toFixed(1)
  return `${count} ${count === 1 ? 'session' : 'sessions'} · ${hrs} hrs`
}

function isDayOff(day: DayColumn): boolean {
  return day.sessions.length === 0
    && (!!day.weekend || day.unavailable?.[0]?.label === 'Day Off')
}

function sessionTimeParts(session: SessionData): { time: string, period: string } {
  if (!session.startsAt) return { time: '', period: '' }
  const date = parseISO(session.startsAt)
  return {
    time: format(date, 'h:mm'),
    period: format(date, 'a'),
  }
}

function leftBorderColorVar(session: SessionData): string {
  if (session.unconfirmed) return 'var(--warning)'
  if (session.sessionType === 'virtual') return 'var(--info)'
  if (session.sessionType === 'group') return 'var(--info)'
  return 'var(--green-brand)'
}

function statusBadge(session: SessionData): { color: 'success' | 'warning' | 'info', label: string } {
  if (session.unconfirmed) return { color: 'warning', label: 'Awaiting client' }
  if (session.sessionType === 'virtual') return { color: 'info', label: 'Zoom' }
  if (session.sessionType === 'group') return { color: 'info', label: 'Group' }
  return { color: 'success', label: 'In-person' }
}
</script>

<template>
  <div class="space-y-6 relative">
    <section
      v-for="day in upcomingDays"
      :key="day.id"
      :aria-labelledby="`agenda-day-${day.id}`"
      class="relative"
    >
      <div
        class="z-10 -mx-8 max-md:-mx-5 px-8 max-md:px-5 py-2 mb-2 flex items-center gap-3 backdrop-blur"
        style="background: color-mix(in oklab, var(--bg-page) 85%, transparent);"
      >
        <div
          v-if="day.today"
          aria-hidden="true"
          class="inline-flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full text-[11px] font-semibold text-white tabular-nums bg-(--green-brand)"
        >
          {{ day.sessions.length }}
        </div>
        <h2
          :id="`agenda-day-${day.id}`"
          class="text-[14px] font-semibold"
          :class="day.today ? 'text-(--text-primary)' : 'text-(--text-secondary)'"
        >
          {{ dayLabel(day) }}
        </h2>
        <span v-if="dayMeta(day)" class="text-[12px] font-medium text-(--text-secondary) tabular-nums">{{ dayMeta(day) }}</span>
        <span
          v-if="isDayOff(day)"
          class="rounded-full bg-(--bg-subtle) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)"
        >
          Day off
        </span>
        <div class="flex-1 h-px bg-(--border)" />
      </div>

      <div class="space-y-2">
        <button
          v-for="session in day.sessions"
          :key="session.id"
          type="button"
          class="w-full flex items-stretch gap-3 rounded-[10px] border-l-[3px] border bg-(--bg-surface) p-3.5 text-left hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-(--green-brand) focus-visible:outline-none transition-shadow"
          :style="{ borderLeftColor: leftBorderColorVar(session), borderTopColor: 'var(--border)', borderRightColor: 'var(--border)', borderBottomColor: 'var(--border)' }"
          @click="$emit('sessionClick', $event, session)"
        >
          <div class="flex flex-col items-center justify-center w-16 shrink-0 border-r border-(--border) pr-3">
            <div class="flex items-baseline gap-1">
              <span
                class="text-[17px] font-semibold tabular-nums leading-none"
                :style="{ color: leftBorderColorVar(session) }"
              >{{ sessionTimeParts(session).time }}</span>
              <span class="text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wide">{{ sessionTimeParts(session).period }}</span>
            </div>
            <span class="mt-1.5 text-[11px] text-(--text-secondary) tabular-nums font-medium">{{ session.durationMins }} min</span>
          </div>

          <div class="flex items-start gap-3 flex-1 min-w-0">
            <Avatar :initials="session.initials" :variant="session.variant" :size="36" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[13.5px] font-semibold text-(--text-primary) truncate">{{ session.client }}</span>
                <UBadge
                  :label="statusBadge(session).label"
                  :color="statusBadge(session).color"
                  variant="soft"
                  size="sm"
                />
              </div>
              <div class="mt-0.5 text-[11.5px] text-(--text-secondary)">{{ session.location }}</div>
            </div>
          </div>

          <div class="flex items-center shrink-0">
            <UIcon name="i-lucide-chevron-right" class="size-4 text-(--text-muted)" />
          </div>
        </button>

        <div v-if="day.sessions.length === 0 && !isDayOff(day)" class="text-[12px] text-(--text-muted) px-3.5 py-3">
          No sessions
        </div>
      </div>
    </section>

    <details v-if="earlierDays.length > 0" class="rounded-[10px] border border-(--border) bg-(--bg-surface)">
      <summary class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-(--bg-subtle)">
        <UIcon name="i-lucide-chevron-right" class="size-3 text-(--text-muted)" />
        <span class="text-[12.5px] font-semibold text-(--text-secondary)">Earlier this week</span>
        <span class="text-[11px] text-(--text-muted) tabular-nums">
          {{ earlierSessionCount }} {{ earlierSessionCount === 1 ? 'session' : 'sessions' }} completed
        </span>
      </summary>
      <div class="px-4 pb-4 pt-1 space-y-3">
        <div v-for="day in earlierDays" :key="day.id">
          <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-1.5">
            {{ format(parseISO(day.id), 'EEEE, MMM d') }}
          </div>
          <div class="space-y-1">
            <button
              v-for="session in day.sessions"
              :key="session.id"
              type="button"
              class="w-full flex items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-(--bg-subtle)"
              @click="$emit('sessionClick', $event, session)"
            >
              <span class="text-[12px] font-semibold tabular-nums text-(--text-secondary) w-16 shrink-0">{{ sessionTimeParts(session).time }} {{ sessionTimeParts(session).period }}</span>
              <span class="text-[12.5px] font-medium text-(--text-primary) flex-1 truncate">{{ session.client }}</span>
              <span class="text-[11px] font-medium text-(--text-secondary) tabular-nums shrink-0">{{ session.durationMins }} min</span>
            </button>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>
