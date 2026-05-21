import { format, parse, parseISO } from 'date-fns'
import type { ModelsClient, ModelsCoachCheckIn } from '~/services'
import { hashVariant, clientInitials, clientName } from '~/utils/client'
import { fmtRelative, fmtDate, fmtDateTime, centsToStr } from '~/utils/format'
import type { Client, CheckInTone } from '../components/ClientRow.vue'
import type { ClientProfile, ClientProfileStat } from '../components/ClientProfileHeader.vue'
import type { ProfileCheckIn, CheckInMetric, CheckInValueTone } from '../components/ClientCheckInCard.vue'
import type { RecentCheckIn } from '../components/ClientRecentCheckIn.vue'
import type { MetricTile } from '../components/ProgressMetricsCard.vue'
import type { InfoRow } from '../components/ClientQuickInfo.vue'

// ── SVG icon literals ──────────────────────────────────────

const CI_ICONS = {
  energy:    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8.5 1.5L3 9h5.5L7.5 14.5 13 6.5H7.5L8.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  sleep:     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 11A7 7 0 015 2.5 7 7 0 0113.5 11z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  weight:    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="2,12 5,7 8,9 11,4 14,7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  adherence: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
} as const

const HEADER_ICONS = {
  calendar: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 1v2M9 1v2M1 5.5h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  plus:     '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v12M1 6.5h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  clock:    '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 3.5v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  dollar:   '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 4v6M5 5.2c0-.7.7-1.2 1.5-1.2S8 4.5 8 5.2c0 1.5-2.5 1.5-2.5 3 0 .8.7 1.3 1.5 1.3s1.5-.5 1.5-1.3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>',
} as const

const PILL_ICONS = {
  sleep:  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10.5 8.5A5.5 5.5 0 014.5 2.5a5.5 5.5 0 006 6z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  weight: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9l2-4 3 3 2-5 2 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
} as const

// Helpers

