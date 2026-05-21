import type { ModelsClient, ModelsCoachCheckIn } from '~/services'
import { hashVariant, clientInitials, clientName } from '~/utils/client'
import { fmtWeekOf, fmtRelative } from '~/utils/format'
import { format, parseISO } from 'date-fns'
import type { CheckInSummary } from '../components/CheckInCard.vue'
import type { CheckInMetricsData, DeltaTone } from '../components/CheckInMetrics.vue'
import type { PreviousResponse } from '../components/PreviousResponses.vue'
import type { MiniMetricTone, MiniMetricIcon } from '../components/MiniMetricBadge.vue'

export function toCard(ci: ModelsCoachCheckIn, client?: ModelsClient): CheckInSummary {
  const metrics: Array<{ label: string; tone?: MiniMetricTone; icon?: MiniMetricIcon }> = []

  if (ci.energy_score != null) {
    const s = ci.energy_score
    metrics.push({
      label: `Energy ${s}/10`,
      tone: s >= 7 ? 'good' : s >= 5 ? 'default' : s >= 3 ? 'warn' : 'alert',
      icon: 'clock',
    })
  }
  if (ci.sleep_hrs != null) {
    const h = ci.sleep_hrs
    metrics.push({
      label: `Sleep ${h}h`,
      tone: h >= 7 ? 'good' : h >= 6 ? 'default' : 'warn',
      icon: 'sleep',
    })
  }
  if (ci.weight_lbs != null) {
    metrics.push({ label: `${ci.weight_lbs} lbs`, tone: 'default', icon: 'trend' })
  }

  return {
    id: ci.id!,
    initials: clientInitials(client),
    variant: hashVariant(ci.client_id ?? ci.id ?? ''),
    name: clientName(client),
    week: `Week of ${fmtWeekOf(ci.week_start_date)}`,
    submittedLabel: `Submitted ${fmtRelative(ci.submitted_at)}`,
    unread: !ci.is_read,
    responded: !!ci.coach_response,
    preview: ci.notes ? `"${ci.notes}"` : 'No notes submitted this week.',
    metrics,
    group: ci.coach_response ? 'responded' : 'unread',
  }
}

export function toMetrics(
  ci: ModelsCoachCheckIn,
  prev?: ModelsCoachCheckIn,
  history: ModelsCoachCheckIn[] = [],
): CheckInMetricsData {
  const energyVal = ci.energy_score ?? 0
  const sleepVal = ci.sleep_hrs ? Math.min(10, Math.round(ci.sleep_hrs)) : 0
  const weightVal = ci.weight_lbs ?? 0

  let energyDelta = 'No previous data'
  let energyTone: DeltaTone = 'muted'
  if (prev?.energy_score != null) {
    const d = energyVal - prev.energy_score
    if (d > 0) { energyDelta = `Up ${d} point${d !== 1 ? 's' : ''} from last week`; energyTone = 'good' }
    else if (d < 0) { energyDelta = `Down ${Math.abs(d)} point${Math.abs(d) !== 1 ? 's' : ''} from last week`; energyTone = 'warn' }
    else { energyDelta = 'Same as last week'; energyTone = 'muted' }
  }

  let sleepDelta = 'No previous data'
  let sleepTone: DeltaTone = 'muted'
  if (prev?.sleep_hrs != null) {
    const d = (ci.sleep_hrs ?? 0) - prev.sleep_hrs
    if (d > 0.1) { sleepDelta = `Up ${d.toFixed(1)} hrs from last week`; sleepTone = 'good' }
    else if (d < -0.1) { sleepDelta = `Down ${Math.abs(d).toFixed(1)} hrs from last week`; sleepTone = 'warn' }
    else { sleepDelta = 'Same as last week'; sleepTone = 'muted' }
  }

  let weightDelta = 'No previous data'
  let weightTone: DeltaTone = 'muted'
  let weightTrend: 'up' | 'down' | 'flat' = 'flat'
  if (prev?.weight_lbs != null) {
    const d = weightVal - prev.weight_lbs
    if (d < -0.1) { weightDelta = `Down ${Math.abs(d).toFixed(1)} lbs from last week`; weightTone = 'good'; weightTrend = 'down' }
    else if (d > 0.1) { weightDelta = `Up ${d.toFixed(1)} lbs from last week`; weightTone = 'alert'; weightTrend = 'up' }
    else { weightDelta = 'No change from last week'; weightTone = 'muted' }
  }

  const weightHistory = history
    .filter(h => h.weight_lbs != null)
    .sort((a, b) => (a.week_start_date ?? '').localeCompare(b.week_start_date ?? ''))
    .map(h => h.weight_lbs!)

  return {
    energy: { value: energyVal, delta: energyDelta, deltaTone: energyTone },
    sleep: { value: sleepVal, delta: sleepDelta, deltaTone: sleepTone },
    adherence: { done: 0, total: 0, delta: 'Workout adherence not tracked via check-ins', deltaTone: 'muted' },
    weight: { value: weightVal, unit: 'lbs', trend: weightTrend, delta: weightDelta, deltaTone: weightTone, history: weightHistory },
  }
}

export function toPreviousResponse(ci: ModelsCoachCheckIn, coachInitials: string): PreviousResponse {
  const metrics: string[] = []
  if (ci.energy_score != null) metrics.push(`Energy ${ci.energy_score}/10`)
  if (ci.sleep_hrs != null) metrics.push(`Sleep ${ci.sleep_hrs}h`)
  if (ci.weight_lbs != null) metrics.push(`${ci.weight_lbs} lbs`)

  return {
    id: ci.id!,
    week: `Week of ${fmtWeekOf(ci.week_start_date)}`,
    date: ci.submitted_at
      ? format(parseISO(ci.submitted_at), 'MMM d, yyyy')
      : '',
    metrics,
    snippet: ci.notes
      ? `"${ci.notes.slice(0, 80)}${ci.notes.length > 80 ? '…' : ''}"`
      : 'No notes submitted.',
    coachInitials,
    coachVariant: hashVariant(ci.coach_id ?? ''),
    coachRespondedAt: ci.responded_at
      ? format(parseISO(ci.responded_at), 'MMM d, h:mm aa')
      : '',
    coachText: ci.coach_response ?? '',
  }
}
