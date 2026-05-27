<script setup lang="ts">
import { computed } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import CheckInFilterTabs from '~/features/check-ins/components/CheckInFilterTabs.vue'
import CheckInList from '~/features/check-ins/components/CheckInList.vue'
import CheckInDetailPanel from '~/features/check-ins/components/CheckInDetailPanel.vue'
import CustomizeFormModal from '~/features/check-ins/components/CustomizeFormModal.vue'
import SendReminderModal from '~/features/check-ins/components/SendReminderModal.vue'
import type { ModelsClient } from '~/services'
import { useCheckInsApi } from '~/features/check-ins/composables/useCheckInsApi'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { useCheckInDetail } from '~/features/check-ins/composables/useCheckInDetail'
import { useCheckInModals } from '~/features/check-ins/composables/useCheckInModals'
import { useCheckInFilters } from '~/features/check-ins/composables/useCheckInFilters'
import { toCard } from '~/features/check-ins/utils/transform'
import type { CheckInSummary } from '~/features/check-ins/components/CheckInCard.vue'

definePageMeta({ layout: 'app' })

const checkInsApi = useCheckInsApi()
const clientsApi  = useClientsApi()
const authStore   = useAuthStore()
const toast       = useToast()

// weekStart is a plain string used in multiple fetch calls
const weekStart = currentWeekStart()

// ── Data fetching (SSR blocking) — init counts + clients ──
const { data: initData } = await useAsyncData('check-ins-init', () =>
  Promise.all([
    clientsApi.list({ per_page: 200 }),
    checkInsApi.list({ status: 'unread', per_page: 1 }),
    checkInsApi.list({ per_page: 1 }),
    checkInsApi.list({ week_start: weekStart, per_page: 1 }),
  ])
)

// ── Tab counts (needed by filter composable) ───────────────
const tabCounts = computed(() => ({
  'needs-response': initData.value?.[1]?.total ?? 0,
  'all':            initData.value?.[2]?.total ?? 0,
  'week':           initData.value?.[3]?.total ?? 0,
}))

// ── Filter / selection state (URL-synced) ──────────────────
const {
  activeFilter,
  selectedId,
  listParams,
  filterTabs,
  weekDisplayLabel,
} = useCheckInFilters(tabCounts, weekStart)

// ── Data fetching — paginated list (re-fetches on filter change)
const { data: listData, pending: listPending } = await useAsyncData(
  'check-ins-list',
  () => checkInsApi.list(listParams.value),
  { watch: [activeFilter] },
)

// ── Derived data ───────────────────────────────────────────
const clientMap = computed(() => {
  const m = new Map<string, ModelsClient>()
  for (const c of initData.value?.[0]?.clients ?? []) {
    if (c.id) m.set(c.id, c)
  }
  return m
})

const checkIns = computed(() => listData.value?.check_ins ?? [])

const cards = computed<CheckInSummary[]>(() =>
  checkIns.value.map(ci => toCard(ci, clientMap.value.get(ci.client_id ?? '')))
)

const unreadCount   = computed(() => tabCounts.value['needs-response'])
const totalThisWeek = computed(() => tabCounts.value['week'])

const coachInitials = computed(() => {
  const c = authStore.coach
  return `${c?.first_name?.[0] ?? ''}${c?.last_name?.[0] ?? ''}`.toUpperCase() || '?'
})

// ── Feature composables ────────────────────────────────────
const {
  detailCard,
  detailLoading,
  detailWeekLabel,
  detailSubmittedAt,
  selectedMetrics,
  previousResponses,
  clientNote,
  initialDraft,
  photoWeekLabel,
  photoSubmittedAt,
  weekCurrent,
  weekTotal,
  hasPrev,
  hasNext,
  onPrevWeek,
  onNextWeek,
  sending,
  sentTick,
  onSend,
  onSaveDraft,
} = useCheckInDetail(selectedId, checkIns, clientMap, coachInitials)

const {
  customizeOpen,
  reminderOpen,
  reminderClients,
  onReminderSent,
} = useCheckInModals(checkIns, clientMap)
</script>

<template>
  <AppTopbar title="Check-ins" :subtitle="weekDisplayLabel">
    <template #actions>
      <UButton
        variant="outline"
        color="neutral"
        class="hover:border-primary hover:text-primary hover:bg-[#F0F9F4] dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
        @click="customizeOpen = true"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.3"/>
          <path d="M4 6.5h5M6.5 4v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Customize Form
      </UButton>
      <UButton
        variant="outline"
        color="neutral"
        class="hover:border-primary hover:text-primary hover:bg-[#F0F9F4] dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
        @click="reminderOpen = true"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 6.5h9M6.5 2l4.5 4.5L6.5 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Send Reminder
      </UButton>
    </template>
  </AppTopbar>

  <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
    <!-- Page head -->
    <div class="px-8 pt-5 bg-[#F0F4F1] dark:bg-(--bg-page) shrink-0">
      <div class="flex items-center gap-2.5 mb-1">
        <h1 class="text-[22px] font-extrabold text-(--text-primary) tracking-[-0.4px]">Check-ins</h1>
        <span class="bg-[#E74C3C] text-white text-[11px] font-bold py-0.5 px-2 rounded-[10px]">{{ unreadCount }} unread</span>
        <span class="text-[11px] font-semibold text-primary dark:text-(--green-light) bg-(--green-pale) dark:bg-(--bg-primary-soft) py-0.5 px-2 rounded-[10px]">🔥 {{ weekDisplayLabel }}</span>
      </div>
      <p class="text-[13px] text-(--text-muted) mb-4 flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M6.5 3.5v3.5l2 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        {{ unreadCount }} unread check-ins need your response · {{ totalThisWeek }} clients checked in this week
      </p>
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
        :sent-tick="sentTick"
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
          <p class="text-sm font-medium">Select a check-in to view details</p>
        </div>
      </div>
    </div>
  </div>

  <CustomizeFormModal
    v-model:open="customizeOpen"
    @saved="toast.add({ title: 'Form saved!', color: 'success' })"
  />

  <SendReminderModal
    v-model:open="reminderOpen"
    :clients="reminderClients"
    @sent="onReminderSent"
  />
</template>
