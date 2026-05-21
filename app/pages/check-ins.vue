<script setup lang="ts">
import { shallowRef, computed, watch } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import CheckInFilterTabs from '~/features/check-ins/components/CheckInFilterTabs.vue'
import CheckInList from '~/features/check-ins/components/CheckInList.vue'
import CheckInDetailPanel from '~/features/check-ins/components/CheckInDetailPanel.vue'
import type { CheckInSummary } from '~/features/check-ins/components/CheckInCard.vue'
import type { CheckInMetricsData } from '~/features/check-ins/components/CheckInMetrics.vue'
import type { PreviousResponse } from '~/features/check-ins/components/PreviousResponses.vue'
import type { ModelsClient, ModelsCoachCheckIn } from '~/services'
import { useCheckInsApi } from '~/features/check-ins/composables/useCheckInsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { toCard, toMetrics, toPreviousResponse } from '~/features/check-ins/utils/transform'

definePageMeta({ layout: 'app' })

// ── Instances ──────────────────────────────────────────────
const checkInsApi = useCheckInsApi()
const clientsApi = useClientsApi()
const authStore = useAuthStore()
const toast = useToast()

// ── Filter / selection state ───────────────────────────────

type FilterId = 'needs-response' | 'all' | 'week'

const activeFilter = ref<FilterId>('needs-response')
const selectedId = ref<string | null>(null)
const weekStart = currentWeekStart()

const listParams = computed(() => {
  if (activeFilter.value === 'needs-response') return { status: 'unread', per_page: 50 }
  if (activeFilter.value === 'week') return { week_start: weekStart, per_page: 50 }
  return { per_page: 50 }
})

// ── Initial load: tab counts + clients ────────────────────
const { data: initData } = await useAsyncData('check-ins-init', () =>
  Promise.all([
    clientsApi.list({ per_page: 200 }),
    checkInsApi.list({ status: 'unread', per_page: 1 }),
    checkInsApi.list({ per_page: 1 }),
    checkInsApi.list({ week_start: weekStart, per_page: 1 }),
  ])
)

const clientMap = computed(() => {
  const m = new Map<string, ModelsClient>()
  for (const c of initData.value?.[0]?.clients ?? []) {
    if (c.id) m.set(c.id, c)
  }
  return m
})

const tabCounts = computed(() => ({
  'needs-response': initData.value?.[1]?.total ?? 0,
  'all':            initData.value?.[2]?.total ?? 0,
  'week':           initData.value?.[3]?.total ?? 0,
}))

// ── Reactive list (re-fetches on filter change) ────────────
const { data: listData, pending: listPending } = await useAsyncData(
  'check-ins-list',
  () => checkInsApi.list(listParams.value),
  { watch: [activeFilter] },
)

const checkIns = computed(() => listData.value?.check_ins ?? [])
const cards = computed<CheckInSummary[]>(() =>
  checkIns.value.map(ci => toCard(ci, clientMap.value.get(ci.client_id ?? '')))
)

const unreadCount = computed(() => tabCounts.value['needs-response'])
const totalThisWeek = computed(() => tabCounts.value['week'])
const weekDisplayLabel = `Week of ${fmtWeekOf(weekStart)}`

const filterTabs = computed(() => [
  { id: 'needs-response', label: 'Needs Response', count: tabCounts.value['needs-response'] },
  { id: 'all',            label: 'All Check-ins',  count: tabCounts.value['all'] },
  { id: 'week',           label: 'This Week',      count: tabCounts.value['week'] },
])

// ── Detail state ───────────────────────────────────────────
const detailCheckIn = shallowRef<ModelsCoachCheckIn | null>(null)
const clientHistory = shallowRef<ModelsCoachCheckIn[]>([])
const detailLoading = ref(false)
const sending = ref(false)
const savingDraft = ref(false)

watch(selectedId, async (id) => {
  if (!id) {
    detailCheckIn.value = null
    clientHistory.value = []
    return
  }

  detailLoading.value = true
  const listItem = checkIns.value.find(ci => ci.id === id)
  const clientId = listItem?.client_id ?? detailCheckIn.value?.client_id

  try {
    const [detail, historyRes] = await Promise.all([
      checkInsApi.get(id),
      clientId ? checkInsApi.list({ client_id: clientId, per_page: 30 }) : null,
    ])

    // Fire-and-forget mark-read
    if (detail && !detail.is_read) {
      checkInsApi.markRead(id).catch(() => {})
      if (listItem) listItem.is_read = true
    }

    detailCheckIn.value = detail
    clientHistory.value = historyRes?.check_ins ?? []
  } catch {
    toast.add({ title: 'Could not load check-in details', color: 'error' })
  } finally {
    detailLoading.value = false
  }
})

// ── Week navigation ────────────────────────────────────────
const sortedHistory = computed(() =>
  [...clientHistory.value].sort((a, b) =>
    (a.week_start_date ?? '').localeCompare(b.week_start_date ?? '')
  )
)

const currentHistoryIdx = computed(() =>
  sortedHistory.value.findIndex(ci => ci.id === selectedId.value)
)

