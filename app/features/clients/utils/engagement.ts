import { differenceInDays, parseISO, parse } from 'date-fns'
import type { ModelsClient } from '~/services'

export type EngagementState = 'needs-attention' | 'active' | 'quiet'

// Buckets a client into the three engagement states used by the clients list view.
//
// Why these thresholds:
// - 7 days = roughly one missed weekly check-in cycle. Triggers "needs attention" so
//   coaches see it before the relationship goes cold.
// - 14 days = two missed cycles. At that point the client has effectively gone quiet;
//   different action posture (re-engage / consider pausing) so we surface them separately.
// - status='paused' or 'ended' is always quiet regardless of last_check_in (admin
//   override beats temporal signal).
export function computeEngagement(client: ModelsClient): EngagementState {
  const status = client.status ?? 'active'
  if (status === 'paused' || status === 'ended') return 'quiet'

  if (!client.last_check_in) return 'needs-attention'

  const days = differenceInDays(new Date(), parseISO(client.last_check_in))
  if (days > 14) return 'quiet'
  if (days > 7) return 'needs-attention'
  return 'active'
}

export type EngagementReasonTone = 'error' | 'warning' | 'info' | 'success' | 'muted'

export interface EngagementReason {
  text: string
  tone: EngagementReasonTone
  icon: string
}

// Produces the inline reason chip text for a client in the list. Pulls signal from
// status + last_check_in + start_date so the row tells you WHY the client is in
// this bucket without making the coach click in.
export function engagementReason(client: ModelsClient): EngagementReason {
  const status = client.status ?? 'active'
  const now = new Date()

  if (status === 'paused') {
    return { text: 'On pause', tone: 'muted', icon: 'i-lucide-pause-circle' }
  }
  if (status === 'ended') {
    return { text: 'Program ended', tone: 'muted', icon: 'i-lucide-flag' }
  }

  if (!client.last_check_in) {
    // A recent start_date (≤14 days) means the client is still onboarding —
    // softer info tone, not the red "you're failing them" tone. Status flag is
    // a separate concept ('new' = trial), so this branch fires regardless of it.
    if (client.start_date) {
      const joined = parse(client.start_date, 'yyyy-MM-dd', new Date())
      const daysSinceJoin = differenceInDays(now, joined)
      if (daysSinceJoin <= 14) {
        return {
          text: `Joined ${formatJoinedShort(joined)} · never checked in`,
          tone: 'info',
          icon: 'i-lucide-sun',
        }
      }
    }
    return { text: 'Never checked in', tone: 'error', icon: 'i-lucide-circle-alert' }
  }

  const days = differenceInDays(now, parseISO(client.last_check_in))
  if (days > 14) {
    return { text: `Inactive · ${days}d`, tone: 'muted', icon: 'i-lucide-moon' }
  }
  if (days > 7) {
    return { text: `Check-in overdue · ${days} days`, tone: 'error', icon: 'i-lucide-clock' }
  }

  const streak = client.streak_weeks ?? 0
  if (streak >= 2) {
    return { text: `${streak}-week streak`, tone: 'success', icon: 'i-lucide-flame' }
  }
  return { text: `Checked in ${days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days}d ago`}`, tone: 'success', icon: 'i-lucide-check-circle-2' }
}

function formatJoinedShort(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' })
}

// What the primary inline action button should say for this client. Helps the coach
// see the right next-action at a glance.
export function primaryActionLabel(client: ModelsClient, engagement: EngagementState): string {
  const status = client.status ?? 'active'
  if (status === 'paused') return 'Reactivate'
  if (status === 'ended') return 'Open profile'
  if (status === 'new' && !client.last_check_in) return 'Send welcome'
  if (engagement === 'needs-attention') return 'Nudge'
  return 'Open profile'
}

// Group label + tone metadata for the section headers.
export interface EngagementGroupMeta {
  id: EngagementState
  label: string
  dot: string
  description: string
  emptyHint: string
}

export const ENGAGEMENT_GROUPS: EngagementGroupMeta[] = [
  {
    id: 'needs-attention',
    label: 'Needs attention',
    dot: 'bg-(--red)',
    description: 'Overdue check-ins or never engaged',
    emptyHint: 'Nothing needs your attention right now.',
  },
  {
    id: 'active',
    label: 'Active & on track',
    dot: 'bg-(--green-brand)',
    description: 'Logged a check-in this week',
    emptyHint: 'No active clients yet — encourage check-ins.',
  },
  {
    id: 'quiet',
    label: 'Quiet',
    dot: 'bg-(--text-muted)',
    description: 'Paused or inactive 14+ days',
    emptyHint: 'No quiet clients.',
  },
]
