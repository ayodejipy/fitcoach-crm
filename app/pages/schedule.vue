<template>
  <AppTopbar title="Schedule" subtitle="Weekly view · April 2026">
    <template #actions>
      <button type="button" class="btn-ghost">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <button type="button" class="btn-outline">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1v12M1 6.5h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Schedule Session
      </button>
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
    />

    <div class="flex gap-4 items-start">
      <div class="flex-1 min-w-0">
        <CalendarGrid
          :days="days"
          :time-labels="timeLabels"
          @session-click="onSessionClick"
        />
      </div>

      <ScheduleSidePanel
        :grouped-sessions="upcomingGroups"
        :confirmed="6"
        :total="9"
        footer-hint="Send reminders to Priya, Dante & James →"
        hours="8.5"
        delta-sessions="+2 vs last week"
      />
    </div>
  </div>

  <SessionPopover
    :open="popover.open"
    :session="popover.session"
    :client-x="popover.x"
    :client-y="popover.y"
    @close="closePopover"
  />
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import CalendarControlBar from '~/features/schedule/components/CalendarControlBar.vue'
import CalendarGrid, { type DayColumn, type SessionData } from '~/features/schedule/components/CalendarGrid.vue'
import SessionPopover from '~/features/schedule/components/SessionPopover.vue'
import ScheduleSidePanel, { type UpcomingGroup } from '~/features/schedule/components/ScheduleSidePanel.vue'
import type { CalendarView } from '~/features/schedule/components/CalendarViewToggle.vue'

definePageMeta({ layout: 'app' })

const weekLabel = 'April 14 – 20, 2026'
const weekSub = 'Week 16 of 52  ·  5 sessions this week'
const view = ref<CalendarView>('week')

const timeLabels = ['7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM']

const days: DayColumn[] = [
  {
    id: 'mon', dayName: 'Mon', dayNum: '14', today: true,
    unavailable: [{ top: 0, height: 112, label: 'Unavailable' }],
    currentTimeTop: 151,
    sessions: [
      { id: 'sr', client: 'Sofia Reyes',     type: 'Strength & Conditioning', time: '10:00 – 11:00 AM', location: 'Zoom · Meeting ID 846 291 0382', sessionType: 'virtual',  initials: 'SR', variant: 'a', status: 'confirmed', top: 168, height: 56 },
      { id: 'mt', client: 'Marcus Thompson', type: 'HIIT Training',           shortType: 'HIIT · In-person', time: '12:30 – 1:15 PM', location: 'The Fitness Lab, Austin TX',     sessionType: 'inperson', initials: 'MT', variant: 'b', status: 'confirmed', top: 308, height: 42, short: true },
      { id: 'pk', client: 'Priya Kumar',     type: 'Nutrition Check-in',      shortType: '',                 time: '4:00 – 4:30 PM',  location: 'Zoom · 15-min call',              sessionType: 'virtual',  initials: 'PK', variant: 'c', status: 'pending',   top: 504, height: 28, short: true },
    ],
  },
  {
    id: 'tue', dayName: 'Tue', dayNum: '15',
    sessions: [
      { id: 'ek', client: 'Elena Kowalski', type: 'Strength Training', time: '9:00 – 10:00 AM',  location: 'Iron House Gym, Austin TX',   sessionType: 'inperson', initials: 'EK', variant: 'e', status: 'confirmed', top: 112, height: 56 },
      { id: 'gh', client: 'Group HIIT Class', type: '5 participants',  time: '11:00 AM – 12:30 PM', location: 'The Fitness Lab, Studio B', sessionType: 'group',    initials: 'GH', variant: 'd', status: 'confirmed', top: 224, height: 84, badge: 'Group' },
    ],
  },
  {
    id: 'wed', dayName: 'Wed', dayNum: '16',
    unavailable: [{ top: 0, height: 168, label: 'Unavailable' }],
    sessions: [
      { id: 'dw', client: 'Dante Williams', type: 'General Fitness', time: '2:00 – 3:00 PM', location: 'The Fitness Lab, Austin TX', sessionType: 'inperson', initials: 'DW', variant: 'f', status: 'pending', top: 392, height: 56, unconfirmed: true },
    ],
  },
  {
    id: 'thu', dayName: 'Thu', dayNum: '17',
    sessions: [
      { id: 'jl', client: 'James Lowe',   type: 'Marathon Prep',       time: '10:00 – 11:30 AM', location: 'Zoom · Meeting ID 210 845 6631', sessionType: 'virtual',  initials: 'JL', variant: 'g', status: 'pending',   top: 168, height: 84, unconfirmed: true },
      { id: 'an', client: 'Aisha Nwosu',  type: 'Recovery & Mobility', time: '3:00 – 4:00 PM',   location: 'Home visit · 12 Cedar Lane',       sessionType: 'inperson', initials: 'AN', variant: 'h', status: 'confirmed', top: 448, height: 56 },
    ],
  },
  {
    id: 'fri', dayName: 'Fri', dayNum: '18',
    sessions: [
      { id: 'bh', client: 'Ben Hartley', type: 'Progress Check-in Call', shortType: 'Check-in Call', time: '9:00 – 9:45 AM', location: 'Zoom · 45-min call', sessionType: 'virtual', initials: 'BH', variant: 'b', status: 'confirmed', top: 112, height: 42, short: true },
    ],
  },
  { id: 'sat', dayName: 'Sat', dayNum: '19', weekend: true, muted: true, sessions: [], unavailable: [{ top: 0, height: 784, label: 'Day Off' }] },
  { id: 'sun', dayName: 'Sun', dayNum: '20', weekend: true, muted: true, sessions: [], unavailable: [{ top: 0, height: 784, label: 'Day Off' }] },
]

