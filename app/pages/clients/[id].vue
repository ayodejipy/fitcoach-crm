<script setup lang="ts">
import { differenceInDays, format, parse, parseISO } from 'date-fns'
import AppTopbar from '~/components/AppTopbar.vue'
import ClientFormModal from '~/features/clients/components/ClientFormModal.vue'
import ClientDetailHeader from '~/features/clients/components/ClientDetailHeader.vue'
import ClientDetailTabs from '~/features/clients/components/ClientDetailTabs.vue'
import ClientActivityTimeline from '~/features/clients/components/ClientActivityTimeline.vue'
import ClientAtAGlanceCard from '~/features/clients/components/ClientAtAGlanceCard.vue'
import ClientProfileSummaryCard from '~/features/clients/components/ClientProfileSummaryCard.vue'
import ClientNextSessionCard from '~/features/clients/components/ClientNextSessionCard.vue'
import ClientStatsTab from '~/features/clients/components/ClientStatsTab.vue'
import ClientSessionsTab from '~/features/clients/components/ClientSessionsTab.vue'
import ClientCheckInsTab from '~/features/clients/components/ClientCheckInsTab.vue'
import ClientPaymentsTab from '~/features/clients/components/ClientPaymentsTab.vue'
import ClientDocumentsTab from '~/features/clients/components/ClientDocumentsTab.vue'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { useCheckInsApi } from '~/features/check-ins/composables/useCheckInsApi'
import { useScheduleApi } from '~/features/schedule/composables/useScheduleApi'
import { usePaymentsApi } from '~/features/payments/composables/usePaymentsApi'
import type { ModelsClient, ModelsCoachCheckIn, ModelsCoachSession, ModelsCoachPayment } from '~/services'
import { hashVariant, clientInitials, clientName } from '~/utils/client'
import { buildTimeline, groupByBucket } from '~/features/clients/utils/timeline'

