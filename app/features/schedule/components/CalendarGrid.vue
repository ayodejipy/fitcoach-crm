<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import SessionBlock, { type SessionType } from './SessionBlock.vue'

export interface SessionData {
  id: string
  client: string
  type: string
  shortType?: string
  time: string
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
  if (calBodyEl.value) calBodyEl.value.scrollTop = 440 // start at 12 AM
})
</script>

<template>
  <div class="cal-card bg-(--bg-surface) border border-(--border) rounded-[14px] overflow-hidden">
    <!-- Day header row -->
    <div class="cal-head flex border-b-[1.5px] border-(--border) sticky top-16 bg-(--bg-surface) z-[100]">
      <div class="w-[54px] shrink-0 border-r border-(--border)"></div>
      <div class="flex-1 grid grid-cols-7">
        <div
          v-for="day in days"
          :key="day.id"
          class="day-head py-2.5 text-center border-r border-[#F0F4F1] dark:border-(--border-muted) last:border-r-0 relative"
          :class="{ 'is-today': day.today }"
        >
          <div
            class="text-[11px] font-bold uppercase tracking-[0.6px]"
            :class="day.muted ? 'text-[#B0C4B8] dark:text-(--text-muted)' : day.today ? 'text-primary dark:text-(--green-light)' : 'text-(--text-muted)'"
          >{{ day.dayName }}</div>

          <div v-if="day.today" class="flex justify-center mt-0.5 mb-2.5">
            <div class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white text-xl font-extrabold">
              {{ day.dayNum }}
            </div>
          </div>
          <div
            v-else
            class="text-xl font-extrabold mt-0.5 tracking-[-0.5px]"
            :class="day.muted ? 'text-[#BDC3C7] dark:text-(--text-muted)' : 'text-(--text-primary)'"
          >{{ day.dayNum }}</div>
        </div>
      </div>
    </div>

    <!-- Scrollable body -->
    <div ref="calBodyEl" class="cal-body flex overflow-y-auto max-h-[628px]">
      <div class="flex min-h-[784px] sm:min-h-[1344px] w-full">
        <!-- Time labels -->
        <div class="w-[54px] shrink-0 border-r border-(--border) relative">
          <div
            v-for="label in timeLabels"
            :key="label"
            class="h-14 flex items-start justify-end pr-2 text-[10px] font-semibold text-[#8FAD97] dark:text-(--text-muted) relative"
          >
            <span class="-mt-[6px]">{{ label }}</span>
          </div>
        </div>

        <!-- 7-day grid -->
        <div class="days-grid flex-1 grid grid-cols-7 relative">
          <div
            v-for="day in days"
            :key="day.id"
            class="day-col relative border-r border-[#F0F4F1] dark:border-(--border-muted) last:border-r-0 min-h-[784px] sm:min-h-[1344px]"
            :class="[
              day.today ? 'bg-primary/[0.03]' : '',
              day.weekend ? 'bg-black/[0.012] dark:bg-white/[0.012]' : '',
            ]"
          >
            <!-- Unavailable blocks -->
            <div
              v-for="(block, idx) in day.unavailable ?? []"
              :key="`unavail-${idx}`"
              class="unavail absolute left-0 right-0 z-[4] pointer-events-none"
              :style="{ top: `${block.top}px`, height: `${block.height}px` }"
            >
              <div class="absolute left-0 right-0 flex items-center justify-center pointer-events-none" :style="{ top: `${Math.max(0, block.height / 2 - 12)}px` }">
                <span class="text-[10px] font-semibold text-[#8FAD97] dark:text-(--text-muted) uppercase tracking-[0.5px] bg-[#F7FAF8] dark:bg-(--bg-surface-raised) py-0.5 px-2 rounded-[10px]">
                  {{ block.label }}
                </span>
              </div>
            </div>

            <!-- Current time indicator -->
            <div
              v-if="day.currentTimeTop !== undefined"
              class="current-time absolute -left-1 right-0 h-0.5 bg-[#E74C3C] z-30 pointer-events-none"
              :style="{ top: `${day.currentTimeTop}px` }"
            ></div>

            <!-- Sessions -->
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

    <!-- Legend -->
    <div class="flex items-center gap-3.5 py-2.5 px-[18px] border-t border-(--border-muted) flex-wrap">
      <span class="text-[11px] font-semibold text-(--text-muted) mr-0.5">Legend:</span>
      <div class="flex items-center gap-1.5 text-[11px] text-(--text-muted) font-medium">
        <div class="w-2.5 h-2.5 rounded-[3px] bg-[#3498DB] shrink-0"></div>Virtual / Zoom
      </div>
      <div class="flex items-center gap-1.5 text-[11px] text-(--text-muted) font-medium">
        <div class="w-2.5 h-2.5 rounded-[3px] bg-primary shrink-0"></div>In-person
      </div>
      <div class="flex items-center gap-1.5 text-[11px] text-(--text-muted) font-medium">
        <div class="w-2.5 h-2.5 rounded-[3px] bg-[#9B59B6] shrink-0"></div>Group session
      </div>
      <div class="flex items-center gap-1.5 text-[11px] text-(--text-muted) font-medium">
        <div class="legend-dot-unavail w-2.5 h-2.5 rounded-[3px] border border-[#D1E0D5] dark:border-(--border) shrink-0"></div>Unavailable
      </div>
      <div class="flex items-center gap-1.5 text-[11px] text-(--text-muted) font-medium ml-auto">
        <div class="w-6 h-[3px] rounded-[2px] mr-1 legend-stripe"></div>
        Unconfirmed
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Hour grid lines on the days grid */
.days-grid {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    rgba(229, 237, 232, 0.5) 27px,
    rgba(229, 237, 232, 0.5) 28px,
    transparent 28px,
    transparent 55px,
    #E5EDE8 55px,
    #E5EDE8 56px
  );
}

