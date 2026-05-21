<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

type PayStatus = 'paid' | 'pending' | 'failed'
type TPayment = {
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  description: string
  amount: string
  date: string
  status: PayStatus
}

const { payments } = defineProps<{
  payments: TPayment[]
}>()

const statusClass = (s: PayStatus) => ({
  paid: 'bg-(--green-pale) text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)',
  pending: 'bg-[#FEF3EA] text-[#E67E22] dark:bg-[#E67E22]/15',
  failed: 'bg-[#FEECEC] text-[#E74C3C] dark:bg-[#E74C3C]/15',
}[s])

const statusLabel = (s: PayStatus) => ({ paid: 'Paid', pending: 'Pending', failed: 'Failed' }[s])
</script>

<template>
  <div class="bg-(--bg-surface) rounded-xl border border-(--border) overflow-hidden">
    <header class="flex items-center justify-between py-[18px] px-[22px] pb-3.5 border-b border-[#F0F4F1] dark:border-white/5">
      <span class="text-[15px] font-bold text-(--text-primary)">Recent Payments</span>
      <a href="#" class="text-xs font-semibold text-primary dark:text-(--green-light) cursor-pointer no-underline">Payments →</a>
    </header>
    <div v-if="payments.length">
      <div
        v-for="(p, i) in payments"
        :key="p.name + p.date"
        class="flex items-center gap-3 py-3 px-[22px] transition-colors duration-100 hover:bg-[#F9FBF9] dark:hover:bg-white/3"
        :class="i < payments.length - 1 ? 'border-b border-[#F0F4F1] dark:border-white/5' : ''"
      >
        <Avatar :initials="p.initials" :variant="p.variant" :size="32" />
        <div class="flex-1">
          <div class="text-[13px] font-semibold text-(--text-primary)">{{ p.name }}</div>
          <div class="text-xs text-(--text-muted) mt-0.5">{{ p.description }}</div>
        </div>
        <div class="text-right">
          <div class="text-[15px] font-bold text-(--text-primary)">${{ p.amount }}</div>
          <div class="text-[11px] text-[#95A5A6] mt-0.5">{{ p.date }}</div>
        </div>
        <span
          class="ml-2 text-[11px] font-semibold py-[3px] px-2.5 rounded-[20px]"
          :class="statusClass(p.status)"
        >{{ statusLabel(p.status) }}</span>
      </div>
    </div>
    <EmptyState
      v-else
      icon="i-lucide-credit-card"
      headline="No payments yet"
      hint="Payments from your clients will appear here once recorded."
    />
  </div>
</template>
