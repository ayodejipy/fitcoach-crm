<script setup lang="ts">
import AppTopbar from '~/components/AppTopbar.vue'
import WelcomeBanner from '~/features/dashboard/components/WelcomeBanner.vue'
import StatCard from '~/features/dashboard/components/StatCard.vue'
import TodaysSessions from '~/features/dashboard/components/TodaysSessions.vue'
import PendingCheckIns from '~/features/dashboard/components/PendingCheckIns.vue'
import ClientOverview from '~/features/dashboard/components/ClientOverview.vue'
import RecentPayments from '~/features/dashboard/components/RecentPayments.vue'
import RevenueTrend from '~/features/dashboard/components/RevenueTrend.vue'
import { useDashboardApi } from '~/features/dashboard/composables/useDashboardApi'
import { useScheduleApi } from '~/features/schedule/composables/useScheduleApi'
import { useCheckInsApi } from '~/features/check-ins/composables/useCheckInsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { usePaymentsApi } from '~/features/payments/composables/usePaymentsApi'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import type {
  ModelsClient, ModelsCoachSession, ModelsCoachCheckIn, ModelsCoachPayment,
} from '~/services/types.gen'
import { hashVariant, clientInitials, clientName, type AvatarVariant } from '~/features/dashboard/utils/client'
import { fmtTime, fmtDate, fmtRelative, centsToStr } from '~/features/dashboard/utils/format'

definePageMeta({ layout: 'app' })

useSeoMeta({
  title: 'Dashboard | FitCoach CRM',
})

const authStore = useAuthStore()
const dashboardApi = useDashboardApi()
const scheduleApi = useScheduleApi()
const checkInsApi = useCheckInsApi()
const clientsApi = useClientsApi()
const paymentsApi = usePaymentsApi()

const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
const tomorrow = new Date(todayStart); tomorrow.setDate(tomorrow.getDate() + 1)
const sixMoAgo = new Date(); sixMoAgo.setMonth(sixMoAgo.getMonth() - 6); sixMoAgo.setDate(1); sixMoAgo.setHours(0, 0, 0, 0)

const { data, pending, error } = await useAsyncData('dashboard', async () => {
  const results = await Promise.allSettled([
    dashboardApi.getStats(),
    scheduleApi.list({ from: todayStart.toISOString(), to: tomorrow.toISOString(), per_page: 10 }),
    checkInsApi.list({ status: 'unread', per_page: 5 }),
    clientsApi.list({ per_page: 100 }),
    paymentsApi.list({ per_page: 5 }),
    paymentsApi.list({ from: sixMoAgo.toISOString(), per_page: 100 }),
  ])

  // Log failures for rejected promises safely
  results.forEach((res, idx) => {
    if (res.status === 'rejected') {
      console.warn(`[Dashboard fetch warning] Request #${idx} failed:`, res.reason)
    }
  })

  // Return the mapped values, defaulting failed queries to null
  return results.map(res => (res.status === 'fulfilled' ? res.value : null))
})

const stats      = computed(() => data.value?.[0])
const sessions   = computed((): ModelsCoachSession[]  => data.value?.[1]?.sessions   ?? [])
const checkIns   = computed((): ModelsCoachCheckIn[]  => data.value?.[2]?.check_ins  ?? [])
const allClients = computed((): ModelsClient[]        => data.value?.[3]?.clients    ?? [])
const totalCount = computed(() => data.value?.[3]?.total ?? 0)
const payments   = computed((): ModelsCoachPayment[]  => data.value?.[4]?.payments   ?? [])
const trendPays  = computed((): ModelsCoachPayment[]  => data.value?.[5]?.payments   ?? [])
const coach      = computed(() => authStore.coach)

const clientMap = computed(() => {
  const m = new Map<string, ModelsClient>()
  for (const c of allClients.value) if (c.id) m.set(c.id, c)
  return m
})

// ── Mapped data for components ────────────────────────────

