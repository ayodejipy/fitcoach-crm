import { differenceInDays, format, parse, parseISO } from 'date-fns'
import type { ModelsClient, ModelsCoachCheckIn, ModelsCoachSession } from '~/services'

// Discriminated union over event types that can appear on the client timeline.
// Adding a new type? Add to TimelineEvent, then update eventIcon/eventDotClass in
// pages/clients/[id].vue and the v-if branches.
export type TimelineEvent =
  | { kind: 'checkin', id: string, date: Date, checkIn: ModelsCoachCheckIn, weekNumber: number }
  | { kind: 'session', id: string, date: Date, session: ModelsCoachSession }
  | { kind: 'joined',  id: string, date: Date, clientName: string }
  | { kind: 'note',    id: string, date: Date, text: string, coachInitials: string }

// Human label for the date-group header above a cluster of events.
// Buckets are deliberately coarser as they get older — recent activity is what
// the coach cares about; old stuff just needs to be findable.
export function bucketLabel(date: Date, now: Date = new Date()): string {
  const days = differenceInDays(now, date)
  if (days < 0) return 'Coming up'
  if (days < 7)  return 'This week'
  if (days < 14) return 'Last week'
  if (days < 21) return 'Two weeks ago'
  if (days < 28) return 'Three weeks ago'
  return format(date, 'MMMM yyyy')
}

interface BuildOpts {
  client: ModelsClient
  checkIns: ModelsCoachCheckIn[]
  sessions: ModelsCoachSession[]
}

// Builds a chronologically-descending list of timeline events from a client's
// check-ins, completed sessions, and join date. Notes aren't included yet —
// backend doesn't expose them; once it does, push them here from a `notes` arg.
export function buildTimeline(opts: BuildOpts): TimelineEvent[] {
  const events: TimelineEvent[] = []

  const startDate = opts.client.start_date
    ? parse(opts.client.start_date, 'yyyy-MM-dd', new Date())
    : null

  for (const ci of opts.checkIns) {
    if (!ci.submitted_at || !ci.id) continue
    const date = parseISO(ci.submitted_at)
    const weekNumber = startDate
      ? Math.max(1, Math.floor(differenceInDays(date, startDate) / 7) + 1)
      : 0
    events.push({ kind: 'checkin', id: ci.id, date, checkIn: ci, weekNumber })
  }

  const now = new Date()
  for (const session of opts.sessions) {
    if (!session.starts_at || !session.id) continue
    const date = parseISO(session.starts_at)
    if (date > now) continue
    events.push({ kind: 'session', id: session.id, date, session })
  }

  if (startDate && opts.client.id) {
    events.push({
      kind: 'joined',
      id: `joined-${opts.client.id}`,
      date: startDate,
      clientName: [opts.client.first_name, opts.client.last_name].filter(Boolean).join(' '),
    })
  }

  return events.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export interface TimelineGroup { label: string, events: TimelineEvent[] }

export function groupByBucket(events: TimelineEvent[], now: Date = new Date()): TimelineGroup[] {
  const groups: TimelineGroup[] = []
  for (const event of events) {
    const label = bucketLabel(event.date, now)
    const existing = groups.find(g => g.label === label)
    if (existing) existing.events.push(event)
    else groups.push({ label, events: [event] })
  }
  return groups
}
