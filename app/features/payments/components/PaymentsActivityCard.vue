<script setup lang="ts">
import { fmtRelative } from '~/utils/format'
import { formatMoney, invoiceNumber } from '../utils/format'
import type { ModelsCoachPayment } from '~/services'

export interface ActivityItem {
  payment: ModelsCoachPayment
  clientName: string
  kind: 'paid' | 'sent' | 'failed'
  at: string
}

defineProps<{
  items: ActivityItem[]
}>()

function iconFor(kind: ActivityItem['kind']): string {
  if (kind === 'paid') return 'i-lucide-check'
  if (kind === 'sent') return 'i-lucide-send'
  return 'i-lucide-circle-alert'
}

function iconBgFor(kind: ActivityItem['kind']): string {
  if (kind === 'paid') return 'bg-(--green-soft) text-(--green-brand)'
  if (kind === 'sent') return 'bg-(--info-soft) text-(--info)'
  return 'bg-(--error-soft) text-(--red)'
}

function methodLabel(payment: ModelsCoachPayment): string {
  const type = payment.payment_type
  if (type === 'subscription') return 'subscription'
  if (type === 'invoice') return 'invoice'
  return type ?? 'payment'
}
</script>

<template>
  <section
    aria-labelledby="payments-activity-heading"
    class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden"
  >
    <header class="flex items-center justify-between border-b border-(--border) px-5 py-3">
      <div>
        <h3 id="payments-activity-heading" class="text-[13px] font-semibold text-(--text-primary)">
          Recent activity
        </h3>
        <p class="mt-0.5 text-[11px] text-(--text-muted)">Last 7 days</p>
      </div>
      <NuxtLink
        to="/payments/invoices"
        class="text-[11.5px] text-(--text-muted) hover:text-(--text-primary) no-underline"
      >
        All →
      </NuxtLink>
    </header>

    <div v-if="items.length === 0" class="px-5 py-8 text-center text-[12.5px] text-(--text-muted)">
      No activity in the last 7 days.
    </div>

    <div v-else class="px-5 py-2">
      <div
        v-for="(item, idx) in items"
        :key="item.payment.id ?? idx"
        class="flex items-start gap-3 py-2.5"
        :class="idx < items.length - 1 ? 'border-b border-(--border-muted)' : ''"
      >
        <span
          aria-hidden="true"
          class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          :class="iconBgFor(item.kind)"
        >
          <UIcon :name="iconFor(item.kind)" class="size-3" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="text-[12px]">
              <template v-if="item.kind === 'paid'">
                <span class="font-medium">{{ item.clientName }}</span> paid {{ formatMoney(item.payment.amount_cents) }}
              </template>
              <template v-else-if="item.kind === 'sent'">
                Invoice sent to <span class="font-medium">{{ item.clientName }}</span>
              </template>
              <template v-else>
                Payment failed for <span class="font-medium">{{ item.clientName }}</span>
              </template>
            </span>
            <span class="text-[10.5px] text-(--text-muted) tabular-nums">{{ fmtRelative(item.at) }}</span>
          </div>
          <div class="text-[10.5px] text-(--text-muted) tabular-nums mt-0.5">
            {{ invoiceNumber(item.payment) }} · {{ methodLabel(item.payment) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
