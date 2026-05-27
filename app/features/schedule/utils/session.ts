import { format, formatISO, parseISO } from 'date-fns'

export function parseStartsAt(date: string, time: string): string {
  const parts = time.split(' ')
  const period = parts[1]
  const nums = (parts[0] ?? '0:0').split(':').map(Number)
  let h = nums[0] ?? 0
  const m = nums[1] ?? 0
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0

  return formatISO(new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`))
}

export function parseDurationMins(duration: string): number {
  if (duration.includes('hour')) return parseInt(duration) * 60
  return parseInt(duration)
}

// ── Inverse helpers (raw session → modal form values) ──────

/** ISO start → "yyyy-MM-dd" for the date input. Falls back to today. */
export function formatDateInput(iso?: string): string {
  return format(iso ? parseISO(iso) : new Date(), 'yyyy-MM-dd')
}

/** ISO start → "10:00 AM" to match the TIME_SLOTS options. */
export function formatStartTimeSlot(iso?: string): string {
  return iso ? format(parseISO(iso), 'h:mm aa') : '10:00 AM'
}

/** Minutes → a DURATIONS label ("60 min", "2 hours"). */
export function durationLabel(mins?: number): string {
  if (!mins) return '60 min'
  if (mins >= 120 && mins % 60 === 0) return `${mins / 60} hours`
  return `${mins} min`
}
