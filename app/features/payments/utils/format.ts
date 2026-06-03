import { format, parseISO, differenceInDays } from 'date-fns'
import type { ModelsCoachPayment } from '~/services'

// Currency formatting. Uses NGN (₦) for now since the v1 user base is
// Nigeria-first; coach currency preference is a future enhancement that
// would replace this constant.
const CURRENCY_SYMBOL = '₦'

export function formatMoney(cents?: number): string {
  if (!cents) return `${CURRENCY_SYMBOL}0`
  const amount = (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })
  return `${CURRENCY_SYMBOL}${amount}`
}

export function moneyParts(cents?: number): { symbol: string, amount: string } {
  const value = !cents ? 0 : cents / 100
  return {
    symbol: CURRENCY_SYMBOL,
    amount: value.toLocaleString('en-US', { maximumFractionDigits: 0 }),
  }
}

export function invoiceNumber(payment: ModelsCoachPayment): string {
  if (payment.invoice_number) return `INV-${payment.invoice_number}`
  if (payment.id) return `INV-${payment.id.slice(0, 8).toUpperCase()}`
  return 'INV-?'
}

export type DerivedStatus = 'paid' | 'overdue' | 'due-soon' | 'sent' | 'draft' | 'failed'

// Derives the user-facing status from the raw payment record. The DB only
// stores 'paid' / 'pending' / 'failed' / 'draft' — "overdue" and "due-soon"
// are time-relative views we compute here so the UI can highlight them.
export function derivedStatus(payment: ModelsCoachPayment, now: Date = new Date()): DerivedStatus {
  const raw = payment.status ?? 'pending'
  if (raw === 'paid') return 'paid'
  if (raw === 'failed') return 'failed'
  if (raw === 'draft') return 'draft'
  if (!payment.due_date) return 'sent'
  const days = differenceInDays(now, parseISO(payment.due_date.includes('T') ? payment.due_date : `${payment.due_date}T00:00:00`))
  if (days > 0) return 'overdue'
  if (days >= -7) return 'due-soon'
  return 'sent'
}

export function daysFromDue(payment: ModelsCoachPayment, now: Date = new Date()): number {
  if (!payment.due_date) return 0
  const due = parseISO(payment.due_date.includes('T') ? payment.due_date : `${payment.due_date}T00:00:00`)
  return differenceInDays(now, due)
}

export function fmtShortDate(iso?: string): string {
  if (!iso) return '—'
  const d = parseISO(iso.includes('T') ? iso : `${iso}T00:00:00`)
  return format(d, 'MMM d')
}

export function fmtLongDate(iso?: string): string {
  if (!iso) return '—'
  const d = parseISO(iso.includes('T') ? iso : `${iso}T00:00:00`)
  return format(d, 'MMM d, yyyy')
}

export interface MonthBar {
  label: string
  monthKey: string
  cents: number
  height: number
  isCurrent: boolean
}

// Computes 6 monthly bars (or any range) from a payment list. Returns bars
// normalized to a 0-100 height scale; consumers can multiply to fit any
// chart height. Range default 6 months including current.
export function buildMonthBars(payments: ModelsCoachPayment[], months = 6, now: Date = new Date()): MonthBar[] {
  const buckets: MonthBar[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      label: format(d, 'MMM'),
      monthKey: format(d, 'yyyy-MM'),
      cents: 0,
      height: 0,
      isCurrent: i === 0,
    })
  }

  for (const payment of payments) {
    if (payment.status !== 'paid' || !payment.paid_at) continue
    const key = format(parseISO(payment.paid_at), 'yyyy-MM')
    const bar = buckets.find(b => b.monthKey === key)
    if (bar) bar.cents += payment.amount_cents ?? 0
  }

  const max = Math.max(...buckets.map(b => b.cents), 1)
  for (const bar of buckets) {
    bar.height = Math.round((bar.cents / max) * 100)
  }
  return buckets
}
