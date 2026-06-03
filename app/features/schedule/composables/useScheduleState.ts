import { computed, onMounted, onUnmounted, ref } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  nowTop,
  prevWeekStart,
  nextWeekStart,
  weekStartFromDate,
} from '~/features/schedule/utils/calendar'
import type { CalendarView } from '~/features/schedule/components/CalendarViewToggle.vue'

export function useScheduleState() {
  const route  = useRoute()
  const router = useRouter()

  // ── Week (URL-synced: ?week=2026-04-14) ────────────────────
  const currentWeek = computed<Date>({
    get() {
      const raw = route.query.week as string | undefined
      if (raw) {
        try { return parseISO(raw) } catch {}
      }
      return weekStartFromDate(new Date())
    },
    set(d) {
      router.replace({ query: { ...route.query, week: format(d, 'yyyy-MM-dd') } })
    },
  })

  // Locked default per the schedule-B mockup: agenda lands first because at
  // small client counts an empty 7-column grid reads as "you have nothing
  // happening" — a list reads as "here is what is happening."
  const VALID_VIEWS = new Set<CalendarView>(['day', 'week', 'month', 'agenda'])
  const view = computed<CalendarView>({
    get() {
      const v = route.query.view as CalendarView | undefined
      return v && VALID_VIEWS.has(v) ? v : 'agenda'
    },
    set(v) {
      router.replace({ query: { ...route.query, view: v } })
    },
  })

  // ── Navigation ─────────────────────────────────────────────
  function prevWeek() { currentWeek.value = prevWeekStart(currentWeek.value) }
  function nextWeek() { currentWeek.value = nextWeekStart(currentWeek.value) }
  function goToday()  { currentWeek.value = weekStartFromDate(new Date()) }

  // Switch to day view and navigate to a specific date
  function goToDay(date: Date) {
    currentWeek.value = weekStartFromDate(date)
    view.value = 'day'
    selectedDay.value = format(date, 'yyyy-MM-dd')
  }

  // ── Selected day for day view (defaults to today) ──────────
  const selectedDay = computed<string>({
    get() {
      return (route.query.day as string) ?? format(new Date(), 'yyyy-MM-dd')
    },
    set(v) {
      router.replace({ query: { ...route.query, day: v } })
    },
  })

  const selectedDayDate = computed(() => {
    try { return parseISO(selectedDay.value) } catch { return new Date() }
  })

  // ── Live "Now" indicator — updates every minute ────────────
  const liveNowTop = ref(nowTop())
  let timer: ReturnType<typeof setInterval>
  onMounted(() => {
    timer = setInterval(() => { liveNowTop.value = nowTop() }, 60_000)
  })
  onUnmounted(() => clearInterval(timer))

  // ── Is the displayed week the current real-world week? ─────
  const isCurrentWeek = computed(() => {
    const todayWeek = weekStartFromDate(new Date())
    return format(currentWeek.value, 'yyyy-MM-dd') === format(todayWeek, 'yyyy-MM-dd')
  })

  return {
    currentWeek,
    view,
    selectedDay,
    selectedDayDate,
    prevWeek,
    nextWeek,
    goToday,
    goToDay,
    liveNowTop,
    isCurrentWeek,
  }
}
