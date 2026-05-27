<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { format } from 'date-fns'
import AppTopbar from '~/components/AppTopbar.vue'
import CalendarControlBar from '~/features/schedule/components/CalendarControlBar.vue'
import CalendarGrid, { type SessionData } from '~/features/schedule/components/CalendarGrid.vue'
import CalendarDayView from '~/features/schedule/components/CalendarDayView.vue'
import CalendarMonthView from '~/features/schedule/components/CalendarMonthView.vue'
import SessionPopover from '~/features/schedule/components/SessionPopover.vue'
import ScheduleSidePanel from '~/features/schedule/components/ScheduleSidePanel.vue'
import ScheduleSessionModal from '~/features/schedule/components/ScheduleSessionModal.vue'
import SetAvailabilityDrawer from '~/features/schedule/components/SetAvailabilityDrawer.vue'
import { useScheduleState } from '~/features/schedule/composables/useScheduleState'
import { useScheduleData } from '~/features/schedule/composables/useScheduleData'
import { useScheduleApi } from '~/features/schedule/composables/useScheduleApi'

definePageMeta({ layout: 'app' })

const toast = useToast()
const { cancel } = useScheduleApi()
const scheduleOpen   = ref(false)
const availabilityOpen = ref(false)
// Holds the session being edited; null means the modal is in "create" mode.
const editingSession = ref<SessionData | null>(null)

const TIME_LABELS = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM','7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
]

// State & navigation 
const {
  currentWeek,
  view,
  selectedDayDate,
  prevWeek,
  nextWeek,
  goToday,
  goToDay,
  liveNowTop,
} = useScheduleState()

// Data 
const {
  days,
  sessions,
  weekLabel,
  weekSub,
  upcomingGroups,
  confirmedCount,
  totalCount,
  totalHours,
  pending,
  refresh,
} = useScheduleData(currentWeek, liveNowTop, view)

// Column for the selected day (day view)
const todayColumn = computed(() => {
  const target = selectedDayDate.value
  return days.value.find(d => d.id === format(target, 'yyyy-MM-dd'))
    ?? days.value[0]
    ?? { id: '', dayName: '', dayNum: '', sessions: [], today: false }
})

const footerHint = computed(() => {
  const pending = upcomingGroups.value
    .flatMap(g => g.items)
    .filter(i => i.status === 'pending')
    .slice(0, 3)
    .map(i => i.name.split(' ')[0])
  if (!pending.length) return ''
  return `Send reminders to ${pending.join(', ')} →`
})

// Popover 
const popover = reactive({ open: false, session: null as SessionData | null })

function onSessionClick(event: MouseEvent, session: SessionData) {
  event.stopPropagation()
  popover.session = session
  popover.open = true
}

function closePopover() { popover.open = false }

// Open the modal in create mode (no session attached).
function openCreate() {
  editingSession.value = null
  scheduleOpen.value = true
}

// Open the modal in edit mode for the popover's session.
function onEditSession() {
  if (!popover.session) return
  editingSession.value = popover.session
  popover.open = false
  scheduleOpen.value = true
}

async function onCancelSession() {
  const session = popover.session
  if (!session) return
  if (!confirm(`Cancel the session with ${session.client}?`)) return
  popover.open = false
  try {
    await cancel(session.id)
    toast.add({ title: 'Session cancelled', color: 'success' })
    refresh()
  } catch {
    toast.add({ title: 'Could not cancel session', color: 'error' })
  }
}

function onSessionScheduled() {
  toast.add({ title: 'Session scheduled!', color: 'success' })
  refresh()
}

function onSessionUpdated() {
  toast.add({ title: 'Session updated', color: 'success' })
  refresh()
}

// Availability slots are shared via useAvailability, so the calendar's
// unavailable blocks update reactively once the drawer saves.
function onAvailabilitySaved() {
  toast.add({ title: 'Availability saved', color: 'success' })
}

function onPrint() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <AppTopbar title="Schedule" :subtitle="weekSub">
    <template #actions>
      <UButton
        variant="ghost"
        color="neutral"
        class="size-9 p-0 justify-center hover:text-primary hover:bg-[#F0F4F1] dark:hover:bg-white/[.04] dark:hover:text-(--green-light)"
        title="Print schedule"
        @click="onPrint"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </UButton>
      <UButton
        variant="outline"
        color="neutral"
        class="hover:border-primary hover:text-primary hover:bg-[#F0F9F4] dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
        @click="openCreate"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1v12M1 6.5h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Schedule Session
      </UButton>
    </template>
  </AppTopbar>

  <div class="py-7 px-8 flex-1 flex flex-col gap-4 min-w-0" @click="closePopover">
    <CalendarControlBar
      :label="weekLabel"
      :sub="weekSub"
      :view="view"
      @update:view="view = $event"
      @prev="prevWeek"
      @next="nextWeek"
      @today="goToday"
      @schedule-session="openCreate"
      @set-availability="availabilityOpen = true"
    />

    <!-- Week view -->
    <div v-if="view === 'week'" class="flex gap-4 items-start">
      <div class="flex-1 min-w-0">
        <CalendarGrid
          :days="days"
          :time-labels="TIME_LABELS"
          @session-click="onSessionClick"
        />
      </div>

      <ScheduleSidePanel
        :grouped-sessions="upcomingGroups"
        :confirmed="confirmedCount"
        :total="totalCount"
        :footer-hint="footerHint"
        :hours="totalHours"
        delta-sessions=""
      />
    </div>

    <!-- Day view -->
    <div v-else-if="view === 'day'" class="flex gap-4 items-start">
      <div class="flex-1 min-w-0">
        <div v-if="pending" class="py-20 text-center text-(--text-muted) text-sm">Loading…</div>
        <CalendarDayView
          v-else
          :day="todayColumn"
          :time-labels="TIME_LABELS"
          @session-click="onSessionClick"
        />
      </div>

      <ScheduleSidePanel
        :grouped-sessions="upcomingGroups"
        :confirmed="confirmedCount"
        :total="totalCount"
        :footer-hint="footerHint"
        :hours="totalHours"
        delta-sessions=""
      />
    </div>

    <!-- Month view -->
    <div v-else>
      <CalendarMonthView
        :current-month="currentWeek"
        :sessions="sessions"
        @day-click="goToDay"
      />
    </div>
  </div>

  <SessionPopover
    v-model:open="popover.open"
    :session="popover.session"
    @edit="onEditSession"
    @cancel="onCancelSession"
  />

  <ScheduleSessionModal
    v-model:open="scheduleOpen"
    :session="editingSession"
    @scheduled="onSessionScheduled"
    @updated="onSessionUpdated"
  />
  <SetAvailabilityDrawer
    v-model:open="availabilityOpen"
    @saved="onAvailabilitySaved"
  />
</template>


