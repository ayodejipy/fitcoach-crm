<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import SessionBlock, { type SessionType } from './SessionBlock.vue'

export interface SessionData {
  id: string
  client: string
  type: string
  shortType?: string
  time: string
  startsAt: string
  durationMins: number
  location: string
  sessionType: SessionType
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  status: 'confirmed' | 'pending'
  top: number
  height: number
  short?: boolean
  unconfirmed?: boolean
  badge?: string
}

export interface UnavailableBlock { top: number; height: number; label: string }

export interface DayColumn {
  id: string
  dayName: string
  dayNum: string
  today?: boolean
  weekend?: boolean
  muted?: boolean
  sessions: SessionData[]
  unavailable?: UnavailableBlock[]
  currentTimeTop?: number
}

defineProps<{
  days: DayColumn[]
  timeLabels: string[]
}>()

defineEmits<{
  'session-click': [event: MouseEvent, session: SessionData]
}>()

const calBodyEl = useTemplateRef<HTMLElement>('calBodyEl')

onMounted(() => {
  if (calBodyEl.value) calBodyEl.value.scrollTop = 440
})
</script>

<template>
  <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden">
    <div class="flex border-b border-(--border) sticky top-16 bg-(--bg-surface) z-[100]">
      <div class="w-[60px] shrink-0 border-r border-(--border-muted)" />
      <div class="flex-1 grid grid-cols-7" role="row">
        <div
          v-for="day in days"
          :key="day.id"
          class="py-2 text-center border-r border-(--border-muted) last:border-r-0 relative"
          :class="{ 'bg-(--bg-primary-soft)/30': day.today }"
          role="columnheader"
        >
          <div
            class="text-[11px] font-semibold uppercase tracking-wide"
            :class="day.muted ? 'text-(--text-muted)' : day.today ? 'text-(--green-brand)' : 'text-(--text-secondary)'"
          >{{ day.dayName }}</div>

          <div v-if="day.today" class="flex justify-center mt-1">
            <div class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-(--green-brand) text-white text-[13px] font-semibold tabular-nums">
              {{ day.dayNum }}
            </div>
          </div>
          <div
            v-else
            class="text-[16px] font-semibold mt-0.5 tabular-nums tracking-tight"
            :class="day.muted ? 'text-(--text-muted)' : 'text-(--text-primary)'"
          >{{ day.dayNum }}</div>
        </div>
      </div>
    </div>

    <div ref="calBodyEl" class="cal-body flex overflow-y-auto max-h-[628px]">
      <div class="flex min-h-[784px] sm:min-h-[1344px] w-full">
        <div class="w-[60px] shrink-0 border-r border-(--border-muted) relative">
          <div
            v-for="label in timeLabels"
            :key="label"
            class="h-14 flex items-start justify-end pr-2.5 text-[11px] font-semibold text-(--text-secondary) tabular-nums"
          >
            <span class="-mt-[6px]">{{ label }}</span>
          </div>
        </div>

        <div class="days-grid flex-1 grid grid-cols-7 relative">
          <div
            v-for="day in days"
            :key="day.id"
            class="relative border-r border-(--border-muted) last:border-r-0 min-h-[784px] sm:min-h-[1344px]"
            :class="[
              day.today ? 'bg-(--green-pale)/40' : '',
              day.weekend ? 'bg-(--bg-subtle)/50' : '',
            ]"
          >
            <div
              v-for="(block, idx) in day.unavailable ?? []"
              :key="`unavail-${idx}`"
              class="unavail absolute left-0 right-0 z-[4] pointer-events-none"
              :style="{ top: `${block.top}px`, height: `${block.height}px` }"
            >
              <div class="absolute left-0 right-0 flex items-center justify-center pointer-events-none" :style="{ top: `${Math.max(0, block.height / 2 - 12)}px` }">
                <span class="text-[9.5px] font-semibold text-(--text-muted) uppercase tracking-wide bg-(--bg-surface) py-0.5 px-1.5 rounded">
                  {{ block.label }}
                </span>
              </div>
            </div>

            <div
              v-if="day.currentTimeTop !== undefined"
              class="current-time absolute -left-1 right-0 h-[1.5px] bg-(--red) z-30 pointer-events-none"
              :style="{ top: `${day.currentTimeTop}px` }"
            />

            <SessionBlock
              v-for="session in day.sessions"
              :key="session.id"
              v-bind="session"
              @click="$emit('session-click', $event, session)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4 px-4 py-2.5 border-t border-(--border-muted) flex-wrap">
      <span class="text-[11px] font-semibold uppercase tracking-wide text-(--text-muted)">Legend</span>
      <div class="flex items-center gap-1.5 text-[11.5px] font-medium text-(--text-secondary)">
        <span class="w-2.5 h-2.5 rounded-sm bg-(--info)" />Virtual
      </div>
      <div class="flex items-center gap-1.5 text-[11.5px] font-medium text-(--text-secondary)">
        <span class="w-2.5 h-2.5 rounded-sm bg-(--green-brand)" />In-person
      </div>
      <div class="flex items-center gap-1.5 text-[11.5px] font-medium text-(--text-secondary)">
        <span class="w-2.5 h-2.5 rounded-sm bg-[#9B59B6]" />Group
      </div>
      <div class="flex items-center gap-1.5 text-[11.5px] font-medium text-(--text-secondary)">
        <span class="legend-dot-unavail w-2.5 h-2.5 rounded-sm border border-(--border)" />Unavailable
      </div>
      <div class="flex items-center gap-1.5 text-[11.5px] font-medium text-(--text-secondary) ml-auto">
        <span class="w-5 h-[2px] rounded legend-stripe" />Unconfirmed
      </div>
    </div>
  </div>
</template>

<style scoped>
.days-grid {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    var(--border-muted) 27px,
    var(--border-muted) 28px,
    transparent 28px,
    transparent 55px,
    var(--border) 55px,
    var(--border) 56px
  );
}

.unavail {
  background-color: var(--bg-subtle);
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    rgba(0, 0, 0, 0.035) 4px,
    rgba(0, 0, 0, 0.035) 8px
  );
}

.current-time::before {
  content: '';
  position: absolute;
  left: -4px;
  top: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red);
}

.legend-dot-unavail {
  background-image: repeating-linear-gradient(
    -45deg, var(--bg-subtle), var(--bg-subtle) 3px, rgba(0, 0, 0, 0.08) 3px, rgba(0, 0, 0, 0.08) 6px
  );
}

.legend-stripe {
  background: repeating-linear-gradient(
    90deg,
    var(--text-muted) 0,
    var(--text-muted) 3px,
    transparent 3px,
    transparent 6px
  );
}

.cal-body::-webkit-scrollbar { width: 6px; }
.cal-body::-webkit-scrollbar-track { background: transparent; }
.cal-body::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
</style>

<style>
.dark .unavail {
  background-color: rgba(255, 255, 255, 0.02);
  background-image: repeating-linear-gradient(
    -45deg,
    transparent, transparent 4px,
    rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 8px
  );
}
.dark .legend-dot-unavail {
  background-image: repeating-linear-gradient(
    -45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, rgba(255,255,255,.12) 3px, rgba(255,255,255,.12) 6px
  );
}
</style>
