<template>
  <tr
    class="sub-row transition-colors duration-100 cursor-pointer border-b border-[#F0F4F1] dark:border-white/5 last:border-b-0"
    :class="rowClass"
  >
    <td class="py-[13px] px-4 align-middle">
      <div class="flex items-center gap-2.5">
        <Avatar :initials="subscription.initials" :variant="subscription.variant" :size="32" />
        <div>
          <div class="text-[13.5px] font-semibold text-(--text-primary)">{{ subscription.name }}</div>
          <div class="text-[11.5px] text-(--text-muted) mt-px">{{ subscription.email }}</div>
        </div>
      </div>
    </td>

    <td class="py-[13px] px-4 align-middle">
      <PlanPill>{{ subscription.plan }}</PlanPill>
    </td>

    <td class="py-[13px] px-4 align-middle">
      <span class="text-[13.5px] font-bold tabular-nums" :class="subscription.status === 'overdue' ? 'text-(--red)' : 'text-(--text-primary)'">{{ subscription.amount }}</span>
      <div v-if="subscription.lateNote" class="text-[11px] font-semibold text-(--red) mt-0.5">⚠ {{ subscription.lateNote }}</div>
    </td>

    <td class="py-[13px] px-4 align-middle text-[13px] tabular-nums" :class="subscription.status === 'overdue' ? 'text-(--red)' : 'text-[#4B5563] dark:text-(--text-secondary)'">
      {{ subscription.nextBilling }}
    </td>

    <td class="py-[13px] px-4 align-middle">
      <PaymentStatusBadge :status="subscription.status" />
    </td>

    <td class="py-[13px] px-4 align-middle">
      <div class="flex items-center gap-1.5">
        <button type="button" class="act-btn">View</button>
        <ClientActionsMenu :items="subscription.menuActions" />
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Avatar from '~/components/Avatar.vue'
import PlanPill from './PlanPill.vue'
import PaymentStatusBadge, { type PaymentStatus } from './PaymentStatusBadge.vue'
import ClientActionsMenu, { type ActionItem } from '~/features/clients/components/ClientActionsMenu.vue'

export interface Subscription {
  id: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  email: string
  plan: string
  amount: string
  nextBilling: string
  status: PaymentStatus
  lateNote?: string
  menuActions: ActionItem[]
}

const props = defineProps<{
  subscription: Subscription
}>()

const rowClass = computed(() => {
  if (props.subscription.status === 'overdue') return 'bg-[#FFF8F8] hover:bg-[#FFF3F3] dark:bg-[#EF4444]/10 dark:hover:bg-[#EF4444]/15'
  if (props.subscription.status === 'cancelling') return 'bg-[#FFFBF5] hover:bg-[#FFF7EE] dark:bg-[#EA580C]/10 dark:hover:bg-[#EA580C]/15'
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
