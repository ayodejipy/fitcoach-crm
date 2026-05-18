<template>
  <AppTopbar title="Clients" :subtitle="subtitle">
    <template #actions>
      <SearchInput v-model="search" placeholder="Search clients…" />
      <button type="button" class="btn-outline">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Filter
      </button>
      <button type="button" class="btn-outline">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 4l3-3 3 3M5 1v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 10l3 3 3-3M12 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Sort
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" class="ml-0.5 opacity-50">
          <path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button type="button" class="h-10 px-4 rounded-lg bg-primary hover:bg-(--green-hover) text-white text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1v11M1 6.5h11" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Add Client
      </button>
    </template>
  </AppTopbar>

  <div class="py-7 px-8 flex-1">
    <ClientFilterChips v-model="activeChip" :chips="chips" />
    <ClientsTable
      :clients="clients"
      :page="page"
      :total-pages="3"
      :from="1"
      :to="clients.length"
      :total="21"
      :sort="sort"
      @update:page="page = $event"
      @update:sort="sort = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import SearchInput from '~/components/SearchInput.vue'
import ClientFilterChips, { type FilterChip } from '~/features/clients/components/ClientFilterChips.vue'
import ClientsTable from '~/features/clients/components/ClientsTable.vue'
import type { Client } from '~/features/clients/components/ClientRow.vue'

definePageMeta({ layout: 'app' })

const subtitle = '18 active · 2 paused · 1 trial'
const search = ref('')
const activeChip = ref('all')
const page = ref(1)
const sort = ref<{ column: 'name' | 'startDate' | 'lastCheckIn'; direction: 'asc' | 'desc' }>({ column: 'lastCheckIn', direction: 'desc' })

const chips: FilterChip[] = [
  { id: 'all',      label: 'All',              count: 21 },
  { id: 'active',   label: 'Active',           count: 18 },
  { id: 'paused',   label: 'Paused',           count: 2 },
  { id: 'trial',    label: 'New Trial',        count: 1 },
  { id: 'overdue',  label: 'Overdue Payment',  count: 1, variant: 'danger' },
]

const defaultActions = [
  { label: 'View Profile' },
  { label: 'Send Message' },
  { divider: true },
  { label: 'Pause Client' },
  { label: 'Remove', danger: true },
]

const trialActions = [
  { label: 'View Profile' },
  { label: 'Send Message' },
  { divider: true },
  { label: 'Convert to Active' },
  { label: 'Remove', danger: true },
]

const overdueActions = [
  { label: 'View Profile' },
  { label: 'Send Payment Reminder' },
  { divider: true },
  { label: 'Reactivate' },
  { label: 'Remove', danger: true },
]

const pausedActions = [
  { label: 'View Profile' },
  { label: 'Send Message' },
  { divider: true },
  { label: 'Reactivate' },
  { label: 'Remove', danger: true },
]

const endedActions = [
  { label: 'View Profile' },
  { label: 'Re-enrol Client' },
  { divider: true },
  { label: 'Remove', danger: true },
]