/* Red dot on today's column header */
.day-head.is-today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #E74C3C;
}

/* Unavailable block: diagonal stripes */
.unavail {
  background-color: #F7FAF8;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    rgba(0, 0, 0, 0.035) 4px,
    rgba(0, 0, 0, 0.035) 8px
  );
}

/* Current time red line: knob + "Now" bubble */
.current-time::before {
  content: '';
  position: absolute;
  left: -4px;
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #E74C3C;
}
.current-time::after {
  content: 'Now';
  position: absolute;
  right: 4px;
  top: -8px;
  font-size: 9px;
  font-weight: 700;
  color: #E74C3C;
  background: #fff;
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid #E74C3C;
}

.legend-dot-unavail {
  background-image: repeating-linear-gradient(
    -45deg, #F7FAF8, #F7FAF8 3px, rgba(0, 0, 0, 0.08) 3px, rgba(0, 0, 0, 0.08) 6px
  );
}

.legend-stripe {
  background: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.2) 0,
    rgba(0, 0, 0, 0.2) 4px,
    transparent 4px,
    transparent 8px
  );
}

/* Scrollbar */
.cal-body::-webkit-scrollbar { width: 6px; }
.cal-body::-webkit-scrollbar-track { background: transparent; }
.cal-body::-webkit-scrollbar-thumb { background: #D1E0D5; border-radius: 3px; }
</style>

<style>
.dark .days-grid {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    rgba(255, 255, 255, 0.04) 27px,
    rgba(255, 255, 255, 0.04) 28px,
    transparent 28px,
    transparent 55px,
    rgba(255, 255, 255, 0.08) 55px,
    rgba(255, 255, 255, 0.08) 56px
  );
}
.dark .unavail {
  background-color: rgba(255, 255, 255, 0.02);
  background-image: repeating-linear-gradient(
    -45deg,
    transparent, transparent 4px,
    rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 8px
  );
}
.dark .current-time::after { background: var(--bg-surface); }
.dark .legend-dot-unavail {
  background-image: repeating-linear-gradient(
    -45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, rgba(255,255,255,.12) 3px, rgba(255,255,255,.12) 6px
  );
}
.dark .legend-stripe {
  background: repeating-linear-gradient(
    90deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 4px, transparent 4px, transparent 8px
  );
}
.dark .cal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); }
</style>
