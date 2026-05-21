import {
  format,
  formatDistanceToNowStrict,
  isYesterday,
  isToday,
  parseISO,
  startOfWeek,
  parse,
} from 'date-fns'

function toDate(iso?: string): Date | null {
  if (!iso) return null
  try { return parseISO(iso) } catch { return null }
}

export function fmtTime(iso?: string): string {
  const d = toDate(iso)
  return d ? format(d, 'h:mm aa') : ''
}

export function fmtDate(iso?: string): string {
  const d = toDate(iso)
  return d ? format(d, 'MMM d') : '—'
}

export function fmtRelative(iso?: string): string {
  const d = toDate(iso)
  if (!d) return '—'
  if (isToday(d)) return `${formatDistanceToNowStrict(d, { addSuffix: false })} ago`
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function fmtDateTime(iso?: string): string {
  const d = toDate(iso)
  return d ? format(d, 'EEE, MMM d, h:mm aa') : ''
}

export function fmtWeekOf(weekStartDate?: string): string {
  if (!weekStartDate) return '—'
  // Parse as local date (yyyy-MM-dd) to avoid UTC off-by-one
  const d = parse(weekStartDate, 'yyyy-MM-dd', new Date())
  return format(d, 'MMM d')
}

export function currentWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function centsToStr(cents?: number): string {
  if (!cents) return '0'
  return (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })
}
