import { ref, computed, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import type { ClientFilters } from '../components/ClientFilterPanel.vue'
import type { SortState } from '../components/ClientSortDropdown.vue'

type StatusFilter = 'all' | 'active' | 'paused' | 'new' | 'ended'

// ── Query param helpers ────────────────────────────────────────────────────

function parseStr<T extends string>(v: unknown, fallback: T): T {
  return typeof v === 'string' && v.length > 0 ? (v as T) : fallback
}

function parseArray(v: unknown): string[] {
  if (typeof v === 'string' && v.length > 0) return v.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

function parseNum(v: unknown, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

// ── Composable ─────────────────────────────────────────────────────────────

export function useClientsFilters() {
  const route  = useRoute()
  const router = useRouter()

  // ── Initialize from URL (one-time read on setup) ───────────────────────

  const search      = ref(parseStr(route.query.q, ''))
  const activeChip  = ref<StatusFilter>(parseStr<StatusFilter>(route.query.status, 'all'))
  const page        = ref(parseNum(route.query.page, 1))
  const sortCol     = ref<SortState['column']>(
    parseStr<SortState['column']>(route.query.sort, 'lastCheckIn'),
  )
  const sortDir     = ref<SortState['direction']>(
    parseStr<SortState['direction']>(route.query.dir, 'desc'),
  )
  const goalsArr       = ref<string[]>(parseArray(route.query.goals))
  const plansArr       = ref<string[]>(parseArray(route.query.plans))
  const VALID_CHECKIN = new Set<ClientFilters['checkIn']>(['overdue', 'late', 'current'])

  function parseCheckIn(v: unknown): ClientFilters['checkIn'] {
    return typeof v === 'string' && VALID_CHECKIN.has(v as ClientFilters['checkIn'])
      ? (v as ClientFilters['checkIn'])
      : null
  }

  const checkInFilter = ref<ClientFilters['checkIn']>(parseCheckIn(route.query.checkIn))

  // ── Derived refs ───────────────────────────────────────────────────────

  const debouncedSearch = refDebounced(search, 300)

  // ── Writeable computed: sort ───────────────────────────────────────────

  const sort = computed<SortState>({
    get: () => ({ column: sortCol.value, direction: sortDir.value }),
    set: (v: SortState) => {
      sortCol.value = v.column
      sortDir.value = v.direction
    },
  })

  // ── Writeable computed: filters ────────────────────────────────────────

  const filters = computed<ClientFilters>({
    get: () => ({
      goals:   goalsArr.value,
      plans:   plansArr.value,
      checkIn: checkInFilter.value,
    }),
    set: (v: ClientFilters) => {
      goalsArr.value      = v.goals ?? []
      plansArr.value      = v.plans ?? []
      checkInFilter.value = v.checkIn ?? null
    },
  })

  // ── filterActive ──────────────────────────────────────────────────────

  const filterActive = computed(
    () =>
      activeChip.value !== 'all' ||
      !!debouncedSearch.value ||
      goalsArr.value.length > 0 ||
      plansArr.value.length > 0 ||
      checkInFilter.value !== null,
  )

  // ── listParams ────────────────────────────────────────────────────────

  const listParams = computed(() => ({
    ...(activeChip.value !== 'all' ? { status: activeChip.value } : {}),
    ...(debouncedSearch.value ? { search: debouncedSearch.value } : {}),
    page:     page.value,
    per_page: 20,
  }))

  // ── Reset page on filter/search change ────────────────────────────────

  watch(
    [activeChip, debouncedSearch, goalsArr, plansArr, checkInFilter],
    () => { page.value = 1 },
  )

  // ── Sync state → URL (debounced 50 ms to batch rapid changes) ─────────

  let syncTimer: ReturnType<typeof setTimeout> | null = null

  function scheduleSync() {
    if (syncTimer !== null) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      const q: Record<string, string> = {}

      if (search.value)                            q.q       = search.value
      if (activeChip.value !== 'all')              q.status  = activeChip.value
      if (page.value !== 1)                        q.page    = String(page.value)
      if (sortCol.value !== 'lastCheckIn')         q.sort    = sortCol.value
      if (sortDir.value !== 'desc')                q.dir     = sortDir.value
      if (goalsArr.value.length > 0)               q.goals   = goalsArr.value.join(',')
      if (plansArr.value.length > 0)               q.plans   = plansArr.value.join(',')
      if (checkInFilter.value !== null)            q.checkIn = checkInFilter.value

      router.replace({ query: q })
      syncTimer = null
    }, 50)
  }

  watch(
    [search, activeChip, page, sortCol, sortDir, goalsArr, plansArr, checkInFilter],
    scheduleSync,
  )

  // ── Public API ────────────────────────────────────────────────────────

  return {
    search,
    activeChip,
    page,
    sort,
    filters,
    filterActive,
    listParams,
  }
}
