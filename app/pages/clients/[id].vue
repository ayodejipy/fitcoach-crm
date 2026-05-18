<template>
  <AppTopbar>
    <template #title>
      <div class="flex items-center gap-2">
        <NuxtLink to="/clients" class="text-[13px] text-[#6B8F72] dark:text-(--text-muted) hover:text-primary dark:hover:text-(--green-light) no-underline">Clients</NuxtLink>
        <span class="text-[#C8D9CE] dark:text-(--text-muted) text-[13px]">/</span>
        <span class="text-[13px] font-semibold text-(--text-primary)">{{ client.name }}</span>
      </div>
    </template>
    <template #actions>
      <button type="button" class="btn-ghost" title="Previous client">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="btn-ghost" title="Next client">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="btn-ghost" title="Send message">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-4 3V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="btn-outline">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 1.5L11.5 4 5 10.5H2.5V8L9 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        Edit Profile
      </button>
      <button type="button" class="h-10 px-4 rounded-lg bg-primary hover:bg-(--green-hover) text-white text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="white" stroke-width="1.3"/>
          <path d="M4 1v2M9 1v2M1 5.5h11" stroke="white" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Book Session
      </button>
    </template>
  </AppTopbar>

  <div class="py-7 px-8 flex-1">
    <ClientProfileHeader :client="client" />
    <ClientProfileTabs v-model="activeTab" :tabs="tabs" />

    <!-- Overview -->
    <div v-if="activeTab === 'overview'" class="grid grid-cols-[1fr_340px] gap-5 max-[1100px]:grid-cols-1">
      <div>
        <ProgressMetricsCard
          :history="weightHistory"
          unit="lbs"
          :y-labels="[152, 149, 146, 143]"
          :x-labels="['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']"
          :tiles="metricTiles"
        />
        <CurrentProgramCard
          program-title="12-Week Fat Loss & Conditioning"
          program-sub="Week 6 of 12 · Current week workouts"
          :workout-days="workoutDays"
        />
      </div>
      <div>
        <ClientQuickInfo :rows="quickInfoRows" />
        <ClientCoachNotes :text="coachNotes" />
        <ClientRecentCheckIn :check-in="recentCheckIn" @view-all="activeTab = 'checkins'" />
      </div>
    </div>

    <!-- Check-ins -->
    <div v-else-if="activeTab === 'checkins'">
      <CheckInStreakBanner :name="client.name.split(' ')[0] || client.name" :weeks="client.streakWeeks ?? 0" />
      <div class="flex flex-col gap-3.5">
        <ClientCheckInCard
          v-for="c in profileCheckIns"
          :key="c.id"
          :check-in="c"
          @respond="onRespond"
          @view="onView"
        />
        <div class="text-center py-2 pb-1">
          <button type="button" class="bg-transparent border-[1.5px] border-[#D1E0D5] dark:border-(--border) rounded-lg py-2.5 px-[22px] text-[13px] font-semibold text-[#3D5A45] dark:text-(--text-secondary) cursor-pointer hover:border-primary hover:text-primary dark:hover:border-(--green-light) dark:hover:text-(--green-light) transition-colors">
            Load earlier check-ins (10 more)
          </button>
        </div>
      </div>
    </div>

    <!-- Sessions / Payments / Documents / Notes placeholders -->
    <ClientTabPlaceholder
      v-else-if="activeTab === 'sessions'"
      title="18 Sessions Logged"
      description="Sessions tab — click Check-ins or Overview to see live content"
    >
      <template #icon>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="5" y="8" width="30" height="28" rx="4" stroke="currentColor" stroke-width="2"/>
          <path d="M13 4v6M27 4v6M5 18h30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </template>
    </ClientTabPlaceholder>
    <ClientTabPlaceholder
      v-else-if="activeTab === 'payments'"
      title="Payments tab"
      description="Active subscription · $199/mo · Paid on time every month"
    />
    <ClientTabPlaceholder
      v-else-if="activeTab === 'documents'"
      title="Documents tab"
      description="3 files shared — workout plan PDF, nutrition guide, progress photos"
    />
    <ClientTabPlaceholder
      v-else-if="activeTab === 'notes'"
      title="Notes tab"
      description="Expanded coach notes view — private, full history of coaching observations"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import ClientProfileHeader, { type ClientProfile } from '~/features/clients/components/ClientProfileHeader.vue'