const weekCurrent = computed(() => Math.max(1, currentHistoryIdx.value + 1))
const weekTotal = computed(() => Math.max(1, sortedHistory.value.length))
const hasPrev = computed(() => currentHistoryIdx.value > 0)
const hasNext = computed(() => currentHistoryIdx.value < sortedHistory.value.length - 1)

const onPrevWeek = () => {
  if (hasPrev.value) selectedId.value = sortedHistory.value[currentHistoryIdx.value - 1]!.id!
}
const onNextWeek = () => {
  if (hasNext.value) selectedId.value = sortedHistory.value[currentHistoryIdx.value + 1]!.id!
}

// ── Detail panel derived data ──────────────────────────────
const prevCheckIn = computed(() =>
  currentHistoryIdx.value > 0 ? sortedHistory.value[currentHistoryIdx.value - 1] : undefined
)

const detailCard = computed<CheckInSummary | null>(() => {
  if (!detailCheckIn.value) return null
  return toCard(detailCheckIn.value, clientMap.value.get(detailCheckIn.value.client_id ?? ''))
})

const detailWeekLabel = computed(() =>
  detailCheckIn.value?.week_start_date
    ? `Week of ${fmtWeekOf(detailCheckIn.value.week_start_date)}`
    : ''
)

const detailSubmittedAt = computed(() => fmtDateTime(detailCheckIn.value?.submitted_at))

const selectedMetrics = computed<CheckInMetricsData>(() =>
  detailCheckIn.value
    ? toMetrics(detailCheckIn.value, prevCheckIn.value, sortedHistory.value)
    : toMetrics({})
)

const coachInitials = computed(() => {
  const c = authStore.coach
  return `${c?.first_name?.[0] ?? ''}${c?.last_name?.[0] ?? ''}`.toUpperCase() || '?'
})

const previousResponses = computed<PreviousResponse[]>(() =>
  sortedHistory.value
    .filter(ci => ci.id !== selectedId.value)
    .reverse()
    .map(ci => toPreviousResponse(ci, coachInitials.value))
)

const clientNote = computed(() => detailCheckIn.value?.notes ?? '')
const initialDraft = computed(() => detailCheckIn.value?.response_draft ?? '')

const photoWeekLabel = computed(() =>
  detailCheckIn.value?.photo_urls?.length
    ? `Week of ${fmtWeekOf(detailCheckIn.value.week_start_date)}`
    : undefined
)
const photoSubmittedAt = computed(() =>
  detailCheckIn.value?.submitted_at
    ? new Date(detailCheckIn.value.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''
)

// ── Response handlers ──────────────────────────────────────
const onSend = async (text: string) => {
  if (!selectedId.value || !text.trim()) return
  sending.value = true
  try {
    const updated = await checkInsApi.respond(selectedId.value, { response: text })
    detailCheckIn.value = updated
    toast.add({ title: 'Response sent!', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to send response', color: 'error' })
  } finally {
    sending.value = false
  }
}

const onSaveDraft = async (text: string) => {
  if (!selectedId.value) return
  savingDraft.value = true
  try {
    await checkInsApi.saveDraft(selectedId.value, { draft: text })
    toast.add({ title: 'Draft saved', color: 'neutral' })
  } catch {
    toast.add({ title: 'Failed to save draft', color: 'error' })
  } finally {
    savingDraft.value = false
  }
}
</script>

<template>
  <AppTopbar title="Check-ins" :subtitle="weekDisplayLabel">
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
            <span class="text-[11px] font-semibold text-primary dark:text-(--green-light) bg-(--green-pale) dark:bg-(--bg-primary-soft) py-0.5 px-2 rounded-[10px]">🔥 {{ weekDisplayLabel }}</span>
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
        :loading="listPending"
      />

      <CheckInDetailPanel
        v-if="detailCard || detailLoading"
        :key="selectedId ?? 'none'"
        :check-in="detailCard ?? cards[0]!"
        :metrics="selectedMetrics"
        :previous-responses="previousResponses"
        :client-note="clientNote"
        :week-label="detailWeekLabel"
        :submitted-at="detailSubmittedAt"
        :week-current="weekCurrent"
        :week-total="weekTotal"
        :has-prev="hasPrev"
        :has-next="hasNext"
        :initial-draft="initialDraft"
        :photo-week-label="photoWeekLabel"
        :photo-submitted-at="photoSubmittedAt"
        :loading="detailLoading"
        :sending="sending"
        @send="onSend"
        @save-draft="onSaveDraft"
        @prev-week="onPrevWeek"
        @next-week="onNextWeek"
      />

      <div
        v-else
        class="flex-1 min-w-0 bg-(--bg-surface) rounded-[14px] border border-(--border) flex items-center justify-center p-10 text-(--text-muted) text-center"
      >
        <div>
          <div class="text-[32px] mb-3">📋</div>
          <div class="text-sm font-medium">Select a check-in to view details</div>
        </div>
      </div>
    </div>
  </div>
</template>

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
