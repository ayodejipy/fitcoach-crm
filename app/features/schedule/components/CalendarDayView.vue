<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import type { DayColumn, SessionData } from './CalendarGrid.vue'
import type { SessionType } from './SessionBlock.vue'

const props = defineProps<{
  day: DayColumn
  timeLabels: string[]
}>()

defineEmits<{
  'session-click': [event: MouseEvent, session: SessionData]
}>()

const calBodyEl = useTemplateRef<HTMLElement>('calBodyEl')

onMounted(() => {
  if (calBodyEl.value) calBodyEl.value.scrollTop = 446
})

const hasMeaningfulUnavailable = computed(() =>
  (props.day.unavailable ?? []).some(b => b.height < 784),
)

function sessionBg(type: SessionType): string {
  if (type === 'virtual')  return 'bg-(--info) hover:brightness-110'
  if (type === 'group')    return 'bg-[#9B59B6] hover:brightness-110'
  return 'bg-(--green-brand) hover:brightness-110'
}
</script>

<template>
  <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden">
    <header class="flex items-center gap-3 px-5 py-3 border-b border-(--border)">
      <div
        class="inline-flex items-center justify-center w-10 h-10 rounded-full text-[16px] font-semibold tabular-nums"
        :class="day.today ? 'bg-(--green-brand) text-white' : 'bg-(--bg-subtle) text-(--text-primary)'"
      >
        {{ day.dayNum }}
      </div>
      <div>
        <div class="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide">
          <span :class="day.today ? 'text-(--green-brand)' : 'text-(--text-secondary)'">{{ day.dayName }}</span>
          <span v-if="day.today" class="text-[11px] normal-case tracking-normal font-semibold text-(--text-muted)">Today</span>
        </div>
        <div class="text-[12px] text-(--text-secondary) mt-0.5 tabular-nums font-medium">
          {{ day.sessions.length }} session{{ day.sessions.length === 1 ? '' : 's' }}
        </div>
      </div>
    </header>

    <div ref="calBodyEl" class="cal-day-body flex overflow-y-auto max-h-[628px]">
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

        <div
          class="day-col-single flex-1 relative min-h-[784px] sm:min-h-[1344px]"
          :class="day.today ? 'bg-(--green-pale)/30' : ''"
        >
          <div
            v-for="(block, idx) in day.unavailable ?? []"
            :key="`unavail-${idx}`"
            class="unavail-day absolute left-0 right-0 z-[4] pointer-events-none"
            :style="{ top: `${block.top}px`, height: `${block.height}px` }"
          >
            <div
              class="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
              :style="{ top: `${Math.max(0, block.height / 2 - 12)}px` }"
            >
              <span class="text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wide bg-(--bg-surface) py-1 px-2 rounded">
                {{ block.label }}
              </span>
            </div>
          </div>

          <div
            v-if="day.currentTimeTop !== undefined"
            class="current-time-day absolute -left-1 right-0 h-[1.5px] bg-(--red) z-30 pointer-events-none"
            :style="{ top: `${day.currentTimeTop}px` }"
          />

          <button
            v-for="session in day.sessions"
            :key="session.id"
            type="button"
            class="day-session absolute left-2 right-2 rounded-lg px-3.5 py-2 z-10 cursor-pointer text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--text-primary)/30"
            :class="sessionBg(session.sessionType)"
            :style="{ top: `${session.top}px`, height: `${session.height}px` }"
            :aria-label="`${session.client}, ${session.type}, ${session.time}`"
            @click="$emit('session-click', $event, session)"
          >
            <div class="flex items-start justify-between gap-2 h-full">
              <div class="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
                <div class="text-white font-semibold text-[13.5px] leading-tight truncate">{{ session.client }}</div>
                <div v-if="session.height > 42" class="text-white/85 text-[11.5px] font-medium truncate">{{ session.type }}</div>
                <div v-if="session.height > 56" class="text-white/75 text-[11px] font-semibold tabular-nums truncate">{{ session.time }}</div>
              </div>
              <div v-if="session.height > 42" class="flex flex-col items-end gap-1 shrink-0">
                <span
                  v-if="!session.unconfirmed"
                  class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/25"
                >
                  <UIcon name="i-lucide-check" class="size-3 text-white" />
                </span>
                <span
                  v-else
                  class="text-[10px] font-semibold text-white bg-white/25 px-1.5 py-0.5 rounded"
                >Pending</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="day.sessions.length === 0 && !hasMeaningfulUnavailable"
      class="py-10 text-center text-(--text-secondary) text-[13px]"
    >
      No sessions scheduled
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
    </div>
  </div>
</template>

<style scoped>
.day-col-single {
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

.unavail-day {
  background-color: var(--bg-subtle);
  background-image: repeating-linear-gradient(
    -45deg,
    transparent, transparent 4px,
    rgba(0, 0, 0, 0.035) 4px, rgba(0, 0, 0, 0.035) 8px
  );
}

.current-time-day::before {
  content: '';
  position: absolute;
  left: -4px;
  top: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red);
}

.cal-day-body::-webkit-scrollbar { width: 6px; }
.cal-day-body::-webkit-scrollbar-track { background: transparent; }
.cal-day-body::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
</style>

<style>
.dark .unavail-day {
  background-color: rgba(255, 255, 255, 0.02);
  background-image: repeating-linear-gradient(
    -45deg, transparent, transparent 4px,
    rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 8px
  );
}
</style>
