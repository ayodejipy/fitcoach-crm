<template>
  <AppTopbar title="Check-ins" :subtitle="weekLabel">
    <template #actions>
      <button type="button" class="btn-outline">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.3"/>
          <path d="M4 6.5h5M6.5 4v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Customize Form
      </button>
      <button type="button" class="btn-outline">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 6.5h9M6.5 2l4.5 4.5L6.5 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Send Reminder
      </button>
    </template>
  </AppTopbar>

  <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
    <!-- Page head -->
    <div class="px-8 pt-5 bg-[#F0F4F1] dark:bg-transparent shrink-0">
      <div class="flex items-start justify-between mb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="text-[22px] font-extrabold text-(--text-primary) tracking-[-0.4px]">Check-ins</div>
            <span class="bg-[#E74C3C] text-white text-[11px] font-bold py-0.5 px-2 rounded-[10px]">{{ unreadCount }} unread</span>
            <span class="text-[11px] font-semibold text-primary dark:text-(--green-light) bg-(--green-pale) dark:bg-(--bg-primary-soft) py-0.5 px-2 rounded-[10px]">🔥 Week of Apr 14</span>
          </div>
          <div class="text-[13px] text-(--text-muted) mt-0.5 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M6.5 3.5v3.5l2 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            {{ unreadCount }} unread check-ins need your response · {{ totalThisWeek }} clients checked in this week
          </div>
        </div>
      </div>

      <CheckInFilterTabs v-model="activeFilter" :tabs="filterTabs" />
    </div>

    <!-- Split view -->
    <div class="flex-1 flex gap-3.5 px-8 pt-4 pb-6 min-h-0 overflow-hidden">
      <CheckInList
        v-model:selected-id="selectedId"
        :cards="cards"
      />
      <CheckInDetailPanel
        v-if="selectedCheckIn"
        :check-in="selectedCheckIn"
        :metrics="selectedMetrics"
        :previous-responses="previousResponses"
      />
      <div v-else class="flex-1 min-w-0 bg-(--bg-surface) rounded-[14px] border border-(--border) flex items-center justify-center p-10 text-(--text-muted) text-center">
        Select a check-in from the left to view details.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import CheckInFilterTabs from '~/features/check-ins/components/CheckInFilterTabs.vue'
import CheckInList from '~/features/check-ins/components/CheckInList.vue'
import CheckInDetailPanel from '~/features/check-ins/components/CheckInDetailPanel.vue'
import type { CheckInSummary } from '~/features/check-ins/components/CheckInCard.vue'
import type { CheckInMetricsData } from '~/features/check-ins/components/CheckInMetrics.vue'
import type { PreviousResponse } from '~/features/check-ins/components/PreviousResponses.vue'

definePageMeta({ layout: 'app' })

const weekLabel = 'Week of April 14, 2026'
const totalThisWeek = 18

const activeFilter = ref<'needs-response' | 'all' | 'week'>('needs-response')
const selectedId = ref<string | null>('sofia')

const filterTabs = [
  { id: 'needs-response', label: 'Needs Response', count: 4 },
  { id: 'all',            label: 'All Check-ins',  count: 18 },
  { id: 'week',           label: 'This Week',      count: 14 },
] as const

