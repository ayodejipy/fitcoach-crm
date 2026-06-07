import { differenceInDays, parseISO, parse, format } from 'date-fns'
import type { ModelsClient, ModelsCoachCheckIn } from '~/services'

export type MetricChipTone = 'good' | 'warning' | 'neutral'

export interface MetricChip {
  label: string
  tone: MetricChipTone
}

// Decides which tone each metric chip should render with based on whether the
// number reads as positive/neutral/concerning. Thresholds are intentionally
// generous for a "first version" — coach feedback will sharpen them.
// weightUnit is passed in (rather than read here) so the util stays
// component-free — callers thread the coach's preference through.
export function metricChipsFor(checkIn: ModelsCoachCheckIn, weightUnit: 'kg' | 'lbs' = 'lbs'): MetricChip[] {
  const chips: MetricChip[] = []

  if (checkIn.energy_score != null) {
    const score = checkIn.energy_score
    chips.push({
      label: `Energy ${score}/10`,
      tone: score >= 7 ? 'good' : score >= 5 ? 'neutral' : 'warning',
    })
  }

  if (checkIn.sleep_hrs != null) {
    const hours = checkIn.sleep_hrs
    chips.push({
      label: `Sleep ${hours}h`,
      tone: hours >= 7 ? 'good' : hours >= 6 ? 'neutral' : 'warning',
    })
  }

  if (checkIn.weight != null) {
    chips.push({ label: `${checkIn.weight} ${weightUnit}`, tone: 'neutral' })
  }

  if (checkIn.mood_score != null) {
    const score = checkIn.mood_score
    chips.push({
      label: `Mood ${score}/10`,
      tone: score >= 7 ? 'good' : score >= 5 ? 'neutral' : 'warning',
    })
  }

  return chips
}

// Returns the week number within the client's program based on their start_date.
// Falls back to 1 if start_date is missing.
export function weekNumberFor(checkIn: ModelsCoachCheckIn, client?: ModelsClient): number {
  if (!client?.start_date) return 1
  const checkInDate = checkIn.week_start_date
    ? parse(checkIn.week_start_date, 'yyyy-MM-dd', new Date())
    : checkIn.submitted_at
      ? parseISO(checkIn.submitted_at)
      : null
  if (!checkInDate) return 1
  const start = parse(client.start_date, 'yyyy-MM-dd', new Date())
  const days = differenceInDays(checkInDate, start)
  return Math.max(1, Math.floor(days / 7) + 1)
}

export function programTotalFor(client?: ModelsClient): number {
  return client?.program_total ?? 12
}

// "Wk 3 of 12 · submitted Thu, May 21" style row label
export function rowMetaLabel(checkIn: ModelsCoachCheckIn, client?: ModelsClient): string {
  const wk = weekNumberFor(checkIn, client)
  const total = programTotalFor(client)
  const submitted = checkIn.submitted_at
    ? format(parseISO(checkIn.submitted_at), 'EEE, MMM d')
    : null
  return submitted ? `Wk ${wk} of ${total} · submitted ${submitted}` : `Wk ${wk} of ${total}`
}

export interface CheckInsGrouped {
  needsResponse: ModelsCoachCheckIn[]
  responded: ModelsCoachCheckIn[]
}

// Splits check-ins by whether the coach has replied. A check-in being "read"
// (is_read=true) is a separate concern — that controls the unread dot, not
// the grouping. Sorted oldest-first within each group so the oldest unread
// rises to the top of "Needs response" (highest urgency).
export function groupByStatus(checkIns: ModelsCoachCheckIn[]): CheckInsGrouped {
  const needsResponse: ModelsCoachCheckIn[] = []
  const responded: ModelsCoachCheckIn[] = []
  for (const checkIn of checkIns) {
    if (checkIn.coach_response) responded.push(checkIn)
    else needsResponse.push(checkIn)
  }
  needsResponse.sort((a, b) => (a.submitted_at ?? '').localeCompare(b.submitted_at ?? ''))
  responded.sort((a, b) => (b.responded_at ?? b.submitted_at ?? '').localeCompare(a.responded_at ?? a.submitted_at ?? ''))
  return { needsResponse, responded }
}
