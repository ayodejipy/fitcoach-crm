<script setup lang="ts">
import { computed, ref } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import ClientProfileHeader from '~/features/clients/components/ClientProfileHeader.vue'
import ClientProfileTabs from '~/features/clients/components/ClientProfileTabs.vue'
import ProgressMetricsCard from '~/features/clients/components/ProgressMetricsCard.vue'
import CurrentProgramCard from '~/features/clients/components/CurrentProgramCard.vue'
import ClientQuickInfo from '~/features/clients/components/ClientQuickInfo.vue'
import ClientCoachNotes from '~/features/clients/components/ClientCoachNotes.vue'
import ClientRecentCheckIn from '~/features/clients/components/ClientRecentCheckIn.vue'
import CheckInStreakBanner from '~/features/clients/components/CheckInStreakBanner.vue'
import ClientCheckInCard from '~/features/clients/components/ClientCheckInCard.vue'
import ClientTabPlaceholder from '~/features/clients/components/ClientTabPlaceholder.vue'
import ClientFormModal from '~/features/clients/components/ClientFormModal.vue'
import type { ProfileTab } from '~/features/clients/components/ClientProfileTabs.vue'
import type { ProfileCheckIn } from '~/features/clients/components/ClientCheckInCard.vue'
import type { MetricTile } from '~/features/clients/components/ProgressMetricsCard.vue'
import type { ModelsClient, ModelsCoachCheckIn } from '~/services'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { useCheckInsApi } from '~/features/check-ins/composables/useCheckInsApi'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import {
  toClientProfile,
  toProfileCheckIn,
  toRecentCheckIn,
  toQuickInfoRows,
  toMetricTiles,
} from '~/features/clients/utils/transform'