const todaySessions = computed(() =>
  sessions.value.map(s => {
    const c = s.client_id ? clientMap.value.get(s.client_id) : undefined
    return {
      time: fmtTime(s.starts_at),
      initials: c ? clientInitials(c) : '?',
      variant: hashVariant(s.client_id ?? s.id ?? '') as AvatarVariant,
      name: clientName(c),
      meta: [s.title, s.duration_mins ? `${s.duration_mins} min` : null, s.zoom_link ? 'Zoom' : 'In-person'].filter(Boolean).join(' · '),
      status: (s.zoom_link ? 'virtual' : s.confirmed ? 'confirmed' : 'pending') as 'virtual' | 'confirmed' | 'pending',
      statusLabel: s.zoom_link ? 'Virtual' : s.confirmed ? 'Confirmed' : 'Unconfirmed',
    }
  })
)

const pendingCheckIns = computed(() =>
  checkIns.value.map(ci => {
    const c = ci.client_id ? clientMap.value.get(ci.client_id) : undefined
    const preview = [
      ci.energy_score != null ? `Energy: ${ci.energy_score}/10` : null,
      ci.weight_lbs != null ? `Weight: ${ci.weight_lbs} lbs` : null,
      ci.notes ? `"${ci.notes}"` : null,
    ].filter(Boolean).join(' · ') || 'No details submitted'
    return {
      name: clientName(c),
      preview,
      time: fmtRelative(ci.submitted_at),
      unread: !ci.is_read,
    }
  })
)

const clientRows = computed(() =>
  allClients.value.slice(0, 5).map(c => ({
    initials: clientInitials(c),
    variant: hashVariant(c.id ?? '') as AvatarVariant,
    name: clientName(c),
    email: c.email ?? '',
    goal: [c.goal, c.goal_sub].filter(Boolean).join(' · ') || '—',
    lastCheckIn: fmtDate(c.last_check_in),
    status: (c.status as 'active' | 'paused' | 'new' | 'ended') ?? 'active',
  }))
)

const recentPayments = computed(() =>
  payments.value.map(p => {
    const c = p.client_id ? clientMap.value.get(p.client_id) : undefined
    return {
      initials: c ? clientInitials(c) : '?',
      variant: hashVariant(p.client_id ?? p.id ?? '') as AvatarVariant,
      name: clientName(c),
      description: p.description ?? p.payment_type ?? 'Payment',
      amount: centsToStr(p.amount_cents),
      date: fmtDate(p.paid_at ?? p.due_date),
      status: (p.status as 'paid' | 'pending' | 'failed') ?? 'pending',
    }
  })
)

const revenueTrend = computed(() => {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      cents: 0,
    }
  })
  for (const p of trendPays.value) {
    if (p.status !== 'paid' || !p.paid_at) continue
    const d = new Date(p.paid_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const m = months.find(m => m.key === key)
    if (m) m.cents += p.amount_cents ?? 0
  }
  const maxCents = Math.max(...months.map(m => m.cents), 1)
  return months.map(m => ({
    label: m.label,
    value: centsToStr(m.cents),
    height: Math.max(4, Math.round((m.cents / maxCents) * 76)),
  }))
})

const currentMonthRevenue = computed(() => revenueTrend.value[5]?.value ?? '0')

const now = new Date()
const hour = now.getHours()
const tod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

const greeting = computed(() => {
  const name = coach.value?.first_name ?? 'Coach'
  return `${dateStr} — Good ${tod}, ${name} 👋`
})

const bannerTitle = computed(() => {
  const unread = stats.value?.unread_checkins ?? 0
  const sess = stats.value?.sessions_today ?? 0
  if (unread > 0 && sess > 0)
    return `${unread} unreviewed check-in${unread !== 1 ? 's' : ''} · ${sess} session${sess !== 1 ? 's' : ''} today`
  if (unread > 0) return `${unread} unreviewed check-in${unread !== 1 ? 's' : ''} today`
  if (sess > 0) return `${sess} session${sess !== 1 ? 's' : ''} scheduled today`
  return "You're all caught up 🎉"
})

const bannerStats = computed(() => [
  { value: String(stats.value?.active_clients ?? '—'), label: 'Active Clients' },
  { value: `$${currentMonthRevenue.value}`, label: 'This Month' },
  { value: String(stats.value?.checkins_this_week ?? '—'), label: 'Check-ins This Week' },
])
</script>

