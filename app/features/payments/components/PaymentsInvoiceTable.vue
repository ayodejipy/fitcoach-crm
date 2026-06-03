<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import type { AvatarVariant } from '~/utils/client'
import { derivedStatus, daysFromDue, formatMoney, invoiceNumber, fmtShortDate, type DerivedStatus } from '../utils/format'
import type { ModelsCoachPayment } from '~/services'

export interface InvoiceRowData {
  payment: ModelsCoachPayment
  clientName: string
  initials: string
  variant: AvatarVariant
}

defineProps<{
  rows: InvoiceRowData[]
  compact?: boolean
}>()

defineEmits<{
  open: [id: string]
}>()

const statusBadge = (status: DerivedStatus): { label: string, dot: string, text: string, bg: string } => ({
  'paid':     { label: 'Paid',    dot: 'bg-(--green-brand)', text: 'text-(--green-brand)', bg: 'bg-(--green-soft)' },
  'overdue':  { label: 'Overdue', dot: 'bg-(--red)',         text: 'text-(--red)',         bg: 'bg-(--error-soft)' },
  'due-soon': { label: 'Sent',    dot: 'bg-(--warning)',     text: 'text-(--warning)',     bg: 'bg-(--warning-soft)' },
  'sent':     { label: 'Sent',    dot: 'bg-(--info)',        text: 'text-(--info)',        bg: 'bg-(--info-soft)' },
  'draft':    { label: 'Draft',   dot: 'bg-(--text-muted)',  text: 'text-(--text-muted)',  bg: 'bg-(--bg-subtle)' },
  'failed':   { label: 'Failed',  dot: 'bg-(--red)',         text: 'text-(--red)',         bg: 'bg-(--error-soft)' },
}[status])

function methodSuffix(payment: ModelsCoachPayment, status: DerivedStatus): string {
  if (status !== 'paid') return ''
  return payment.payment_type === 'subscription' ? '· auto' : ''
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-[12.5px]">
      <thead v-if="!compact">
        <tr class="border-b border-(--border) bg-(--bg-subtle) text-[10.5px] font-medium uppercase tracking-wide text-(--text-muted)">
          <th scope="col" class="text-left px-5 py-2.5 font-medium">Invoice</th>
          <th scope="col" class="text-left px-5 py-2.5 font-medium">Client</th>
          <th scope="col" class="text-right px-5 py-2.5 font-medium">Amount</th>
          <th scope="col" class="text-left px-5 py-2.5 font-medium">Issued</th>
          <th scope="col" class="text-left px-5 py-2.5 font-medium">Due</th>
          <th scope="col" class="text-left px-5 py-2.5 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, idx) in rows"
          :key="row.payment.id ?? idx"
          class="hover:bg-(--bg-subtle) cursor-pointer"
          :class="idx < rows.length - 1 ? 'border-b border-(--border-muted)' : ''"
          @click="$emit('open', row.payment.id ?? '')"
        >
          <td class="px-5 py-2.5 font-mono text-[11.5px] text-(--text-secondary)">{{ invoiceNumber(row.payment) }}</td>
          <td class="px-5 py-2.5">
            <div class="flex items-center gap-2.5">
              <Avatar :initials="row.initials" :variant="row.variant" :size="22" />
              <span class="font-medium text-(--text-primary)">{{ row.clientName }}</span>
            </div>
          </td>
          <td class="px-5 py-2.5 text-right tabular-nums font-semibold text-(--text-primary)">
            {{ formatMoney(row.payment.amount_cents) }}
          </td>
          <td v-if="!compact" class="px-5 py-2.5 tabular-nums text-(--text-secondary)">
            {{ fmtShortDate(row.payment.sent_at || row.payment.created_at) }}
          </td>
          <td class="px-5 py-2.5 tabular-nums text-[11px]">
            <template v-if="derivedStatus(row.payment) === 'paid'">
              <span class="text-(--text-muted)">Paid {{ fmtShortDate(row.payment.paid_at) }}</span>
            </template>
            <template v-else-if="derivedStatus(row.payment) === 'overdue'">
              <span class="text-(--red)">{{ fmtShortDate(row.payment.due_date) }} · {{ daysFromDue(row.payment) }}d overdue</span>
            </template>
            <template v-else>
              <span class="text-(--text-secondary)">{{ fmtShortDate(row.payment.due_date) }}</span>
            </template>
          </td>
          <td class="px-5 py-2.5">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
              :class="[statusBadge(derivedStatus(row.payment)).bg, statusBadge(derivedStatus(row.payment)).text]"
            >
              <span
                aria-hidden="true"
                class="h-1.5 w-1.5 rounded-full"
                :class="statusBadge(derivedStatus(row.payment)).dot"
              />
              {{ statusBadge(derivedStatus(row.payment)).label }} {{ methodSuffix(row.payment, derivedStatus(row.payment)) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length === 0" class="px-5 py-8 text-center text-[12.5px] text-(--text-muted)">
      No invoices match.
    </div>
  </div>
</template>