definePageMeta({ layout: 'app' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const clientsApi = useClientsApi()
const checkInsApi = useCheckInsApi()

const id = route.params.id as string

// ── Data loading ───────────────────────────────────────────

const { data, pending, refresh } = await useAsyncData(`client-${id}`, () =>
  Promise.all([
    clientsApi.get(id),
    checkInsApi.list({ client_id: id, per_page: 30 }),
  ]),
)

const rawClient   = computed(() => data.value?.[0] as ModelsClient | undefined)
const rawCheckIns = computed(() => (data.value?.[1]?.check_ins ?? []) as ModelsCoachCheckIn[])

// ── Page title ─────────────────────────────────────────────

useSeoMeta({
  title: computed(() => rawClient.value ? `${clientName(rawClient.value)} | FitCoach CRM` : 'Client | FitCoach CRM'),
})

// ── Tabs ───────────────────────────────────────────────────

const activeTab = ref('overview')

const ICONS = {
  overview:  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>',
  checkins:  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h8M2 11h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  sessions:  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 1v2M10 1v2M1 6h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  payments:  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 6.5h12" stroke="currentColor" stroke-width="1.3"/><rect x="3" y="8.5" width="3" height="1.5" rx="0.5" fill="currentColor"/></svg>',
  documents: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1h6l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 1v3h3" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  notes:     '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v8l-3 3H2V2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M4 5h6M4 7.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
}

const tabs = computed<ProfileTab[]>(() => [
  { id: 'overview',  label: 'Overview',  iconSvg: ICONS.overview },
  { id: 'checkins',  label: 'Check-ins', iconSvg: ICONS.checkins,  count: rawCheckIns.value.length || undefined },
  { id: 'sessions',  label: 'Sessions',  iconSvg: ICONS.sessions,  count: rawClient.value?.sessions_count || undefined },
  { id: 'payments',  label: 'Payments',  iconSvg: ICONS.payments },
  { id: 'documents', label: 'Documents', iconSvg: ICONS.documents },
  { id: 'notes',     label: 'Notes',     iconSvg: ICONS.notes },
])

// ── Profile header ─────────────────────────────────────────

const clientProfile = computed(() =>
  rawClient.value ? toClientProfile(rawClient.value) : null,
)

// ── Overview tab ───────────────────────────────────────────

const sortedByDate = computed(() =>
  [...rawCheckIns.value].sort((a, b) =>
    (a.week_start_date ?? '').localeCompare(b.week_start_date ?? ''),
  ),
)

const weightHistory = computed(() =>
  sortedByDate.value
    .filter(ci => ci.weight_lbs != null)
    .slice(-6)
    .map(ci => ci.weight_lbs!),
)

const xLabels = computed(() =>
  weightHistory.value.map((_, i) => `Wk ${i + 1}`),
)

const yLabels = computed<number[]>(() => {
  if (!weightHistory.value.length) return []
  const min = Math.min(...weightHistory.value)
  const max = Math.max(...weightHistory.value)
  const step = (max - min) / 3 || 1
  return [max, max - step, max - 2 * step, min].map(v => Math.round(v))
})

const metricTiles = computed<MetricTile[]>(() =>
  toMetricTiles(rawCheckIns.value, rawClient.value?.streak_weeks),
)

const quickInfoRows = computed(() =>
  rawClient.value ? toQuickInfoRows(rawClient.value) : [],
)

const latestCheckIn = computed(() => sortedByDate.value.at(-1))

const recentCheckIn = computed(() =>
  latestCheckIn.value
    ? toRecentCheckIn(latestCheckIn.value, sortedByDate.value.length)
    : null,
)

// ── Check-ins tab ──────────────────────────────────────────

const newestFirst = computed(() =>
  [...rawCheckIns.value].sort((a, b) =>
    (b.week_start_date ?? '').localeCompare(a.week_start_date ?? ''),
  ),
)

const coachInitials = computed(() => {
  const c = authStore.coach
  return `${c?.first_name?.[0] ?? ''}${c?.last_name?.[0] ?? ''}`.toUpperCase() || '?'
})

const profileCheckIns = computed<ProfileCheckIn[]>(() => {
  const total = newestFirst.value.length
  return newestFirst.value.map((ci, idx) =>
    toProfileCheckIn(ci, total - idx, coachInitials.value),
  )
})

// ── Handlers ───────────────────────────────────────────────

const onRespond = (checkInId: string) => {
  router.push({ path: '/check-ins', query: { id: checkInId } })
}

const onView = (checkInId: string) => {
  router.push({ path: '/check-ins', query: { id: checkInId } })
}

const showEditModal = ref(false)

const onClientUpdated = () => {
  showEditModal.value = false
  refresh()
}
</script>

<template>
  <AppTopbar>
    <template #title>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/clients"
          class="text-[13px] text-[#6B8F72] dark:text-(--text-muted) hover:text-primary dark:hover:text-(--green-light) no-underline"
        >
          Clients
        </NuxtLink>
        <span class="text-[#C8D9CE] dark:text-(--text-muted) text-[13px]">/</span>
        <span class="text-[13px] font-semibold text-(--text-primary)">
          {{ rawClient ? clientName(rawClient) : '…' }}
        </span>
      </div>
    </template>
    <template #actions>
      <button type="button" class="btn-ghost" title="Previous client" disabled>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="btn-ghost" title="Next client" disabled>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="btn-ghost" title="Send message" @click="useToast().add({ title: 'Messaging coming soon', color: 'neutral' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-4 3V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="btn-outline" @click="showEditModal = true">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 1.5L11.5 4 5 10.5H2.5V8L9 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        Edit Profile
      </button>
      <button type="button" class="h-10 px-4 rounded-lg bg-primary hover:bg-(--green-hover) text-white text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors" @click="useToast().add({ title: 'Session booking coming soon', color: 'neutral' })">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="white" stroke-width="1.3"/>
          <path d="M4 1v2M9 1v2M1 5.5h11" stroke="white" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Book Session
      </button>
    </template>
  </AppTopbar>

  <!-- Loading skeleton -->
  <div v-if="pending" class="py-7 px-8 flex-1 flex flex-col gap-5">
    <USkeleton class="h-[140px] rounded-[14px]" />
    <div class="flex gap-2">
      <USkeleton v-for="n in 6" :key="n" class="h-9 w-24 rounded-lg" />
    </div>
    <div class="grid grid-cols-[1fr_340px] gap-5">
      <div class="flex flex-col gap-4">
        <USkeleton class="h-[220px] rounded-[14px]" />
        <USkeleton class="h-[180px] rounded-[14px]" />
      </div>
      <div class="flex flex-col gap-4">
        <USkeleton class="h-[200px] rounded-[14px]" />
        <USkeleton class="h-[140px] rounded-[14px]" />
      </div>
    </div>
  </div>

  <div v-else-if="clientProfile" class="py-7 px-8 flex-1">
    <ClientProfileHeader :client="clientProfile" />
    <ClientProfileTabs v-model="activeTab" :tabs="tabs" />

    <!-- Overview -->
    <div v-if="activeTab === 'overview'" class="grid grid-cols-[1fr_340px] gap-5 max-[1100px]:grid-cols-1">
      <div>
        <ProgressMetricsCard
          v-if="weightHistory.length"
          :history="weightHistory"
          unit="lbs"
          :y-labels="yLabels"
          :x-labels="xLabels"
          :tiles="metricTiles"
        />
        <div v-else class="bg-(--bg-surface) border border-(--border) rounded-[14px] p-6 mb-4 text-center text-(--text-muted) text-sm">
          No weight data recorded yet.
        </div>

        <CurrentProgramCard
          :program-title="rawClient?.plan_name ?? 'Training Program'"
          :program-sub="rawClient?.program_week && rawClient?.program_total
            ? `Week ${rawClient.program_week} of ${rawClient.program_total} · Current week workouts`
            : 'No program details yet'"
          :workout-days="[]"
        />
      </div>

      <div>
        <ClientQuickInfo :rows="quickInfoRows" />
        <ClientCoachNotes text="" />
        <ClientRecentCheckIn
          v-if="recentCheckIn"
          :check-in="recentCheckIn"
          @view-all="activeTab = 'checkins'"
        />
      </div>
    </div>

    <!-- Check-ins -->
    <div v-else-if="activeTab === 'checkins'">
      <CheckInStreakBanner
        :name="rawClient ? clientName(rawClient).split(' ')[0] || clientName(rawClient) : ''"
        :weeks="rawClient?.streak_weeks ?? 0"
      />
      <div v-if="profileCheckIns.length" class="flex flex-col gap-3.5">
        <ClientCheckInCard
          v-for="ci in profileCheckIns"
          :key="ci.id"
          :check-in="ci"
          @respond="onRespond"
          @view="onView"
        />
      </div>
      <div v-else class="text-center py-12 text-(--text-muted) text-sm">
        No check-ins yet for this client.
      </div>
    </div>

    <!-- Placeholder tabs -->
    <ClientTabPlaceholder
      v-else-if="activeTab === 'sessions'"
      :title="`${rawClient?.sessions_count ?? 0} Sessions Logged`"
      description="Sessions tab coming soon"
    >
      <template #icon>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="5" y="8" width="30" height="28" rx="4" stroke="currentColor" stroke-width="2"/>
          <path d="M13 4v6M27 4v6M5 18h30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </template>
    </ClientTabPlaceholder>
    <ClientTabPlaceholder v-else-if="activeTab === 'payments'"  title="Payments" description="Payment history coming soon" />
    <ClientTabPlaceholder v-else-if="activeTab === 'documents'" title="Documents" description="Documents tab coming soon" />
    <ClientTabPlaceholder v-else-if="activeTab === 'notes'"     title="Notes" description="Coach notes coming soon" />
  </div>

  <!-- 404 state -->
  <div v-else class="flex-1 flex items-center justify-center text-(--text-muted)">
    Client not found.
  </div>

  <ClientFormModal
    :open="showEditModal"
    :client="rawClient"
    @update:open="showEditModal = $event"
    @saved="onClientUpdated"
  />
</template>

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
.btn-ghost:hover:not(:disabled) { background: #F0F4F1; color: var(--green-brand); }
.btn-ghost:disabled { opacity: .4; cursor: not-allowed; }

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
.dark .btn-ghost:hover:not(:disabled) { background: var(--bg-primary-soft); color: var(--green-light); }
.dark .btn-outline { border-color: var(--border); color: var(--text-secondary); }
.dark .btn-outline:hover { background: var(--bg-primary-soft); }
</style>