<template>
  <AppTopbar title="Dashboard" :subtitle="greeting">
    <template #actions>
      <UButton color="primary" variant="outline" size="lg">Schedule Session</UButton>
      <UButton color="primary" size="lg" icon="i-lucide-plus">Add Client</UButton>
    </template>
  </AppTopbar>

  <div class="py-7 px-8 flex-1">
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Failed to load dashboard"
      :description="error.message"
      class="mb-6"
    />

    <!-- Welcome banner -->
    <template v-if="pending">
      <USkeleton class="h-[104px] rounded-xl mb-6" />
    </template>
    <WelcomeBanner
      v-else
      :title="bannerTitle"
      subtitle="Keep up the great work — your clients are counting on you."
      :stats="bannerStats"
    />

    <!-- Stat cards -->
    <div class="grid grid-cols-4 gap-4 mb-7 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
      <template v-if="pending">
        <USkeleton v-for="n in 4" :key="n" class="h-[110px] rounded-xl" />
      </template>
      <template v-else>
        <StatCard label="Active Clients" :value="String(stats?.active_clients ?? '—')" :change="`${stats?.active_clients ?? 0} enrolled`">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8" cy="6" r="3" stroke="#1A7A4A" stroke-width="1.5"/>
              <path d="M2 17c0-3.3 2.7-6 6-6" stroke="#1A7A4A" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="14" cy="8" r="2.5" stroke="#1A7A4A" stroke-width="1.5"/>
              <path d="M11 17c0-2.8 1.3-5 3-5s3 2.2 3 5" stroke="#1A7A4A" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
        </StatCard>

        <StatCard variant="orange" label="Sessions Today" :value="String(stats?.sessions_today ?? '—')" :change="stats?.sessions_today ? `${stats.sessions_today} on the books` : 'None scheduled'" change-variant="positive">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="13" rx="2" stroke="#E67E22" stroke-width="1.5"/>
              <path d="M7 2v3M13 2v3M3 8h14" stroke="#E67E22" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M7 12h2M11 12h2" stroke="#E67E22" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
        </StatCard>

        <StatCard variant="red" label="Unread Check-ins" :value="String(stats?.unread_checkins ?? '—')" :change="stats?.unread_checkins ? 'Needs your response' : 'All caught up'" :change-variant="stats?.unread_checkins ? 'negative' : 'positive'">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h10M3 15h7" stroke="#E74C3C" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="16" cy="15" r="3" fill="#E74C3C"/>
              <path d="M16 13.5v1.5l1 1" stroke="white" stroke-width="1" stroke-linecap="round"/>
            </svg>
          </template>
        </StatCard>

        <StatCard variant="blue" label="Check-ins This Week" :value="String(stats?.checkins_this_week ?? '—')" change="Weekly submissions" change-variant="info">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#3498DB" stroke-width="1.5"/>
              <path d="M10 6v1.5M10 12.5V14M7.5 10c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5" stroke="#3498DB" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
        </StatCard>
      </template>
    </div>

    <!-- Sessions + Check-ins -->
    <div class="grid grid-cols-2 gap-5 mb-7 max-[1000px]:grid-cols-1">
      <template v-if="pending">
        <USkeleton class="h-[240px] rounded-xl" />
        <USkeleton class="h-[240px] rounded-xl" />
      </template>
      <template v-else>
        <TodaysSessions :sessions="todaySessions" />
        <PendingCheckIns :check-ins="pendingCheckIns" />
      </template>
    </div>

    <!-- Client overview + right rail -->
    <div class="grid grid-cols-[2fr_1fr] gap-5 mb-7 max-[1100px]:grid-cols-1">
      <template v-if="pending">
        <USkeleton class="h-[280px] rounded-xl" />
        <div class="flex flex-col gap-5">
          <USkeleton class="h-[130px] rounded-xl" />
          <USkeleton class="h-[130px] rounded-xl" />
        </div>
      </template>
      <template v-else>
        <ClientOverview :clients="clientRows" :total-clients="totalCount" />
        <div class="flex flex-col gap-5">
          <RecentPayments :payments="recentPayments" />
          <RevenueTrend
            :months="revenueTrend"
            footer-label="Monthly recurring"
            :footer-value="currentMonthRevenue"
          />
        </div>
      </template>
    </div>
  </div>
</template>

