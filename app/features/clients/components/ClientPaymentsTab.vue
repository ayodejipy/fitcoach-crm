<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import type { ModelsCoachPayment } from '~/services'
import { formatMoney, derivedStatus, invoiceNumber, daysFromDue, type DerivedStatus } from '~/features/payments/utils/format'

const props = defineProps<{
  payments: ModelsCoachPayment[]
  pending: boolean
  clientName: string
  planName?: string
  planPriceCents?: number
}>()

defineEmits<{
  newInvoice: []
}>()

const sorted = computed(() =>
  [...props.payments].sort((a, b) => {
    const aDate = a.created_at ? parseISO(a.created_at).getTime() : 0
    const bDate = b.created_at ? parseISO(b.created_at).getTime() : 0
    return bDate - aDate
  }),
)

const totals = computed(() => {
  let paidCents = 0
  let outstandingCents = 0
  let overdueCount = 0
  for (const payment of props.payments) {
    const status = derivedStatus(payment)
    if (status === 'paid') paidCents += payment.amount_cents ?? 0
    if (status === 'sent' || status === 'overdue' || status === 'due-soon') {
      outstandingCents += payment.amount_cents ?? 0
    }
    if (status === 'overdue') overdueCount++
  }
  return { paidCents, outstandingCents, overdueCount }
})

const statusMeta: Record<DerivedStatus, { color: 'success' | 'warning' | 'error' | 'neutral' | 'info', label: string }> = {
  'paid':     { color: 'success', label: 'Paid' },
  'overdue':  { color: 'error',   label: 'Overdue' },
  'due-soon': { color: 'warning', label: 'Due soon' },
  'sent':     { color: 'info',    label: 'Sent' },
  'draft':    { color: 'neutral', label: 'Draft' },
  'failed':   { color: 'error',   label: 'Failed' },
}

function statusFor(payment: ModelsCoachPayment) {
  return statusMeta[derivedStatus(payment)]
}

function dueLabel(payment: ModelsCoachPayment): string {
  const status = derivedStatus(payment)
  if (status === 'paid' && payment.paid_at) return `Paid ${format(parseISO(payment.paid_at), 'MMM d')}`
  if (!payment.due_date) return '—'
  const days = daysFromDue(payment)
  if (status === 'overdue') return `Overdue · ${days}d`
  if (status === 'due-soon') return `Due in ${Math.abs(days)}d`
  return format(parseISO(payment.due_date.includes('T') ? payment.due_date : `${payment.due_date}T00:00:00`), 'MMM d')
}
</script>

<template>
  <div class="space-y-5">
    <USkeleton v-if="pending" class="h-[120px] rounded-[10px]" />

    <template v-else>
      <dl class="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-4">
          <dt class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Lifetime paid</dt>
          <dd class="mt-1 text-[20px] font-semibold tabular-nums text-(--text-primary)">{{ formatMoney(totals.paidCents) }}</dd>
        </div>
        <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-4">
          <dt class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Outstanding</dt>
          <dd class="mt-1 text-[20px] font-semibold tabular-nums text-(--text-primary)">{{ formatMoney(totals.outstandingCents) }}</dd>
          <p v-if="totals.overdueCount" class="mt-0.5 text-[11px] text-(--red)">{{ totals.overdueCount }} overdue</p>
        </div>
        <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-4">
          <dt class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Current plan</dt>
          <dd class="mt-1 text-[13.5px] font-semibold text-(--text-primary) truncate">{{ planName || 'No plan' }}</dd>
          <p v-if="planPriceCents" class="mt-0.5 text-[11.5px] text-(--text-muted) tabular-nums">{{ formatMoney(planPriceCents) }} / mo</p>
        </div>
      </dl>

      <section aria-labelledby="invoices-heading">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 id="invoices-heading" class="text-[12px] font-semibold uppercase tracking-wide text-(--text-muted)">
            Invoices · {{ sorted.length }}
          </h2>
          <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-plus" @click="$emit('newInvoice')">
            New invoice
          </UButton>
        </div>

        <div
          v-if="!sorted.length"
          class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-10 text-center"
        >
          <UIcon name="i-lucide-receipt" class="size-7 text-(--text-muted) mb-2 inline-block" />
          <p class="text-[13.5px] font-medium text-(--text-secondary)">No invoices yet</p>
          <p class="mt-1 text-[12px] text-(--text-muted)">Create a first invoice for {{ clientName }} to get started.</p>
        </div>

        <div v-else class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden">
          <table class="w-full text-left">
            <thead class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) bg-(--bg-subtle)">
              <tr>
                <th scope="col" class="px-4 py-2.5">Invoice</th>
                <th scope="col" class="px-4 py-2.5">Amount</th>
                <th scope="col" class="px-4 py-2.5">Due / Paid</th>
                <th scope="col" class="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-(--border-muted) text-[12.5px]">
              <tr v-for="payment in sorted" :key="payment.id">
                <td class="px-4 py-3">
                  <div class="font-mono text-[11.5px] font-semibold text-(--text-primary)">{{ invoiceNumber(payment) }}</div>
                  <div v-if="payment.description" class="text-[10.5px] text-(--text-muted) truncate max-w-[200px]">{{ payment.description }}</div>
                </td>
                <td class="px-4 py-3 tabular-nums font-semibold text-(--text-primary)">{{ formatMoney(payment.amount_cents) }}</td>
                <td class="px-4 py-3 tabular-nums text-(--text-secondary)">{{ dueLabel(payment) }}</td>
                <td class="px-4 py-3">
                  <UBadge :label="statusFor(payment).label" :color="statusFor(payment).color" variant="soft" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