definePageMeta({ layout: 'app' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const clientsApi = useClientsApi()
const checkInsApi = useCheckInsApi()
const scheduleApi = useScheduleApi()
const paymentsApi = usePaymentsApi()

const id = route.params.id as string

const { data, pending, error } = await useAsyncData(`client-${id}`, () =>
  Promise.all([
    clientsApi.get(id),
    checkInsApi.list({ client_id: id, per_page: 30 }),
    scheduleApi.list({ client_id: id, per_page: 50 }),
  ]),
)

const { data: paymentsData, pending: paymentsPending } = await useAsyncData(
  `client-payments-${id}`,
  () => paymentsApi.list({ client_id: id, per_page: 50 }),
)

const client   = computed(() => data.value?.[0] as ModelsClient | undefined)
const checkIns = computed(() => (data.value?.[1]?.check_ins ?? []) as ModelsCoachCheckIn[])
const sessions = computed(() => (data.value?.[2]?.sessions ?? []) as ModelsCoachSession[])
const payments = computed(() => (paymentsData.value?.payments ?? []) as ModelsCoachPayment[])
const editModalOpen = ref(false)

const displayName  = computed(() => client.value ? clientName(client.value) : 'Loading…')
const firstName    = computed(() => client.value?.first_name || displayName.value)
const initialsText = computed(() => client.value ? clientInitials(client.value) : '?')
const variant      = computed(() => hashVariant(id))
const status       = computed(() => client.value?.status ?? 'active')

useSeoMeta({
  title: () => client.value ? `${clientName(client.value)} | FitCoach CRM` : 'Client | FitCoach CRM',
})

const statusLabel = computed(() => ({
  active: 'Active', paused: 'Paused', new: 'Trial', ended: 'Ended',
}[status.value] ?? 'Active'))

const statusDot = computed(() => ({
  active: 'bg-(--green-brand)',
  paused: 'bg-(--warning)',
  new: 'bg-(--info)',
  ended: 'bg-(--text-muted)',
}[status.value] ?? 'bg-(--green-brand)'))

const startedLabel = computed(() => {
  if (!client.value?.start_date) return null
  return format(parse(client.value.start_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')
})

const program = computed(() => {
  const total = client.value?.program_total
  if (!total) return null
  const week = client.value?.program_week ?? 1
  return { week, total, pct: Math.min(100, Math.round((week / total) * 100)) }
})

const tabs = computed(() => [
  { id: 'activity',  label: 'Activity' },
  { id: 'stats',     label: 'Stats' },
  { id: 'checkins',  label: 'Check-ins', badge: checkIns.value.filter(ci => !ci.is_read).length || undefined },
  { id: 'sessions',  label: 'Sessions' },
  { id: 'payments',  label: 'Payments' },
  { id: 'documents', label: 'Documents' },
])

const activeTab = computed({
  get: () => (route.query.tab as string) || 'activity',
  set: (val: string) => router.replace({ query: { ...route.query, tab: val } }),
})

const timelineGroups = computed(() => {
  if (!client.value) return []
  return groupByBucket(buildTimeline({
    client: client.value,
    checkIns: checkIns.value,
    sessions: sessions.value,
  }))
})

const upcomingSession = computed(() => {
  const now = new Date()
  return sessions.value
    .filter(s => s.starts_at && parseISO(s.starts_at) > now)
    .sort((a, b) => parseISO(a.starts_at!).getTime() - parseISO(b.starts_at!).getTime())[0]
})

const atAGlance = computed(() => {
  const list = checkIns.value
  const withWeight = list.filter(ci => ci.weight != null)
  const latestWeight = withWeight.at(0)?.weight ?? null
  const firstWeight = withWeight.at(-1)?.weight ?? null
  const delta = latestWeight != null && firstWeight != null ? latestWeight - firstWeight : null

  const energyScores = list.map(ci => ci.energy_score).filter((s): s is number => s != null)
  const avgEnergy = energyScores.length
    ? +(energyScores.reduce((a, b) => a + b, 0) / energyScores.length).toFixed(1)
    : null

  return {
    weight: latestWeight,
    weightDelta: delta,
    avgEnergy,
    streak: client.value?.streak_weeks ?? 0,
    checkInsCount: list.length,
  }
})

const moreActions = computed(() => [
  { label: 'Edit details', icon: 'i-hugeicons-pencil-edit-02', onSelect: () => editModalOpen.value = true },
  { label: 'Resend portal invite', icon: 'i-hugeicons-sent', onSelect: () => resendInvite() },
  ...(status.value === 'active'
    ? [{ label: 'Pause client', icon: 'i-lucide-pause-circle', onSelect: () => updateStatus('paused') }]
    : status.value === 'paused'
      ? [{ label: 'Reactivate', icon: 'i-lucide-play-circle', onSelect: () => updateStatus('active') }]
      : []),
  { type: 'separator' as const },
  { label: 'Delete client', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => confirmDelete() },
])

async function resendInvite() {
  if (!client.value?.id) return
  try {
    await clientsApi.invite(client.value.id)
    toast.add({
      title: 'Portal invite sent',
      description: `${displayName.value} will get a fresh link by email. Expires in 7 days.`,
      color: 'success',
    })
  } catch {
    toast.add({ title: 'Could not send invite', color: 'error' })
  }
}

async function updateStatus(next: 'active' | 'paused' | 'new' | 'ended') {
  if (!client.value?.id) return
  try {
    await clientsApi.update(client.value.id, { status: next })
    toast.add({ title: 'Status updated', color: 'success' })
    refreshNuxtData(`client-${id}`)
  } catch {
    toast.add({ title: 'Failed to update status', color: 'error' })
  }
}

async function confirmDelete() {
  if (!client.value?.id) return
  if (!confirm(`Remove ${displayName.value}? This cannot be undone.`)) return
  try {
    await clientsApi.remove(client.value.id)
    toast.add({ title: 'Client removed', color: 'success' })
    router.push('/clients')
  } catch {
    toast.add({ title: 'Failed to remove client', color: 'error' })
  }
}

function onSaveNote(_text: string) {
  toast.add({
    title: 'Notes coming soon',
    description: 'Backend support for coach notes is on the roadmap.',
    color: 'info',
  })
}

function onRespondCheckIn(checkInId: string) {
  router.push(`/check-ins?focus=${checkInId}`)
}

async function onMarkRead(checkInId: string) {
  try {
    await checkInsApi.markRead(checkInId)
    refreshNuxtData(`client-${id}`)
  } catch {
    toast.add({ title: 'Could not mark as read', color: 'error' })
  }
}

function onEditSaved() {
  editModalOpen.value = false
  refreshNuxtData(`client-${id}`)
}

function onBookSession() {
  router.push(`/schedule?client=${id}`)
}

function onNewInvoice() {
  router.push(`/payments/invoices?client=${id}&new=1`)
}
</script>

<template>
  <AppTopbar>
    <template #title>
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-[12.5px] min-w-0">
        <NuxtLink to="/clients" class="text-(--text-muted) hover:text-(--text-primary) no-underline">Clients</NuxtLink>
        <span aria-hidden="true" class="text-(--text-muted)">/</span>
        <span class="font-semibold text-(--text-primary) truncate">{{ displayName }}</span>
      </nav>
      <span v-if="client" class="ml-2 inline-flex items-center gap-1.5 text-[11px] text-(--text-muted) shrink-0">
        <span aria-hidden="true" class="h-1 w-1 rounded-full" :class="statusDot" />
        {{ statusLabel }}
      </span>
    </template>
    <template #actions>
      <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-mail">Send message</UButton>
      <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-calendar-plus">Book session</UButton>
      <UDropdownMenu :items="moreActions" :content="{ side: 'bottom', align: 'end' }">
        <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-more-horizontal" aria-label="More actions" />
      </UDropdownMenu>
    </template>
  </AppTopbar>

  <UAlert
    v-if="error"
    color="error"
    variant="soft"
    icon="i-lucide-circle-alert"
    title="Failed to load client"
    :description="error.message"
    class="mx-8 mt-6"
  />

  <section v-if="client" class="px-8 pt-5 border-b border-(--border) bg-(--bg-surface) max-md:px-5">
    <ClientDetailHeader
      :initials="initialsText"
      :variant="variant"
      :name="displayName"
      :email="client.email"
      :goal="client.goal"
      :started-label="startedLabel"
      :program="program"
      class="pb-5"
    />
    <ClientDetailTabs v-model="activeTab" :tabs="tabs" />
  </section>

  <main id="main-content" class="flex-1">
    <USkeleton v-if="pending" class="h-[400px] m-8 rounded-[10px]" />

    <div
      v-else-if="activeTab === 'activity' && client"
      class="px-8 py-6 grid grid-cols-[1fr_320px] gap-6 max-lg:grid-cols-1 max-md:px-5"
    >
      <ClientActivityTimeline
        :groups="timelineGroups"
        :client-first-name="firstName"
        :client-display-name="displayName"
        @save-note="onSaveNote"
        @respond-check-in="onRespondCheckIn"
        @mark-read="onMarkRead"
      />

      <aside class="space-y-5">
        <ClientAtAGlanceCard
          :client-first-name="firstName"
          :weight="atAGlance.weight"
          :weight-delta="atAGlance.weightDelta"
          :avg-energy="atAGlance.avgEnergy"
          :streak="atAGlance.streak"
          :check-ins-count="atAGlance.checkInsCount"
          @see-full-stats="activeTab = 'stats'"
        />
        <ClientProfileSummaryCard
          :goal="client.goal"
          :email="client.email"
          :phone="client.phone"
          :started-label="startedLabel"
          :plan-name="client.plan_name"
          :plan-price-cents="client.plan_price_cents"
        />
        <ClientNextSessionCard :session="upcomingSession" />
      </aside>
    </div>

    <div v-else-if="activeTab === 'stats' && client" class="px-8 py-6 max-md:px-5">
      <ClientStatsTab
        :check-ins="checkIns"
        :start-date="client.start_date ?? null"
        :streak="client.streak_weeks ?? 0"
        :program-week="client.program_week"
        :program-total="client.program_total"
      />
    </div>

    <div v-else-if="activeTab === 'sessions' && client" class="px-8 py-6 max-md:px-5">
      <ClientSessionsTab
        :sessions="sessions"
        :client-name="displayName"
        @book-session="onBookSession"
      />
    </div>

    <div v-else-if="activeTab === 'checkins' && client" class="px-8 py-6 max-md:px-5">
      <ClientCheckInsTab
        :check-ins="checkIns"
        :start-date="client.start_date ?? null"
        @open="onRespondCheckIn"
      />
    </div>

    <div v-else-if="activeTab === 'payments' && client" class="px-8 py-6 max-md:px-5">
      <ClientPaymentsTab
        :payments="payments"
        :pending="paymentsPending"
        :client-name="displayName"
        :plan-name="client.plan_name"
        :plan-price-cents="client.plan_price_cents"
        @new-invoice="onNewInvoice"
      />
    </div>

    <div v-else-if="activeTab === 'documents' && client" class="px-8 py-6 max-md:px-5">
      <ClientDocumentsTab :client-name="displayName" />
    </div>
  </main>

  <ClientFormModal
    v-if="client"
    :open="editModalOpen"
    :client="client"
    @update:open="editModalOpen = $event"
    @saved="onEditSaved"
  />
</template>
