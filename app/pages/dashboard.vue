<script setup lang="ts">
import { format, differenceInDays, parseISO } from 'date-fns'
import AppTopbar from '~/components/AppTopbar.vue'
import DashboardKpiHero from '~/features/dashboard/components/DashboardKpiHero.vue'
import DashboardTodayPanel from '~/features/dashboard/components/DashboardTodayPanel.vue'
import DashboardCheckInsPanel from '~/features/dashboard/components/DashboardCheckInsPanel.vue'
import DashboardClientsPreview from '~/features/dashboard/components/DashboardClientsPreview.vue'
import { useDashboardApi } from '~/features/dashboard/composables/useDashboardApi'
import { useScheduleApi } from '~/features/schedule/composables/useScheduleApi'
import { useCheckInsApi } from '~/features/check-ins/composables/useCheckInsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { usePaymentsApi } from '~/features/payments/composables/usePaymentsApi'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import type {
  ModelsClient, ModelsCoachSession, ModelsCoachCheckIn, ModelsCoachPayment,
} from '~/services/types.gen'
import { hashVariant, clientInitials, clientName } from '~/utils/client'
import { fmtTime, fmtDate, centsToStr } from '~/utils/format'

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
    paymentsApi.list({ from: sixMoAgo.toISOString(), per_page: 100 }),
  ])
  results.forEach((res, idx) => {
    if (res.status === 'rejected') console.warn(`[Dashboard fetch] Request #${idx} failed:`, res.reason)
  })
  return results.map(res => (res.status === 'fulfilled' ? res.value : null))
})

const stats        = computed(() => data.value?.[0])
const sessions     = computed((): ModelsCoachSession[]  => data.value?.[1]?.sessions   ?? [])
const checkIns     = computed((): ModelsCoachCheckIn[]  => data.value?.[2]?.check_ins  ?? [])
const allClients   = computed((): ModelsClient[]        => data.value?.[3]?.clients    ?? [])
const totalClients = computed(() => data.value?.[3]?.total ?? 0)
const allPayments  = computed((): ModelsCoachPayment[]  => data.value?.[4]?.payments   ?? [])
const coach        = computed(() => authStore.coach)

const clientMap = computed(() => {
  const m = new Map<string, ModelsClient>()
  for (const c of allClients.value) if (c.id) m.set(c.id, c)
  return m
})

const now = new Date()
const dateEyebrow = format(now, 'EEE · MMM d')
const topbarDateLabel = format(now, 'EEEE, MMM d')
const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'

const greeting = computed(() => `Good ${timeOfDay}, ${coach.value?.first_name ?? 'Coach'}.`)

const unconfirmedSessions = computed(() => sessions.value.filter(s => !s.confirmed && !s.zoom_link).length)
const unreadCheckIns = computed(() => stats.value?.unread_checkins ?? checkIns.value.length)
const attentionCount = computed(() => unconfirmedSessions.value + unreadCheckIns.value)

const outstandingCents = computed(() =>
  allPayments.value
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)
)
const outstandingCount = computed(() => allPayments.value.filter(p => p.status === 'pending').length)

const kpiMetrics = computed(() => {
  const active = stats.value?.active_clients ?? 0
  const totalRoster = totalClients.value || active
  const checkinsThisWeek = stats.value?.checkins_this_week ?? 0
  const needsResponse = unreadCheckIns.value

  return [
    {
      label: 'Active clients',
      value: String(active),
      suffix: totalRoster > active ? `of ${totalRoster} enrolled` : 'enrolled',
      note: active > 0 ? `${active} active` : null,
      noteTrend: 'up' as const,
    },
    {
      label: 'Check-ins this week',
      value: String(checkinsThisWeek),
      suffix: active > 0 ? `/ ${active}` : '',
      note: active > 0 ? `${Math.round((checkinsThisWeek / active) * 100)}% in` : null,
      progressFilled: checkinsThisWeek,
      progressTotal: Math.max(1, active),
    },
    {
      label: 'Needs response',
      value: String(needsResponse),
      suffix: needsResponse === 1 ? 'check-in' : 'check-ins',
      note: needsResponse > 0 ? 'Live' : null,
      noteTrend: 'live' as const,
      href: needsResponse > 0 ? '/check-ins' : undefined,
      href_label: 'Respond now →',
    },
    {
      label: 'Outstanding',
      prefix: '$',
      value: centsToStr(outstandingCents.value),
      note: outstandingCount.value > 0 ? `${outstandingCount.value} pending` : 'All paid',
      noteTrend: outstandingCount.value > 0 ? 'down' as const : 'up' as const,
      href: '/payments',
      href_label: 'View invoices →',
    },
  ]
})

