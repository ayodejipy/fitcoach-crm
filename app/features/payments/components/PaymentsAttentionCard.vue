<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import type { AvatarVariant } from '~/utils/client'
import { formatMoney, fmtShortDate } from '../utils/format'
import type { ModelsCoachPayment } from '~/services'

export interface AttentionInvoice {
  payment: ModelsCoachPayment
  clientName: string
  initials: string
  variant: AvatarVariant
  status: 'overdue' | 'due-soon'
  daysFromDue: number
}

defineProps<{
  invoices: AttentionInvoice[]
}>()

defineEmits<{
  sendReminder: [id: string]
  view: [id: string]
}>()

function statusLabel(item: AttentionInvoice): string {
  if (item.status === 'overdue') {
    return `Overdue ${item.daysFromDue} ${item.daysFromDue === 1 ? 'day' : 'days'} · due ${fmtShortDate(item.payment.due_date)}`
  }
  const remaining = Math.abs(item.daysFromDue)
  return `Due ${fmtShortDate(item.payment.due_date)} · in ${remaining} ${remaining === 1 ? 'day' : 'days'}`
}

function borderColor(status: 'overdue' | 'due-soon'): string {
  return status === 'overdue' ? 'var(--red)' : 'var(--warning)'
}

function statusToneClass(status: 'overdue' | 'due-soon'): string {
  return status === 'overdue' ? 'text-(--red)' : 'text-(--warning)'
}
</script>

<template>
  <section
    aria-labelledby="payments-attention-heading"
    class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden"
  >
    <header class="flex items-center justify-between border-b border-(--border) px-5 py-3">
      <div class="flex items-center gap-2">
        <h3 id="payments-attention-heading" class="text-[13px] font-semibold text-(--text-primary)">
          Needs your attention
        </h3>
        <span
          v-if="invoices.length"
          class="rounded-full bg-(--warning) px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white"
        >
          {{ invoices.length }}
        </span>
      </div>
      <NuxtLink
        to="/payments/invoices"
        class="text-[11.5px] text-(--text-muted) hover:text-(--text-primary) no-underline"
      >
        All invoices →
      </NuxtLink>
    </header>

    <div v-if="invoices.length === 0" class="px-5 py-8 text-center text-[12.5px] text-(--text-muted)">
      Nothing overdue. You're caught up.
    </div>

    <div v-else class="p-2 space-y-1">
      <button
        v-for="item in invoices"
        :key="item.payment.id"
        type="button"
        class="w-full text-left rounded-md px-3 py-3 hover:bg-(--bg-subtle) border-l-2"
        :style="{ borderColor: borderColor(item.status) }"
        @click="$emit('view', item.payment.id ?? '')"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <Avatar :initials="item.initials" :variant="item.variant" :size="28" />
            <div class="min-w-0">
              <div class="text-[12.5px] font-semibold truncate">
                {{ item.clientName }}
                <span class="font-normal text-(--text-secondary)">
                  · {{ item.payment.description || 'Invoice' }}
                </span>
              </div>
              <div class="text-[10.5px] tabular-nums mt-0.5" :class="statusToneClass(item.status)">
                {{ statusLabel(item) }}
              </div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-[13px] font-semibold tabular-nums text-(--text-primary)">
              {{ formatMoney(item.payment.amount_cents) }}
            </div>
            <button
              v-if="item.status === 'overdue'"
              type="button"
              class="mt-1 text-[10.5px] font-medium text-(--green-brand) hover:underline"
              @click.stop="$emit('sendReminder', item.payment.id ?? '')"
            >
              Send reminder →
            </button>
            <span v-else class="mt-1 inline-block text-[10.5px] text-(--text-muted)">
              View invoice →
            </span>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
