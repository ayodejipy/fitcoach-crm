import { ref, shallowRef, computed, watch, type Ref, type ComputedRef } from 'vue'
import type { ModelsClient, ModelsCoachCheckIn } from '~/services'
import { fmtWeekOf, fmtDateTime } from '~/utils/format'
import { useCheckInsApi } from './useCheckInsApi'
import { toCard, toMetrics, toPreviousResponse } from '../utils/transform'
import type { CheckInSummary } from '../components/CheckInCard.vue'
import type { CheckInMetricsData } from '../components/CheckInMetrics.vue'
import type { PreviousResponse } from '../components/PreviousResponses.vue'

export function useCheckInDetail(
  selectedId: Ref<string | null>,
  checkIns: ComputedRef<ModelsCoachCheckIn[]>,
  clientMap: ComputedRef<Map<string, ModelsClient>>,
  coachInitials: ComputedRef<string>,
) {
  const checkInsApi = useCheckInsApi()
  const toast = useToast()

  // ── Core state ─────────────────────────────────────────────
  const detailCheckIn = shallowRef<ModelsCoachCheckIn | null>(null)
  const clientHistory = shallowRef<ModelsCoachCheckIn[]>([])
  const detailLoading = ref(false)
  const sending       = ref(false)
  const savingDraft   = ref(false)
  // Bumped on each successful send so the composer can clear only on success.
  const sentTick      = ref(0)

  // ── Load detail + history whenever selection changes ───────
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
  const weekTotal   = computed(() => Math.max(1, sortedHistory.value.length))
  const hasPrev     = computed(() => currentHistoryIdx.value > 0)
  const hasNext     = computed(() => currentHistoryIdx.value < sortedHistory.value.length - 1)

  const onPrevWeek = () => {
    if (hasPrev.value) selectedId.value = sortedHistory.value[currentHistoryIdx.value - 1]!.id!
  }
  const onNextWeek = () => {
    if (hasNext.value) selectedId.value = sortedHistory.value[currentHistoryIdx.value + 1]!.id!
  }

  // ── Derived panel data ─────────────────────────────────────
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

  const previousResponses = computed<PreviousResponse[]>(() =>
    sortedHistory.value
      .filter(ci => ci.id !== selectedId.value)
      .reverse()
      .map(ci => toPreviousResponse(ci, coachInitials.value))
  )

  const clientNote   = computed(() => detailCheckIn.value?.notes ?? '')
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

  // Actions
  const onSend = async (text: string) => {
    if (!selectedId.value || !text.trim()) return
    sending.value = true
    try {
      const updated = await checkInsApi.respond(selectedId.value, { response: text })
      detailCheckIn.value = updated
      sentTick.value++
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

  return {
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
  }
}
