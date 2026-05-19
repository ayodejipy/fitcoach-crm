<script setup lang="ts">
import { computed } from 'vue'

type StatVariant = 'green' | 'orange' | 'red' | 'blue'
type ChangeVariant = 'positive' | 'negative' | 'info'
type TStatCard = {
  label: string
  value: string
  change: string
  variant?: StatVariant
  changeVariant?: ChangeVariant
}

const { label, value, change, variant = 'green', changeVariant = 'positive' } = defineProps<TStatCard>()

const accentBgClass = computed(() => ({
  green: 'bg-primary',
  orange: 'bg-[#E67E22]',
  red: 'bg-[#E74C3C]',
  blue: 'bg-[#3498DB]',
})[variant])

const iconBgClass = computed(() => ({
  green: 'bg-[#F0F9F4] dark:bg-primary/15',
  orange: 'bg-[#FEF3EA] dark:bg-[#E67E22]/15',
  red: 'bg-[#FEECEC] dark:bg-[#E74C3C]/15',
  blue: 'bg-[#EBF5FB] dark:bg-[#3498DB]/15',
})[variant])

const changeClass = computed(() => ({
  positive: 'text-primary dark:text-(--green-light)',
  negative: 'text-[#E74C3C]',
  info: 'text-[#3498DB]',
})[changeVariant])

</script>

<template>
  <div class="relative overflow-hidden bg-(--bg-surface) rounded-xl py-[22px] px-6 border border-(--border)">
    <!-- Left accent bar -->
    <div class="absolute top-0 left-0 w-1 h-full rounded-l" :class="accentBgClass"></div>

    <div class="text-xs font-semibold uppercase tracking-[0.6px] text-(--text-muted) mb-2.5">{{ label }}</div>
    <div class="text-[36px] font-extrabold text-(--text-primary) tracking-[-1px] leading-none">{{ value }}</div>
    <div class="text-xs font-semibold mt-2 flex items-center gap-1" :class="changeClass">{{ change }}</div>

    <!-- Icon well -->
    <div class="absolute top-5 right-5 w-10 h-10 rounded-lg flex items-center justify-center" :class="iconBgClass">
      <slot name="icon" />
    </div>
  </div>
</template>