const clients: Client[] = [
  {
    id: 'sr', initials: 'SR', variant: 'a', name: 'Sofia Reyes', email: 'sofia.reyes@gmail.com',
    goal: 'Fat Loss', goalSub: '12-week program',
    planName: 'Pro Coaching', planPrice: '$199 / mo',
    startDate: 'Apr 2, 2026', lastCheckIn: '2 hours ago', checkInTone: 'ok',
    sessionsCount: 18,
    sparkline: [{ height: 8 }, { height: 11 }, { height: 9 }, { height: 13 }, { height: 16, hi: true }, { height: 18, hi: true }],
    status: 'active', menuActions: defaultActions,
  },
  {
    id: 'mt', initials: 'MT', variant: 'b', name: 'Marcus Thompson', email: 'm.thompson@outlook.com',
    goal: 'Muscle Gain', goalSub: '16-week program',
    planName: 'Pro Coaching', planPrice: '$249 / mo',
    startDate: 'Mar 17, 2026', lastCheckIn: 'Yesterday', checkInTone: 'ok',
    sessionsCount: 24,
    sparkline: [{ height: 10 }, { height: 14 }, { height: 16, hi: true }, { height: 12 }, { height: 18, hi: true }, { height: 18, hi: true }],
    status: 'active', menuActions: defaultActions,
  },
  {
    id: 'pk', initials: 'PK', variant: 'c', name: 'Priya Kumar', email: 'priya.k@icloud.com',
    goal: 'Nutrition + Fitness', goalSub: 'Ongoing',
    planName: 'Starter', planPrice: '$99 / mo',
    startDate: 'Apr 10, 2026', lastCheckIn: '3 days ago', checkInTone: 'warn',
    sessionsCount: 3,
    sparkline: [{ height: 6 }, { height: 10, hi: true }, { height: 14, hi: true }, { height: 0 }, { height: 0 }, { height: 0 }],
    status: 'new', statusLabel: 'Trial', isNew: true, menuActions: trialActions,
  },
  {
    id: 'dw', initials: 'DW', variant: 'd', name: 'Dante Williams', email: 'dante.w@gmail.com',
    goal: 'General Fitness', goalSub: '8-week program',
    planName: 'Starter', planPrice: '$99 / mo',
    startDate: 'Feb 24, 2026',
    lastCheckIn: 'Overdue — 9 days', checkInTone: 'late', checkInTooltip: 'Last check-in: Apr 5 · No response sent',
    sessionsCount: 11,
    sparkline: [{ height: 14, hi: true }, { height: 16, hi: true }, { height: 10 }, { height: 8 }, { height: 6 }, { height: 4 }],
    status: 'active', menuActions: defaultActions,
  },
  {
    id: 'ek', initials: 'EK', variant: 'e', name: 'Elena Kowalski', email: 'ekowalski@proton.me',
    goal: 'Strength Training', goalSub: 'Ongoing',
    planName: 'Pro Coaching', planPrice: '$199 / mo',
    startDate: 'Jan 6, 2026', lastCheckIn: 'Today, 9:14 AM', checkInTone: 'ok',
    sessionsCount: 32,
    sparkline: [{ height: 12 }, { height: 14, hi: true }, { height: 16, hi: true }, { height: 15, hi: true }, { height: 17, hi: true }, { height: 18, hi: true }],
    status: 'active', menuActions: defaultActions,
  },
  {
    id: 'jl', initials: 'JL', variant: 'f', name: 'James Lowe', email: 'james.lowe@yahoo.com',
    goal: 'Marathon Prep', goalSub: '20-week program',
    planName: 'Pro Coaching', planPrice: '$199 overdue ⚠', planPriceOverdue: true,
    startDate: 'Nov 18, 2025', lastCheckIn: '5 days ago', checkInTone: 'warn',
    sessionsCount: 41,
    sparkline: [{ height: 16, hi: true }, { height: 18, hi: true }, { height: 16, hi: true }, { height: 10 }, { height: 8 }, { height: 6 }],
    status: 'paused', paymentOverdue: true, menuActions: overdueActions,
  },
  {
    id: 'an', initials: 'AN', variant: 'g', name: 'Aisha Nwosu', email: 'aisha.n@gmail.com',
    goal: 'Post-Partum Fitness', goalSub: 'Custom program',
    planName: 'Starter', planPrice: '$99 / mo',
    startDate: 'Sep 3, 2025', lastCheckIn: 'On pause', checkInTone: 'muted',
    sessionsCount: 28,
    sparkline: [{ height: 16, hi: true }, { height: 14, hi: true }, { height: 12 }, { height: 4 }, { height: 2 }, { height: 2 }],
    status: 'paused', menuActions: pausedActions,
  },
  {
    id: 'bh', initials: 'BH', variant: 'h', name: 'Ben Hartley', email: 'ben.hartley@work.co',
    goal: 'Weight Loss', goalSub: '12-week program',
    planName: 'Pro Coaching', planPrice: '$199 / mo',
    startDate: 'Jun 1, 2025', lastCheckIn: 'Program ended', checkInTone: 'muted',
    sessionsCount: 48,
    sparkline: [{ height: 18, hi: true }, { height: 16, hi: true }, { height: 14, hi: true }, { height: 12, hi: true }, { height: 8, hi: true }, { height: 4, hi: true }],
    status: 'ended', menuActions: endedActions,
  },
]
</script>

<style scoped>
.btn-outline {
  border: 1.5px solid #D1E0D5;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #3D5A45;
  background: var(--bg-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color .15s, background .15s;
}
.btn-outline:hover {
  border-color: var(--green-brand);
  background: #F0F9F4;
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .btn-outline { border-color: var(--border); color: var(--text-secondary); }
.dark .btn-outline:hover { background: var(--bg-primary-soft); }
</style>