const todaySessions = computed(() =>
  sessions.value.map(s => {
    const c = s.client_id ? clientMap.value.get(s.client_id) : undefined
    const t = fmtTime(s.starts_at)
    const [time = '', period = ''] = t.split(' ')
    return {
      id: s.id ?? '',
      time: time.replace(':00', ''),
      period,
      initials: c ? clientInitials(c) : '?',
      variant: hashVariant(s.client_id ?? s.id ?? ''),
      name: clientName(c),
      meta: [
        s.duration_mins ? `${s.duration_mins} min` : null,
        s.zoom_link ? 'Zoom' : 'In-person',
        s.title,
      ].filter(Boolean).join(' · '),
      status: (s.zoom_link ? 'virtual' : s.confirmed ? 'confirmed' : 'pending') as 'virtual' | 'confirmed' | 'pending',
      statusLabel: s.zoom_link ? 'Virtual' : s.confirmed ? 'Confirmed' : 'Awaiting client',
    }
  })
)

const pendingCheckIns = computed(() =>
  checkIns.value.map(ci => {
    const c = ci.client_id ? clientMap.value.get(ci.client_id) : undefined
    return {
      id: ci.id ?? '',
      initials: c ? clientInitials(c) : '?',
      variant: hashVariant(ci.client_id ?? ci.id ?? ''),
      name: clientName(c),
      weekLabel: ci.week_start_date ? `· Week of ${fmtDate(ci.week_start_date)}` : undefined,
      quote: ci.notes || undefined,
      energy: ci.energy_score ?? null,
      weightLbs: ci.weight_lbs ?? null,
      sleepHours: ci.sleep_hrs ?? null,
      unread: !ci.is_read,
    }
  })
)

const oldestUnreadDays = computed(() => {
  const dates = checkIns.value
    .filter(ci => !ci.is_read && ci.submitted_at)
    .map(ci => differenceInDays(now, parseISO(ci.submitted_at!)))
  return dates.length ? Math.max(...dates) : null
})

const clientRows = computed(() =>
  allClients.value.slice(0, 5).map(c => {
    const overdue = c.last_check_in
      ? differenceInDays(now, parseISO(c.last_check_in)) > 7
      : false
    const lastLabel = c.last_check_in
      ? (overdue
          ? `Overdue · ${differenceInDays(now, parseISO(c.last_check_in))}d`
          : fmtDate(c.last_check_in))
      : 'Never checked in'
    return {
      id: c.id ?? '',
      initials: clientInitials(c),
      variant: hashVariant(c.id ?? ''),
      name: clientName(c),
      email: c.email ?? '',
      goal: [c.goal, c.goal_sub].filter(Boolean).join(' · ') || '—',
      lastCheckIn: lastLabel,
      lastCheckInOverdue: overdue,
      status: (c.status as 'active' | 'paused' | 'new' | 'ended') ?? 'active',
    }
  })
)

function onSchedule() { navigateTo('/schedule') }
function onRespond(id: string) { navigateTo(id ? `/check-ins?focus=${id}` : '/check-ins') }
</script>

<template>
  <AppTopbar title="Dashboard" :subtitle="topbarDateLabel">
    <template #actions>
      <UButton color="neutral" variant="outline" size="sm" to="/schedule">Schedule session</UButton>
      <UButton color="neutral" size="sm" icon="i-lucide-plus" to="/clients">Add client</UButton>
    </template>
  </AppTopbar>

  <main id="main-content" class="flex-1 px-8 py-7 space-y-7 max-md:px-5 max-md:py-5">
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Failed to load dashboard"
      :description="error.message"
    />

    <section aria-label="Briefing">
      <p class="text-[11.5px] font-semibold uppercase tracking-wide text-(--text-secondary) tabular-nums">{{ dateEyebrow }}</p>
      <h2 class="mt-1 text-[26px] font-semibold tracking-tight text-(--text-primary)">{{ greeting }}</h2>
      <p class="mt-1.5 text-[14px] text-(--text-secondary)">
        <template v-if="attentionCount > 0">
          <span class="font-semibold text-(--text-primary)">
            {{ attentionCount }} {{ attentionCount === 1 ? 'thing' : 'things' }}
          </span>
          {{ attentionCount === 1 ? 'needs' : 'need' }} your attention today.
        </template>
        <template v-else>
          You're all caught up. Nice work.
        </template>
      </p>
    </section>

    <USkeleton v-if="pending" class="h-[120px] rounded-[10px]" />
    <DashboardKpiHero v-else :metrics="kpiMetrics" />

    <div class="grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1">
      <template v-if="pending">
        <USkeleton class="h-[240px] rounded-[10px]" />
        <USkeleton class="h-[240px] rounded-[10px]" />
      </template>
      <template v-else>
        <DashboardTodayPanel
          :sessions="todaySessions"
          :completed-count="0"
          @schedule="onSchedule"
        />
        <DashboardCheckInsPanel
          :check-ins="pendingCheckIns"
          :oldest-unread-days="oldestUnreadDays"
          @respond="onRespond"
        />
      </template>
    </div>

    <USkeleton v-if="pending" class="h-[320px] rounded-[10px]" />
    <DashboardClientsPreview
      v-else
      :clients="clientRows"
      :total-clients="totalClients"
    />
  </main>
</template>