const upcomingGroups: UpcomingGroup[] = [
  {
    label: 'Monday · Apr 14',
    items: [
      { time: '10:00', initials: 'SR', variant: 'a', name: 'Sofia Reyes',     type: 'Strength & Conditioning · Zoom', status: 'confirmed', today: true },
      { time: '12:30', initials: 'MT', variant: 'b', name: 'Marcus Thompson', type: 'HIIT Training · In-person',      status: 'confirmed', today: true },
      { time: '4:00',  initials: 'PK', variant: 'c', name: 'Priya Kumar',     type: 'Nutrition Call · Zoom',          status: 'pending',   today: true },
    ],
  },
  {
    label: 'Tuesday · Apr 15',
    items: [
      { time: '9:00',  initials: 'EK', variant: 'e', name: 'Elena Kowalski',   type: 'Strength Training · Gym',    status: 'confirmed' },
      { time: '11:00', initials: 'GH', variant: 'd', name: 'Group HIIT Class', type: '5 participants · Studio B', status: 'confirmed' },
    ],
  },
  {
    label: 'Wednesday · Apr 16',
    items: [
      { time: '2:00', initials: 'DW', variant: 'f', name: 'Dante Williams', type: 'General Fitness · Gym', status: 'pending' },
    ],
  },
  {
    label: 'Thursday · Apr 17',
    items: [
      { time: '10:00', initials: 'JL', variant: 'g', name: 'James Lowe',  type: 'Marathon Prep · Zoom',       status: 'pending' },
      { time: '3:00',  initials: 'AN', variant: 'h', name: 'Aisha Nwosu', type: 'Recovery & Mobility · Home', status: 'confirmed' },
    ],
  },
  {
    label: 'Friday · Apr 18',
    items: [
      { time: '9:00', initials: 'BH', variant: 'b', name: 'Ben Hartley', type: 'Progress Call · Zoom', status: 'confirmed' },
    ],
  },
]

const popover = reactive({ open: false, session: null as SessionData | null, x: 0, y: 0 })

const onSessionClick = (event: MouseEvent, session: SessionData) => {
  event.stopPropagation()
  popover.session = session
  popover.x = event.clientX
  popover.y = event.clientY
  popover.open = true
}

const closePopover = () => { popover.open = false }

const prevWeek = () => { /* TODO: step back one week */ }
const nextWeek = () => { /* TODO: step forward one week */ }
const goToday = () => { /* TODO: snap to today */ }
</script>

<style scoped>
.btn-ghost {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6B8F72;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: background .12s, color .12s;
}
.btn-ghost:hover { background: #F0F4F1; color: var(--green-brand); }

.btn-outline {
  border: 1.5px solid #D1E0D5;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #3D5A45;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color .15s, background .15s, color .15s;
  font-family: inherit;
  white-space: nowrap;
}
.btn-outline:hover { border-color: var(--green-brand); background: #F0F9F4; color: var(--green-brand); }
</style>

<style>
.dark .btn-ghost { color: var(--text-muted); }
.dark .btn-ghost:hover { background: rgba(255,255,255,.04); color: var(--green-light); }

.dark .btn-outline { background: var(--bg-surface); border-color: var(--border); color: var(--text-secondary); }
.dark .btn-outline:hover { border-color: var(--green-light); background: var(--bg-primary-soft); color: var(--green-light); }
</style>
