<template>
  <AppTopbar title="Dashboard" :subtitle="greeting">
    <template #actions>
      <button type="button" class="h-10 px-4 rounded-lg bg-transparent text-primary border-[1.5px] border-primary text-[13px] font-semibold cursor-pointer">Schedule Session</button>
      <button type="button" class="h-10 px-[18px] rounded-lg bg-primary hover:bg-(--green-hover) text-white text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Add Client
      </button>
    </template>
  </AppTopbar>

  <div class="py-7 px-8 flex-1">
    <WelcomeBanner
      title="You have 4 unreviewed check-ins today"
      subtitle="3 sessions on the books. Revenue is up 12% vs last month — great work!"
      :stats="bannerStats"
    />

    <!-- Stat cards -->
    <div class="grid grid-cols-4 gap-4 mb-7 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
      <StatCard label="Active Clients" value="18" change="↑ 2 this month">
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="8" cy="6" r="3" stroke="#1A7A4A" stroke-width="1.5"/>
            <path d="M2 17c0-3.3 2.7-6 6-6" stroke="#1A7A4A" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="14" cy="8" r="2.5" stroke="#1A7A4A" stroke-width="1.5"/>
            <path d="M11 17c0-2.8 1.3-5 3-5s3 2.2 3 5" stroke="#1A7A4A" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </template>
      </StatCard>

      <StatCard variant="orange" label="Sessions Today" value="3" change="Next at 10:00 AM" change-variant="positive">
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="13" rx="2" stroke="#E67E22" stroke-width="1.5"/>
            <path d="M7 2v3M13 2v3M3 8h14" stroke="#E67E22" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M7 12h2M11 12h2" stroke="#E67E22" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </template>
      </StatCard>

      <StatCard variant="red" label="Pending Check-ins" value="4" change="Needs your response" change-variant="negative">
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h10M3 15h7" stroke="#E74C3C" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="16" cy="15" r="3" fill="#E74C3C"/>
            <path d="M16 13.5v1.5l1 1" stroke="white" stroke-width="1" stroke-linecap="round"/>
          </svg>
        </template>
      </StatCard>

      <StatCard variant="blue" label="Monthly Revenue" value="$4,820" change="↑ 12% vs last month" change-variant="info">
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#3498DB" stroke-width="1.5"/>
            <path d="M10 6v1.5M10 12.5V14M7.5 10c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5" stroke="#3498DB" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Sessions + Check-ins -->
    <div class="grid grid-cols-2 gap-5 mb-7 max-[1000px]:grid-cols-1">
      <TodaysSessions :sessions="todaySessions" />
      <PendingCheckIns :check-ins="pendingCheckIns" />
    </div>

    <!-- Client overview + right rail -->
    <div class="grid grid-cols-[2fr_1fr] gap-5 mb-7 max-[1100px]:grid-cols-1">
      <ClientOverview :clients="clients" :total-clients="18" />
      <div class="flex flex-col gap-5">
        <RecentPayments :payments="payments" />
        <RevenueTrend
          :months="months"
          footer-label="Monthly recurring"
          footer-value="4,820"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppTopbar from '~/components/AppTopbar.vue'
import WelcomeBanner from '~/features/dashboard/components/WelcomeBanner.vue'
import StatCard from '~/features/dashboard/components/StatCard.vue'
import TodaysSessions from '~/features/dashboard/components/TodaysSessions.vue'
import PendingCheckIns from '~/features/dashboard/components/PendingCheckIns.vue'
import ClientOverview from '~/features/dashboard/components/ClientOverview.vue'
import RecentPayments from '~/features/dashboard/components/RecentPayments.vue'
import RevenueTrend from '~/features/dashboard/components/RevenueTrend.vue'

definePageMeta({ layout: 'app' })

const now = new Date()
const greeting = `${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} — Good morning, Jordan 👋`

const bannerStats = [
  { value: '18',     label: 'Active Clients' },
  { value: '$4,820', label: 'This Month' },
  { value: '92%',    label: 'Check-in Rate' },
]

const todaySessions = [
  { time: '10:00 AM', initials: 'SR', variant: 'a' as const, name: 'Sofia Reyes',     meta: 'Strength & Conditioning · 60 min · Zoom',   status: 'virtual' as const,   statusLabel: 'Virtual' },
  { time: '12:30 PM', initials: 'MT', variant: 'b' as const, name: 'Marcus Thompson', meta: 'HIIT Training · 45 min · In-person',        status: 'confirmed' as const, statusLabel: 'Confirmed' },
  { time: '4:00 PM',  initials: 'PK', variant: 'c' as const, name: 'Priya Kumar',     meta: 'Nutrition Check-in Call · 30 min · Zoom',   status: 'pending' as const,   statusLabel: 'Unconfirmed' },
]

const pendingCheckIns = [
  { name: 'Sofia Reyes',     preview: 'Energy: 8/10 · Weight: 143 lbs · "Feeling great this week, nailed all 4 workouts!"', time: '2 hours ago',      unread: true },
  { name: 'Dante Williams',  preview: 'Energy: 5/10 · Weight: 187 lbs · "Tough week — missed 2 sessions, stress at work"',  time: '5 hours ago',      unread: true },
  { name: 'Elena Kowalski',  preview: 'Energy: 9/10 · Weight: 161 lbs · "PB on deadlift this week! Up 5kg from last week"', time: 'Yesterday, 9:14 PM', unread: true },
  { name: 'Marcus Thompson', preview: 'Energy: 7/10 · Weight: 212 lbs · "Good week overall, cardio still feels hard"',      time: 'Yesterday, 6:52 PM', unread: true },
]

const clients = [
  { initials: 'SR', variant: 'a' as const, name: 'Sofia Reyes',      email: 'sofia@email.com',    goal: 'Fat Loss · 12-week',        lastCheckIn: 'Today, 8:02 AM', status: 'active' as const },
  { initials: 'MT', variant: 'b' as const, name: 'Marcus Thompson',  email: 'marcust@email.com',  goal: 'Muscle Gain · 16-week',     lastCheckIn: 'Yesterday',       status: 'active' as const },
  { initials: 'PK', variant: 'c' as const, name: 'Priya Kumar',      email: 'priyak@email.com',   goal: 'Nutrition + Fitness',       lastCheckIn: 'Apr 11',          status: 'new' as const },
  { initials: 'DW', variant: 'd' as const, name: 'Dante Williams',   email: 'dante.w@email.com',  goal: 'General Fitness · 8-week',  lastCheckIn: 'Today, 6:30 AM', status: 'paused' as const },
]

const payments = [
  { initials: 'SR', variant: 'a' as const, name: 'Sofia Reyes',     description: 'Monthly subscription', amount: '199', date: 'Apr 14', status: 'paid' as const },
  { initials: 'MT', variant: 'b' as const, name: 'Marcus Thompson', description: 'Monthly subscription', amount: '249', date: 'Apr 13', status: 'paid' as const },
  { initials: 'EK', variant: 'e' as const, name: 'Elena Kowalski',  description: 'Nutrition add-on',     amount: '79',  date: 'Apr 12', status: 'pending' as const },
]

const months = [
  { label: 'Nov', value: '2,980', height: 44 },
  { label: 'Dec', value: '3,380', height: 52 },
  { label: 'Jan', value: '3,100', height: 48 },
  { label: 'Feb', value: '3,800', height: 60 },
  { label: 'Mar', value: '4,310', height: 66 },
  { label: 'Apr', value: '4,820', height: 76 },
]
</script>
