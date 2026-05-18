<template>
  <tr
    class="inv-row transition-colors duration-100 cursor-pointer border-b border-[#F0F4F1] dark:border-white/5 last:border-b-0"
    :class="rowClass"
  >
    <td class="py-[13px] px-4 align-middle">
      <span class="font-semibold text-primary dark:text-(--green-light) text-[13px] tabular-nums">{{ invoice.number }}</span>
    </td>

    <td class="py-[13px] px-4 align-middle">
      <div class="flex items-center gap-2.5">
        <Avatar :initials="invoice.initials" :variant="invoice.variant" :size="26" />
        <span class="text-[13.5px] font-semibold text-(--text-primary)">{{ invoice.name }}</span>
      </div>
    </td>

    <td class="py-[13px] px-4 align-middle text-[13px] text-[#4B5563] dark:text-(--text-secondary)">{{ invoice.description }}</td>

    <td class="py-[13px] px-4 align-middle">
      <span class="text-[13.5px] font-bold tabular-nums" :class="invoice.status === 'overdue' ? 'text-(--red)' : 'text-(--text-primary)'">{{ invoice.amount }}</span>
    </td>

    <td class="py-[13px] px-4 align-middle text-[13px] tabular-nums text-[#4B5563] dark:text-(--text-secondary)">{{ invoice.sentDate }}</td>

    <td class="py-[13px] px-4 align-middle text-[13px] tabular-nums" :class="invoice.status === 'overdue' ? 'text-(--red)' : 'text-[#4B5563] dark:text-(--text-secondary)'">{{ invoice.dueDate }}</td>

    <td class="py-[13px] px-4 align-middle">
      <PaymentStatusBadge :status="invoice.status" />
    </td>

    <td class="py-[13px] px-4 align-middle">
      <div class="flex items-center gap-1.5">
        <button type="button" class="act-btn">View</button>
        <ClientActionsMenu :items="invoice.menuActions" />
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Avatar from '~/components/Avatar.vue'
import PaymentStatusBadge, { type PaymentStatus } from './PaymentStatusBadge.vue'
import ClientActionsMenu, { type ActionItem } from '~/features/clients/components/ClientActionsMenu.vue'

export interface Invoice {
  id: string
  number: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  description: string
  amount: string
  sentDate: string
  dueDate: string
  status: Exclude<PaymentStatus, 'active' | 'cancelling'>
  menuActions: ActionItem[]
}

const props = defineProps<{
  invoice: Invoice
}>()

const rowClass = computed(() => {
  if (props.invoice.status === 'overdue') return 'bg-[#FFF8F8] hover:bg-[#FFF3F3] dark:bg-[#EF4444]/10 dark:hover:bg-[#EF4444]/15'
  return 'hover:bg-[#F0F9F4] dark:hover:bg-(--bg-primary-soft)'
})
</script>

<style scoped>
.act-btn {
  padding: 5px 11px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-secondary);
  transition: background .12s, border-color .12s, color .12s;
}
.act-btn:hover {
  background: #F0F9F4;
  border-color: var(--green-brand);
  color: var(--green-brand);
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .act-btn:hover {
  background: var(--bg-primary-soft);
  border-color: var(--green-light);
  color: var(--green-light);
}
</style>
