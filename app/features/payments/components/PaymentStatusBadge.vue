<template>
  <span
    class="inline-flex items-center gap-1.5 py-[3px] px-[9px] rounded-[20px] text-[11.5px] font-semibold whitespace-nowrap"
    :class="wrapClass"
  >
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="dotClass"></span>
    {{ label || defaultLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type PaymentStatus = 'active' | 'overdue' | 'cancelling' | 'paid' | 'pending'

const props = defineProps<{
  status: PaymentStatus
  label?: string
}>()

const wrapClass = computed(() => ({
  active:     'bg-(--green-pale) text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)',
  paid:       'bg-(--green-pale) text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)',
  overdue:    'bg-[#FEE2E2] text-(--red) dark:bg-(--red)/15',
  cancelling: 'bg-[#FFF1E6] text-[#EA580C] dark:bg-[#EA580C]/15 dark:text-[#FB923C]',
  pending:    'bg-[#EFF6FF] text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#60A5FA]',
}[props.status]))

const dotClass = computed(() => ({
  active:     'bg-primary dark:bg-(--green-light)',
  paid:       'bg-primary dark:bg-(--green-light)',
  overdue:    'bg-(--red)',
  cancelling: 'bg-[#EA580C] dark:bg-[#FB923C]',
  pending:    'bg-[#2563EB] dark:bg-[#60A5FA]',
}[props.status]))

const defaultLabel = computed(() => ({
  active: 'Active', overdue: 'Overdue', cancelling: 'Cancelling', paid: 'Paid', pending: 'Pending',
}[props.status]))
</script>
