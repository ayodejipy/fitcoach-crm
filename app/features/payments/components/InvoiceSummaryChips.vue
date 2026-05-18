<template>
  <div class="flex gap-3 mb-3.5 flex-wrap">
    <div
      v-for="c in chips"
      :key="c.label"
      class="inline-flex items-center gap-[7px] py-[7px] px-3.5 bg-(--bg-surface) rounded-lg border border-(--border) text-[13px] font-semibold text-[#374141] dark:text-(--text-secondary)"
    >
      {{ c.label }}
      <span class="font-extrabold" :class="valueClass(c.tone)">{{ c.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface SummaryChip {
  label: string
  value: string
  tone: 'green' | 'amber' | 'red'
}

defineProps<{
  chips: SummaryChip[]
}>()

const valueClass = (t: SummaryChip['tone']) => ({
  green: 'text-primary dark:text-(--green-light)',
  amber: 'text-[#D97706] dark:text-[#F59E0B]',
  red:   'text-(--red)',
}[t])
</script>
