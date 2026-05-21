import { computed, type ComputedRef } from 'vue'
import { fmtWeekOf } from '~/utils/format'

export type FilterId = 'needs-response' | 'all' | 'week'

const VALID_FILTERS = new Set<FilterId>(['needs-response', 'all', 'week'])

export function useCheckInFilters(
  tabCounts: ComputedRef<Record<FilterId, number>>,
  weekStart: string,
) {
  const route  = useRoute()
  const router = useRouter()

  // ── URL-synced state ───────────────────────────────────────
  const activeFilter = computed<FilterId>({
    get() {
      const f = route.query.filter as FilterId
      return VALID_FILTERS.has(f) ? f : 'needs-response'
    },
    set(val) {
      router.replace({ query: { ...route.query, filter: val, id: undefined } })
    },
  })

  const selectedId = computed<string | null>({
    get() {
      return (route.query.id as string) ?? null
    },
    set(val) {
      router.replace({ query: { ...route.query, id: val ?? undefined } })
    },
  })

  // ── Derived ────────────────────────────────────────────────
  const listParams = computed(() => {
    if (activeFilter.value === 'needs-response') return { status: 'unread', per_page: 50 }
    if (activeFilter.value === 'week')           return { week_start: weekStart, per_page: 50 }
    return { per_page: 50 }
  })

  const weekDisplayLabel = `Week of ${fmtWeekOf(weekStart)}`

  const filterTabs = computed(() => [
    { id: 'needs-response', label: 'Needs Response', count: tabCounts.value['needs-response'] },
    { id: 'all',            label: 'All Check-ins',  count: tabCounts.value['all'] },
    { id: 'week',           label: 'This Week',      count: tabCounts.value['week'] },
  ])

  return { activeFilter, selectedId, listParams, weekDisplayLabel, filterTabs }
}
