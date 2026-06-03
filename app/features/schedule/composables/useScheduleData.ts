import { computed, type Ref, type ComputedRef } from 'vue'
import { addDays, endOfDay, endOfMonth, endOfWeek, format, formatISO, isSameDay, parseISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import type { ModelsCoachSession } from '~/services/types.gen'
import type { DayColumn, SessionData } from '~/features/schedule/components/CalendarGrid.vue'
import type { CalendarView } from '~/features/schedule/components/CalendarViewToggle.vue'
import type { UpcomingGroup } from '~/features/schedule/components/ScheduleSidePanel.vue'
import { useScheduleApi } from '~/features/schedule/composables/useScheduleApi'
import { useAvailability } from '~/features/schedule/composables/useAvailability'
import {
  buildUnavailableBlocks,
  buildWeekDays,
  formatTimeRange,
  initialsFrom,
  sessionHeight,
  sessionTop,
  variantFor,
  weekRangeLabel,
  weekSubLabel,
} from '~/features/schedule/utils/calendar'

export function useScheduleData(
  currentWeek: ComputedRef<Date>,
  liveNowTop: Ref<number>,
  view: Ref<CalendarView>,
) {
  const { list } = useScheduleApi()
  const { slots: availabilitySlots } = useAvailability()

  const { data: rawData, pending, refresh } = useAsyncData<ModelsCoachSession[]>(
    'schedule-sessions',
    async () => {
      // Month view renders a full 6-week grid, so fetch the whole visible month;
      // week/day views only need the current week's range.
      const [rangeStart, rangeEnd] = view.value === 'month'
        ? [
            startOfWeek(startOfMonth(currentWeek.value), { weekStartsOn: 1 }),
            endOfWeek(endOfMonth(currentWeek.value), { weekStartsOn: 1 }),
          ]
        : [startOfDay(currentWeek.value), endOfDay(addDays(currentWeek.value, 6))]
      const res = await list({ from: formatISO(rangeStart), to: formatISO(rangeEnd), per_page: 100 })
      return res?.sessions ?? []
    },
    { watch: [currentWeek, view] },
  )

  const sessions = computed<ModelsCoachSession[]>(() => rawData.value ?? [])

  // Transform to DayColumn[] 
  const days = computed<DayColumn[]>(() => {
    const today   = new Date()
    const weekDays = buildWeekDays(currentWeek.value)

    return weekDays.map(({ date, dayName, dayNum }) => {
      const isToday   = isSameDay(date, today)
      const isWeekend = [0, 6].includes(date.getDay())

      const daySessions: SessionData[] = sessions.value
        .filter(s => s.starts_at && isSameDay(parseISO(s.starts_at), date))
        .map(s => toSessionData(s))
        .sort((a, b) => a.top - b.top)

      const col: DayColumn = {
        id:       format(date, 'yyyy-MM-dd'),
        dayName,
        dayNum,
        today:    isToday || undefined,
        weekend:  isWeekend || undefined,
        muted:    isWeekend || undefined,
        sessions: daySessions,
        // Only shade the grid once availability is actually configured —
        // an empty set means "not set up", not "unavailable all week".
        unavailable: availabilitySlots.value.length
          ? buildUnavailableBlocks(date, availabilitySlots.value)
          : undefined,
      }

      if (isToday) col.currentTimeTop = liveNowTop.value

      return col
    })
  })

  // Computed labels 
  const weekLabel = computed(() => weekRangeLabel(currentWeek.value))
  const weekSub   = computed(() => weekSubLabel(currentWeek.value, sessions.value.length))

  // Sidebar groups — mirror the currently-viewed week (not today-onward) so the
  // side panel and the agenda/grid never disagree about what "this week" means.
  const upcomingGroups = computed<UpcomingGroup[]>(() => {
    const today = startOfDay(new Date())
    const ordered = [...sessions.value]
      .filter(s => s.starts_at)
      .sort((a, b) => (a.starts_at ?? '') < (b.starts_at ?? '') ? -1 : 1)

    const byDay = new Map<string, ModelsCoachSession[]>()
    for (const s of ordered) {
      const key = format(parseISO(s.starts_at!), 'yyyy-MM-dd')
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key)!.push(s)
    }

    return [...byDay.entries()].map(([key, items]) => {
      const date  = parseISO(key)
      const isToday = isSameDay(date, today)
      const isPast = date < today && !isToday
      return {
        label: isToday
          ? `Today · ${format(date, 'MMM d')}`
          : format(date, "EEEE · MMM d"),
        items: items.map(s => ({
          time:     format(parseISO(s.starts_at!), 'H:mm'),
          initials: initialsFrom(s.title),
          variant:  variantFor(s.client_id),
          name:     s.title ?? 'Session',
          type:     formatSessionSubtitle(s),
          status:   s.confirmed ? 'confirmed' : 'pending',
          today:    isToday || undefined,
          past:     isPast || undefined,
        })),
      }
    })
  })

  const confirmedCount = computed(() => sessions.value.filter(s => s.confirmed).length)
  const totalCount     = computed(() => sessions.value.length)
  const totalHours     = computed(() => {
    const mins = sessions.value.reduce((acc, s) => acc + (s.duration_mins ?? 0), 0)
    return (mins / 60).toFixed(1)
  })

  return {
    days,
    sessions,
    weekLabel,
    weekSub,
    upcomingGroups,
    confirmedCount,
    totalCount,
    totalHours,
    pending,
    refresh,
  }
}

// Helpers

function toSessionData(s: ModelsCoachSession): SessionData {
  const type       = s.session_type as 'virtual' | 'inperson' | 'group' | undefined
  const sessionType = type ?? 'virtual'
  const durationMins = s.duration_mins ?? 60
  const height = sessionHeight(durationMins)
  const short  = height <= 42

  return {
    id:          s.id ?? '',
    client:      s.title ?? 'Session',
    type:        formatSessionSubtitle(s),
    shortType:   sessionType === 'virtual' ? 'Virtual · Zoom' : sessionType === 'group' ? 'Group' : 'In-Person',
    time:        s.starts_at ? formatTimeRange(s.starts_at, durationMins) : '',
    startsAt:    s.starts_at ?? '',
    durationMins,
    location:    sessionLocation(s),
    sessionType,
    initials:    initialsFrom(s.title),
    variant:     variantFor(s.client_id),
    status:      s.confirmed ? 'confirmed' : 'pending',
    top:         s.starts_at ? sessionTop(s.starts_at) : 0,
    height,
    short:       short || undefined,
    unconfirmed: !s.confirmed || undefined,
    badge:       sessionType === 'group' ? 'Group' : undefined,
  }
}

function sessionLocation(s: ModelsCoachSession): string {
  if (s.session_type === 'virtual') return s.zoom_link ? `Zoom · ${s.zoom_link}` : 'Zoom'
  if (s.session_type === 'group')   return 'Group Session'
  return 'In-Person'
}

function formatSessionSubtitle(s: ModelsCoachSession): string {
  const type = s.session_type === 'virtual' ? 'Zoom'
    : s.session_type === 'group' ? 'Group'
    : 'In-Person'
  return type
}