import ClientProfileTabs, { type ProfileTab } from '~/features/clients/components/ClientProfileTabs.vue'
import ProgressMetricsCard, { type MetricTile } from '~/features/clients/components/ProgressMetricsCard.vue'
import CurrentProgramCard, { type WorkoutDay } from '~/features/clients/components/CurrentProgramCard.vue'
import ClientQuickInfo, { type InfoRow } from '~/features/clients/components/ClientQuickInfo.vue'
import ClientCoachNotes from '~/features/clients/components/ClientCoachNotes.vue'
import ClientRecentCheckIn, { type RecentCheckIn } from '~/features/clients/components/ClientRecentCheckIn.vue'
import CheckInStreakBanner from '~/features/clients/components/CheckInStreakBanner.vue'
import ClientCheckInCard, { type ProfileCheckIn } from '~/features/clients/components/ClientCheckInCard.vue'
import ClientTabPlaceholder from '~/features/clients/components/ClientTabPlaceholder.vue'

definePageMeta({ layout: 'app' })

const activeTab = ref('overview')

const icons = {
  calendar: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 1v2M9 1v2M1 5.5h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  plus:     '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v12M1 6.5h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  clock:    '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 3.5v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  dollar:   '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 4v2.5l1.5 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  sleep:    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1a5 5 0 100 10A5 5 0 006 1z" stroke="currentColor" stroke-width="1.2"/><path d="M6 3v3.5l2 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  weight:   '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9l2-4 3 3 2-5 2 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check:    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ciEnergy: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 100 14A7 7 0 008 1z" stroke="currentColor" stroke-width="1.3"/><path d="M8 4v4.5l3 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  ciSleep:  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 9c0-3.3 2.2-6 5-6s5 2.7 5 6v4H3V9z" stroke="currentColor" stroke-width="1.3"/><path d="M1 13h14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  ciWeight: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="2,12 5,7 8,9 11,4 14,7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  ciAdh:    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

const tabs: ProfileTab[] = [
  { id: 'overview',  label: 'Overview',  iconSvg: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>' },
  { id: 'checkins',  label: 'Check-ins', iconSvg: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h8M2 11h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>', count: 14 },
  { id: 'sessions',  label: 'Sessions',  iconSvg: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 1v2M10 1v2M1 6h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>', count: 18 },
  { id: 'payments',  label: 'Payments',  iconSvg: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 6.5h12" stroke="currentColor" stroke-width="1.3"/><rect x="3" y="8.5" width="3" height="1.5" rx="0.5" fill="currentColor"/></svg>' },
  { id: 'documents', label: 'Documents', iconSvg: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1h6l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 1v3h3" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>', count: 3 },
  { id: 'notes',     label: 'Notes',     iconSvg: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v8l-3 3H2V2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M4 5h6M4 7.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
]

const client: ClientProfile = {
  initials: 'SR',
  name: 'Sofia Reyes',
  goal: 'Fat Loss · 12-week Program',
  streakWeeks: 6,
  lastCheckIn: '2 hours ago',
  programWeek: 6,
  programTotal: 12,
  stats: [
    { iconSvg: icons.calendar, leadingText: 'Started', value: 'Apr 2, 2026' },
    { iconSvg: icons.plus,     value: '18',           trailingText: 'sessions completed' },
    { iconSvg: icons.clock,    value: '12-week',      trailingText: 'program' },
    { iconSvg: icons.dollar,   leadingText: 'Paying —', value: '$199/mo' },
  ],
}

const weightHistory = [151, 150, 148.5, 147, 145.5, 143]

const metricTiles: MetricTile[] = [
  { label: 'Current Weight',  value: '143', unit: 'lbs',  change: '↓ 8 lbs since start',  changeTone: 'down' },
  { label: 'Avg Energy',      value: '8.2', unit: '/10',  change: '↑ vs last 4 wks',      changeTone: 'down' },
  { label: 'Check-in Streak', value: '6 🔥',                change: 'weeks in a row',      changeTone: 'flat', valueClass: 'text-lg!' },
]

const workoutDays: WorkoutDay[] = [
  { label: 'Monday — Upper Body Strength',    type: 'Bench press · Rows · Shoulder press · 4×10', duration: '55 min', done: true  },
  { label: 'Tuesday — HIIT Cardio',           type: 'Intervals · 20s on / 10s off · 8 rounds',    duration: '30 min', done: true  },
  { label: 'Thursday — Lower Body Strength',  type: 'Squats · Deadlifts · Lunges · 4×10',         duration: '60 min', done: false },
  { label: 'Saturday — Full Body Circuit',    type: '5 stations · 45s on / 15s rest · 4 rounds',  duration: '45 min', done: false },
]

const quickInfoRows: InfoRow[] = [
  { label: 'Primary Goal',       value: 'Fat Loss' },
  { label: 'Target Weight',      value: '135 lbs', suffix: '(8 lbs to go)' },
  { label: 'Dietary Preference', value: 'High protein · No dairy' },
  { label: 'Training History',   value: '2 years recreational' },
  { label: 'Health Notes',       value: '⚠ Lower back sensitivity — avoid heavy deadlifts', tone: 'health' },
  { label: 'Emergency Contact',  value: 'Marco Reyes · +1 555 0198', tone: 'link' },
  { label: 'Location',           value: 'Austin, TX (Remote)' },
]

const coachNotes = `Sofia responds really well to positive reinforcement — celebrate every win, even small ones. She tends to self-sabotage during stressful work weeks. Watch for low energy check-ins mid-month (end of quarter at her job).

Key coaching cue: when she plateaus, switch to calorie cycling rather than cutting further. We tried this in week 3 and saw great results.`

const recentCheckIn: RecentCheckIn = {
  week: 14,
  submittedLabel: 'Submitted today at 8:02 AM',
  energy: 8,
  quote: '"Feeling really strong this week! Hit all 4 workouts and actually enjoyed the Saturday circuit. Weight is down again — first time I\'ve seen 143 on the scale. So happy!"',
  pills: [
    { iconSvg: icons.sleep,  label: 'Sleep: 7/10' },
    { iconSvg: icons.weight, label: 'Weight: 143 lbs' },
    { iconSvg: icons.check,  label: 'Adherence: 4/4' },
  ],
}

const profileCheckIns: ProfileCheckIn[] = [
  {
    id: 'wk14',
    week: 14,
    submittedLabel: 'Monday, Apr 14, 2026 · 8:02 AM',
    unread: true,
    metrics: [
      { iconSvg: icons.ciEnergy, label: 'Energy',    value: '8 / 10',      tone: 'green' },
      { iconSvg: icons.ciSleep,  label: 'Sleep',     value: '7 / 10' },
      { iconSvg: icons.ciWeight, label: 'Weight',    value: '143 lbs ↓',   tone: 'green' },
      { iconSvg: icons.ciAdh,    label: 'Adherence', value: '4 / 4',       tone: 'green', badge: { label: 'All workouts ✓', tone: 'full' } },
    ],
    notePreview: '"Feeling really strong this week! Hit all 4 workouts and actually enjoyed the Saturday circuit. Weight is down again — first time I\'ve seen 143 on the scale…"',
  },
  {
    id: 'wk13',
    week: 13,
    submittedLabel: 'Monday, Apr 7, 2026 · 9:17 AM',
    metrics: [
      { iconSvg: icons.ciEnergy, label: 'Energy',    value: '9 / 10' },
      { iconSvg: icons.ciSleep,  label: 'Sleep',     value: '8 / 10' },
      { iconSvg: icons.ciWeight, label: 'Weight',    value: '144.5 lbs ↓', tone: 'green' },
      { iconSvg: icons.ciAdh,    label: 'Adherence', value: '4 / 4',       tone: 'green', badge: { label: 'All workouts ✓', tone: 'full' } },
    ],
    notePreview: '"Best week so far. Energy is through the roof. I actually looked forward to training this week — first time that\'s happened. Also tried the high-protein breakfast you suggested..."',
    reply: {
      initials: 'JR',
      label: 'Jordan responded · Apr 7',
      text: '"This is incredible progress Sofia — two weeks of perfect adherence and consistent weight loss. Keep leaning into that morning energy..."',
    },
  },
  {
    id: 'wk12',
    week: 12,
    submittedLabel: 'Monday, Mar 31, 2026 · 11:44 AM',
    negative: true,
    metrics: [
      { iconSvg: icons.ciEnergy, label: 'Energy',    value: '5 / 10',  tone: 'warn' },
      { iconSvg: icons.ciSleep,  label: 'Sleep',     value: '5 / 10',  tone: 'warn' },
      { iconSvg: icons.ciWeight, label: 'Weight',    value: '145.5 lbs' },
      { iconSvg: icons.ciAdh,    label: 'Adherence', value: '2 / 4',   tone: 'warn', badge: { label: 'Partial', tone: 'part' } },
    ],
    notePreview: '"Tough week honestly. Quarter-end at work absolutely wiped me out. Missed two sessions — just couldn\'t make myself do it after 12-hour days..."',
    reply: {
      initials: 'JR',
      label: 'Jordan responded · Mar 31',
      text: '"Hey Sofia, first — 2 sessions in a brutal work week is still a win. Life happens. Let\'s try calorie cycling this week to reset your energy levels..."',
    },
  },
  {
    id: 'wk11',
    week: 11,
    submittedLabel: 'Monday, Mar 24, 2026 · 7:58 AM',
    metrics: [
      { iconSvg: icons.ciEnergy, label: 'Energy',    value: '7 / 10',    tone: 'green' },
      { iconSvg: icons.ciSleep,  label: 'Sleep',     value: '7 / 10' },
      { iconSvg: icons.ciWeight, label: 'Weight',    value: '147 lbs ↓', tone: 'green' },
      { iconSvg: icons.ciAdh,    label: 'Adherence', value: '4 / 4',     tone: 'green', badge: { label: 'All workouts ✓', tone: 'full' } },
    ],
    notePreview: '"Really good week. Starting to see the shape change, especially in my arms. People at work noticed and that felt great. Nutrition was solid all week..."',
    reply: {
      initials: 'JR',
      label: 'Jordan responded · Mar 24',
      text: '"The body composition changes are real — you\'re building muscle as you lose fat which is exactly what we want. Those compliments are earned!"',
    },
  },
]

const onRespond = (_id: string) => { activeTab.value = 'checkins' }
const onView = (_id: string) => { /* TODO: open check-in detail */ }
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
  height: 40px;
  padding: 0 16px;
  border: 1.5px solid #D1E0D5;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #3D5A45;
  background: var(--bg-surface);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: border-color .15s, background .15s;
}
.btn-outline:hover { border-color: var(--green-brand); background: #F0F9F4; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .btn-ghost { color: var(--text-muted); }
.dark .btn-ghost:hover { background: var(--bg-primary-soft); color: var(--green-light); }
.dark .btn-outline { border-color: var(--border); color: var(--text-secondary); }
.dark .btn-outline:hover { background: var(--bg-primary-soft); }
</style>
