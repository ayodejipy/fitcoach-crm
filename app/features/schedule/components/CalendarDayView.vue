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
  if (calBodyEl.value) calBodyEl.value.scrollTop = 446 // start at 12 AM
})

const hasMeaningfulUnavailable = computed(() =>
  (props.day.unavailable ?? []).some(b => b.height < 784),
)

function sessionBg(type: SessionType): string {
  if (type === 'virtual')  return 'bg-[#3498DB] hover:brightness-110'
  if (type === 'group')    return 'bg-[#9B59B6] hover:brightness-110'
  return 'bg-primary hover:brightness-110'
}
</script>

<template>
  <div class="cal-card bg-(--bg-surface) border border-(--border) rounded-[14px] overflow-hidden">
    <!-- Day header -->
    <div class="flex items-center gap-3 px-5 py-3.5 border-b-[1.5px] border-(--border) sticky top-16 bg-(--bg-surface) z-[100]">
      <div
        class="flex items-center justify-center w-10 h-10 rounded-full font-extrabold text-xl"
        :class="day.today ? 'bg-primary text-white' : 'text-(--text-primary)'"
      >
        {{ day.dayNum }}
      </div>
      <div>
        <div
          class="text-[13px] font-bold uppercase tracking-[0.6px]"
          :class="day.today ? 'text-primary dark:text-(--green-light)' : 'text-(--text-muted)'"
        >
          {{ day.dayName }}
          <span v-if="day.today" class="ml-1.5 text-[11px] normal-case tracking-normal font-semibold opacity-70">Today</span>
        </div>
        <div class="text-[12px] text-(--text-muted) mt-px">
          {{ day.sessions.length }} session{{ day.sessions.length === 1 ? '' : 's' }}
        </div>
      </div>
    </div>

    <!-- Scrollable body -->
    <div ref="calBodyEl" class="cal-day-body flex overflow-y-auto max-h-[628px]">
      <div class="flex min-h-[784px] sm:min-h-[1344px] w-full">
        <!-- Time labels -->
        <div class="w-[54px] shrink-0 border-r border-(--border) relative">
          <div
            v-for="label in timeLabels"
            :key="label"
            class="h-14 flex items-start justify-end pr-2 text-[10px] font-semibold text-[#8FAD97] dark:text-(--text-muted)"
          >
            <span class="-mt-[6px]">{{ label }}</span>
          </div>
        </div>

        <!-- Single day column -->
        <div
          class="day-col-single flex-1 relative min-h-[784px] sm:min-h-[1344px]"
          :class="day.today ? 'bg-primary/[0.03]' : ''"
        >
          <!-- Unavailable blocks -->
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
              <span class="text-[10px] font-semibold text-[#8FAD97] dark:text-(--text-muted) uppercase tracking-[0.5px] bg-[#F7FAF8] dark:bg-(--bg-surface-raised) py-0.5 px-2 rounded-[10px]">
                {{ block.label }}
              </span>
            </div>
          </div>

          <!-- Current time indicator -->
          <div
            v-if="day.currentTimeTop !== undefined"
            class="current-time-day absolute -left-1 right-0 h-0.5 bg-[#E74C3C] z-30 pointer-events-none"
            :style="{ top: `${day.currentTimeTop}px` }"
          />

          <!-- Sessions — full width, more detail -->
          <div
            v-for="session in day.sessions"
            :key="session.id"
            class="day-session absolute left-2 right-2 rounded-xl px-3.5 py-2 z-10 cursor-pointer transition-all duration-150"
            :class="sessionBg(session.sessionType)"
            :style="{ top: `${session.top}px`, height: `${session.height}px` }"
            @click="$emit('session-click', $event, session)"
          >
            <div class="flex items-start justify-between gap-2 h-full">
              <div class="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
                <div class="text-white font-bold text-[13px] leading-tight truncate">{{ session.client }}</div>
                <div class="text-white/75 text-[11px] truncate" v-if="session.height > 42">{{ session.type }}</div>
                <div class="text-white/65 text-[10px] font-semibold truncate" v-if="session.height > 56">{{ session.time }}</div>
              </div>
              <div class="flex flex-col items-end gap-1 shrink-0" v-if="session.height > 42">
                <div
                  v-if="!session.unconfirmed"
                  class="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center"
                >
                  <UIcon name="i-hugeicons-checkmark-circle-02" class="size-3 text-white" />
                </div>
                <div
                  v-else
                  class="text-[9px] font-bold text-white/80 bg-white/20 px-1.5 py-0.5 rounded-full"
                >Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="day.sessions.length === 0 && !hasMeaningfulUnavailable"
      class="py-10 text-center text-(--text-muted) text-[13px]"
    >
      No sessions scheduled
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
    </div>
  </div>
</template>

<style scoped>
.day-col-single {
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

.unavail-day {
  background-color: #F7FAF8;
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
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #E74C3C;
}
.current-time-day::after {
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

.cal-day-body::-webkit-scrollbar { width: 6px; }
.cal-day-body::-webkit-scrollbar-track { background: transparent; }
.cal-day-body::-webkit-scrollbar-thumb { background: #D1E0D5; border-radius: 3px; }
</style>

<style>
.dark .day-col-single {
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
.dark .unavail-day {
  background-color: rgba(255, 255, 255, 0.02);
  background-image: repeating-linear-gradient(
    -45deg, transparent, transparent 4px,
    rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 8px
  );
}
.dark .current-time-day::after { background: var(--bg-surface); }
.dark .cal-day-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); }
</style>
