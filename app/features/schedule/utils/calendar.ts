import {
  addDays,
  addMinutes,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getWeek,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export const GRID_START_HOUR = 0  // 12 AM
export const PX_PER_HOUR = 56     // must match CalendarGrid row height

// ── Position math ──────────────────────────────────────────

export function sessionTop(startsAt: string): number {
  const d = parseISO(startsAt)
  const minutesSinceGridStart = (d.getHours() - GRID_START_HOUR) * 60 + d.getMinutes()
  return Math.max(0, (minutesSinceGridStart / 60) * PX_PER_HOUR)
}

export function sessionHeight(durationMins: number): number {
  return Math.max(28, (durationMins / 60) * PX_PER_HOUR)
}

export function nowTop(): number {
  const now = new Date()
  const minutesSinceGridStart = (now.getHours() - GRID_START_HOUR) * 60 + now.getMinutes()
  return Math.max(0, (minutesSinceGridStart / 60) * PX_PER_HOUR)
}

// ── Time display ───────────────────────────────────────────

export function formatTimeRange(startsAt: string, durationMins: number): string {
  const start = parseISO(startsAt)
  const end = addMinutes(start, durationMins)
  return `${format(start, 'h:mm')} – ${format(end, 'h:mm aa')}`
}

// ── Week helpers ───────────────────────────────────────────

export interface WeekDay {
  date: Date
  dayName: string
  dayNum: string
}

export function buildWeekDays(weekStart: Date): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return {
      date,
      dayName: format(date, 'EEE'),  // "Mon"
      dayNum:  format(date, 'd'),     // "14"
    }
  })
}

export function weekRangeLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const startMonth = format(weekStart, 'MMMM')
  const endMonth   = format(end, 'MMMM')
  const year       = format(end, 'yyyy')
  if (startMonth === endMonth) {
    return `${startMonth} ${format(weekStart, 'd')} – ${format(end, 'd')}, ${year}`
  }
  return `${format(weekStart, 'MMM d')} – ${format(end, 'MMM d')}, ${year}`
}

export function weekSubLabel(weekStart: Date, sessionCount: number): string {
  const weekNum = getWeek(weekStart, { weekStartsOn: 1 })
  return `Week ${weekNum} of 52  ·  ${sessionCount} session${sessionCount === 1 ? '' : 's'} this week`
}

export function weekStartFromDate(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 })
}

export function nextWeekStart(weekStart: Date): Date {
  return addWeeks(weekStart, 1)
}

export function prevWeekStart(weekStart: Date): Date {
  return addWeeks(weekStart, -1)
}

// ── Month helpers ──────────────────────────────────────────

export interface MonthCell {
  date: Date
  dayNum: string
  isToday: boolean
  isCurrentMonth: boolean
  isWeekend: boolean
}

export function buildMonthGrid(month: Date): MonthCell[][] {
  const monthStart = startOfMonth(month)
  const monthEnd   = endOfMonth(month)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd    = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const today      = new Date()

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weeks: MonthCell[][] = []

  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(
      allDays.slice(i, i + 7).map(date => ({
        date,
        dayNum:          format(date, 'd'),
        isToday:         isSameDay(date, today),
        isCurrentMonth:  isSameMonth(date, month),
        isWeekend:       [0, 6].includes(date.getDay()),
      })),
    )
  }
  return weeks
}

// ── Avatar helpers ─────────────────────────────────────────

const VARIANTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
export type AvatarVariant = (typeof VARIANTS)[number]

export function initialsFrom(name?: string): string {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export function variantFor(id?: string): AvatarVariant {
  if (!id) return 'a'
  const sum = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return VARIANTS[sum % VARIANTS.length]!
}