export function fmtStartDate(dateStr?: string): string {
  if (!dateStr) return '—'
  try {
    return format(parse(dateStr, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

function checkInDisplay(c: ModelsClient): { lastCheckIn: string; checkInTone: CheckInTone } {
  const status = c.status ?? 'active'
  if (status === 'paused') return { lastCheckIn: 'On pause', checkInTone: 'muted' }
  if (status === 'ended') return { lastCheckIn: 'Program ended', checkInTone: 'muted' }
  if (!c.last_check_in) return { lastCheckIn: 'Never checked in', checkInTone: 'late' }

  const daysAgo = (Date.now() - new Date(c.last_check_in).getTime()) / 86400000
  if (daysAgo < 4) return { lastCheckIn: fmtRelative(c.last_check_in), checkInTone: 'ok' }
  if (daysAgo < 8) return { lastCheckIn: fmtRelative(c.last_check_in), checkInTone: 'warn' }
  return { lastCheckIn: `Overdue — ${Math.floor(daysAgo)} days`, checkInTone: 'late' }
}

function sparklineBars(c: ModelsClient): Array<{ height: number; hi?: boolean }> {
  const streak = c.streak_weeks ?? 0
  const status = c.status ?? 'active'

  let heights: number[]
  if (status === 'ended') {
    heights = [16, 14, 12, 8, 4, 2]
  } else if (status === 'paused') {
    heights = [14, 12, 8, 4, 3, 3]
  } else if (streak >= 4) {
    heights = [8, 10, 12, 14, 16, 18]
  } else if (streak >= 2) {
    heights = [8, 12, 10, 14, 15, 17]
  } else if (streak === 0 && c.last_check_in) {
    heights = [14, 12, 10, 6, 3, 0]
  } else {
    heights = [6, 8, 10, 9, 11, 12]
  }

  return heights.map(h => ({ height: h, hi: h >= 14 }))
}

function energyTone(score?: number | null): CheckInValueTone {
  if (score == null) return 'default'
  if (score >= 7) return 'green'
  if (score >= 5) return 'default'
  return 'warn'
}

function sleepTone(hrs?: number | null): CheckInValueTone {
  if (hrs == null) return 'default'
  if (hrs >= 7) return 'green'
  if (hrs >= 5) return 'default'
  return 'warn'
}

// Exports

export function toClientRow(c: ModelsClient): Omit<Client, 'menuActions'> {
  const status = (c.status as Client['status']) ?? 'active'
  const { lastCheckIn, checkInTone } = checkInDisplay(c)

  return {
    id: c.id!,
    initials: clientInitials(c),
    variant: hashVariant(c.id ?? ''),
    name: clientName(c),
    email: c.email ?? '',
    goal: c.goal ?? '—',
    goalSub: c.goal_sub ?? (c.program_total ? `${c.program_total}-week program` : 'Ongoing'),
    planName: c.plan_name ?? '—',
    planPrice: c.plan_price_cents ? `$${centsToStr(c.plan_price_cents)} / mo` : '—',
    startDate: fmtStartDate(c.start_date),
    lastCheckIn,
    checkInTone,
    sessionsCount: c.sessions_count ?? 0,
    sparkline: sparklineBars(c),
    status,
    isNew: status === 'new',
    statusLabel: status === 'new' ? 'Trial' : undefined,
  }
}

export function toClientProfile(c: ModelsClient): ClientProfile {
  const stats: ClientProfileStat[] = []

  if (c.start_date) {
    stats.push({ iconSvg: HEADER_ICONS.calendar, leadingText: 'Started', value: fmtStartDate(c.start_date) })
  }
  if (c.sessions_count != null) {
    stats.push({ iconSvg: HEADER_ICONS.plus, value: String(c.sessions_count), trailingText: 'sessions completed' })
  }
  if (c.program_total) {
    stats.push({ iconSvg: HEADER_ICONS.clock, value: `${c.program_total}-week`, trailingText: 'program' })
  }
  if (c.plan_price_cents) {
    stats.push({ iconSvg: HEADER_ICONS.dollar, leadingText: 'Paying —', value: `$${centsToStr(c.plan_price_cents)}/mo` })
  }

  return {
    initials: clientInitials(c),
    name: clientName(c),
    goal: [c.goal, c.goal_sub].filter(Boolean).join(' · ') || 'No goal set',
    stats,
    streakWeeks: c.streak_weeks,
    lastCheckIn: c.last_check_in ? fmtRelative(c.last_check_in) : 'Never',
    programWeek: c.program_week ?? 1,
    programTotal: c.program_total ?? 12,
  }
}

export function toProfileCheckIn(
  ci: ModelsCoachCheckIn,
  weekNum: number,
  coachInitials: string,
): ProfileCheckIn {
  const metrics: CheckInMetric[] = [
    {
      iconSvg: CI_ICONS.energy,
      label: 'Energy',
      value: ci.energy_score != null ? `${ci.energy_score} / 10` : '—',
      tone: energyTone(ci.energy_score),
    },
    {
      iconSvg: CI_ICONS.sleep,
      label: 'Sleep',
      value: ci.sleep_hrs != null ? `${ci.sleep_hrs} / 10` : '—',
      tone: sleepTone(ci.sleep_hrs),
    },
    {
      iconSvg: CI_ICONS.weight,
      label: 'Weight',
      value: ci.weight_lbs != null ? `${ci.weight_lbs} lbs` : '—',
    },
    {
      iconSvg: CI_ICONS.adherence,
      label: 'Adherence',
      value: '—',
    },
  ]

  const negative =
    (ci.energy_score != null && ci.energy_score < 5)
    || (ci.sleep_hrs != null && ci.sleep_hrs < 5)

  return {
    id: ci.id!,
    week: weekNum,
    submittedLabel: ci.submitted_at ? fmtDateTime(ci.submitted_at) : '',
    unread: !ci.is_read,
    negative,
    metrics,
    notePreview: ci.notes
      ? `"${ci.notes.slice(0, 140)}${ci.notes.length > 140 ? '…' : ''}"`
      : 'No notes submitted this week.',
    reply: ci.coach_response
      ? {
          initials: coachInitials,
          label: ci.responded_at ? `Responded · ${fmtDate(ci.responded_at)}` : 'Responded',
          text: `"${ci.coach_response}"`,
        }
      : undefined,
  }
}

export function toRecentCheckIn(ci: ModelsCoachCheckIn, weekNum: number): RecentCheckIn {
  const pills = []
  if (ci.sleep_hrs != null) pills.push({ iconSvg: PILL_ICONS.sleep, label: `Sleep: ${ci.sleep_hrs}/10` })
  if (ci.weight_lbs != null) pills.push({ iconSvg: PILL_ICONS.weight, label: `Weight: ${ci.weight_lbs} lbs` })

  return {
    week: weekNum,
    submittedLabel: ci.submitted_at ? `Submitted ${fmtRelative(ci.submitted_at)}` : '',
    energy: ci.energy_score ?? 0,
    quote: ci.notes
      ? `"${ci.notes.slice(0, 200)}${ci.notes.length > 200 ? '…' : ''}"`
      : 'No notes submitted this week.',
    pills,
  }
}

export function toQuickInfoRows(c: ModelsClient): InfoRow[] {
  const rows: InfoRow[] = []
  if (c.goal) rows.push({ label: 'Primary Goal', value: c.goal })
  if (c.goal_sub) rows.push({ label: 'Goal Details', value: c.goal_sub })
  if (c.plan_name) rows.push({ label: 'Plan', value: c.plan_name })
  if (c.phone) rows.push({ label: 'Phone', value: c.phone })
  if (c.email) rows.push({ label: 'Email', value: c.email })
  if (c.start_date) rows.push({ label: 'Start Date', value: fmtStartDate(c.start_date) })
  return rows
}

export function toMetricTiles(
  checkIns: ModelsCoachCheckIn[],
  streakWeeks?: number,
): MetricTile[] {
  const sorted = [...checkIns].sort((a, b) =>
    (a.week_start_date ?? '').localeCompare(b.week_start_date ?? ''),
  )

  const withWeight = sorted.filter(ci => ci.weight_lbs != null)
  const latestWeight = withWeight.at(-1)?.weight_lbs
  const firstWeight = withWeight.at(0)?.weight_lbs
  const weightChange = latestWeight != null && firstWeight != null ? latestWeight - firstWeight : null

  const energyScores = checkIns.map(ci => ci.energy_score).filter((s): s is number => s != null)
  const avgEnergy = energyScores.length
    ? energyScores.reduce((a, b) => a + b, 0) / energyScores.length
    : null

  return [
    {
      label: 'Current Weight',
      value: latestWeight != null ? String(latestWeight) : '—',
      unit: latestWeight != null ? 'lbs' : '',
      change: weightChange != null
        ? `${weightChange < 0 ? '↓' : '↑'} ${Math.abs(weightChange).toFixed(1)} lbs since start`
        : 'No weight data yet',
      changeTone: (weightChange ?? 0) < 0 ? 'down' : (weightChange ?? 0) > 0 ? 'up' : 'flat',
    },
    {
      label: 'Avg Energy',
      value: avgEnergy != null ? avgEnergy.toFixed(1) : '—',
      unit: avgEnergy != null ? '/10' : '',
      change: energyScores.length ? `Based on ${energyScores.length} check-ins` : 'No data yet',
      changeTone: 'flat',
    },
    {
      label: 'Check-in Streak',
      value: streakWeeks ? `${streakWeeks} 🔥` : '0',
      change: 'weeks in a row',
      changeTone: 'flat',
      valueClass: 'text-lg!',
    },
  ]
}