const cards: CheckInSummary[] = [
  {
    id: 'sofia', initials: 'SR', variant: 'a', name: 'Sofia Reyes',
    week: 'Week 14', submittedLabel: 'Submitted 2 hours ago',
    unread: true, streakWeeks: 6,
    preview: '"Feeling really strong this week! Hit all 4 workouts and actually enjoyed the Saturday circuit..."',
    metrics: [
      { label: 'Energy 8/10',  tone: 'good', icon: 'clock' },
      { label: 'Sleep 7/10',   tone: 'default', icon: 'sleep' },
      { label: '4/4 workouts', tone: 'good', icon: 'check' },
      { label: '143 lbs ↓',    tone: 'good', icon: 'trend' },
    ],
    group: 'unread',
  },
  {
    id: 'dante', initials: 'DW', variant: 'd', name: 'Dante Williams',
    week: 'Week 14', submittedLabel: 'Submitted 5 hours ago',
    unread: true,
    preview: '"Tough week honestly. Quarter-end at work absolutely wiped me out. Missed two sessions..."',
    metrics: [
      { label: 'Energy 4/10',  tone: 'warn',  icon: 'clock' },
      { label: 'Sleep 4/10',   tone: 'warn',  icon: 'sleep' },
      { label: '2/4 workouts', tone: 'alert', icon: 'minus' },
      { label: '187 lbs →',    tone: 'default', icon: 'trend' },
    ],
    group: 'unread',
  },
  {
    id: 'elena', initials: 'EK', variant: 'e', name: 'Elena Kowalski',
    week: 'Week 14', submittedLabel: 'Yesterday at 9:14 PM',
    unread: true, streakWeeks: 10,
    preview: '"PB on deadlift this week — hit 95kg! First time ever. I cried a little honestly..."',
    metrics: [
      { label: 'Energy 9/10',  tone: 'good', icon: 'clock' },
      { label: 'Sleep 8/10',   tone: 'good', icon: 'sleep' },
      { label: '4/4 workouts', tone: 'good', icon: 'check' },
      { label: '161 lbs ↓',    tone: 'good', icon: 'trend' },
    ],
    group: 'unread',
  },
  {
    id: 'marcus', initials: 'MT', variant: 'b', name: 'Marcus Thompson',
    week: 'Week 14', submittedLabel: 'Yesterday at 6:52 PM',
    unread: true,
    preview: '"Good week overall. Training felt solid. Cardio still feels really hard though..."',
    metrics: [
      { label: 'Energy 7/10',  tone: 'default', icon: 'clock' },
      { label: 'Sleep 6/10',   tone: 'default', icon: 'sleep' },
      { label: '4/4 workouts', tone: 'good', icon: 'check' },
      { label: '212 lbs ↑',    tone: 'warn', icon: 'trend' },
    ],
    group: 'unread',
  },
  {
    id: 'priya', initials: 'PK', variant: 'c', name: 'Priya Kumar',
    week: 'Week 13', submittedLabel: 'Apr 7 at 11:22 AM',
    responded: true,
    preview: '"Doing well this week. Managed to stick to the nutrition plan 5 out of 7 days..."',
    metrics: [
      { label: 'Energy 7/10',  tone: 'good' },
      { label: 'Sleep 7/10',   tone: 'good' },
      { label: '3/4 workouts', tone: 'good' },
      { label: '128 lbs ↓',    tone: 'good' },
    ],
    group: 'responded',
  },
  {
    id: 'james', initials: 'JL', variant: 'g', name: 'James Lowe',
    week: 'Week 13', submittedLabel: 'Apr 7 at 8:03 AM',
    responded: true,
    preview: '"Leg is still a bit sore from the long run Sunday. Had to skip two sessions to rest it..."',
    metrics: [
      { label: 'Energy 5/10',  tone: 'warn' },
      { label: 'Sleep 6/10',   tone: 'default' },
      { label: '2/4 workouts', tone: 'alert' },
      { label: '188 lbs →',    tone: 'default' },
    ],
    group: 'responded',
  },
]

const unreadCount = computed(() => cards.filter((c) => c.unread).length)
const selectedCheckIn = computed(() => cards.find((c) => c.id === selectedId.value) ?? null)

// Detail / metrics / previous-responses remain hard-coded to Sofia for now
// (same behavior as the raw HTML mockup).
const selectedMetrics: CheckInMetricsData = {
  energy: { value: 8, delta: 'Up 1 point from last week', deltaTone: 'good' },
  sleep:  { value: 7, delta: 'Same as last week',        deltaTone: 'muted' },
  adherence: { done: 4, total: 4, delta: 'Perfect week · 4 of 4 completed', deltaTone: 'good' },
  weight: {
    value: 143, unit: 'lbs',
    trend: 'down',
    delta: 'Down 1.5 lbs from last week', deltaTone: 'good',
    history: [151, 150, 148.5, 147, 145.5, 143],
  },
}

const previousResponses: PreviousResponse[] = [
  {
    id: 'wk-13', week: 'Week 13', date: 'Apr 7, 2026',
    metrics: ['Energy 9/10', 'Sleep 8/10', '4/4 ✓', '144.5 lbs'],
    snippet: '"Best week so far. Energy is through the roof. I actually looked forward to training…"',
    coachInitials: 'JR', coachVariant: 'a',
    coachRespondedAt: 'Apr 7 at 2:14 PM',
    coachText: '"This is incredible progress Sofia — two weeks of perfect adherence and consistent weight loss. The fact that you\'re looking forward to sessions is the biggest win here. Keep leaning into that morning energy, and let\'s add a bit more volume to Thursday\'s session this week. You\'re ready for it. 🔥"',
  },
  {
    id: 'wk-12', week: 'Week 12', date: 'Mar 31, 2026',
    metrics: ['Energy 5/10', 'Sleep 5/10', '2/4', '145.5 lbs'],
    snippet: '"Tough week honestly. Quarter-end at work absolutely wiped me out…"',
    coachInitials: 'JR', coachVariant: 'a',
    coachRespondedAt: 'Mar 31 at 4:48 PM',
    coachText: '"Hey Sofia, first — 2 sessions in a brutal work week is still a win. Life happens and the fact that you showed up at all matters. Let\'s try calorie cycling this week to reset your energy levels — I\'ll send you the plan. Don\'t stress about the week, just focus on getting back on track."',
  },
  {
    id: 'wk-11', week: 'Week 11', date: 'Mar 24, 2026',
    metrics: ['Energy 7/10', 'Sleep 7/10', '4/4 ✓', '147 lbs'],
    snippet: '"Really good week. Starting to see the shape change, especially in my arms…"',
    coachInitials: 'JR', coachVariant: 'a',
    coachRespondedAt: '',
    coachText: '',
  },
]
</script>

<style scoped>
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
  transition: border-color .15s, background .15s, color .15s;
}
.btn-outline:hover {
  border-color: var(--green-brand);
  background: #F0F9F4;
  color: var(--green-brand);
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .btn-outline { border-color: var(--border); color: var(--text-secondary); }
.dark .btn-outline:hover { background: var(--bg-primary-soft); color: var(--green-light); }
</style>
