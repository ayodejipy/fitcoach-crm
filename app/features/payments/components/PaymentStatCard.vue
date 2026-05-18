<template>
  <div class="relative overflow-hidden bg-(--bg-surface) rounded-[14px] border border-(--border) py-[22px] px-6 flex flex-col gap-1.5">
    <div class="absolute top-0 left-0 right-0 h-[3px]" :class="accentClass"></div>

    <div class="text-xs font-semibold uppercase tracking-[0.5px] text-(--text-muted)">{{ label }}</div>
    <div class="text-[30px] font-extrabold tracking-[-1px] leading-none" :class="valueClass">{{ value }}</div>
    <div class="text-[12.5px] text-(--text-muted) font-medium mt-0.5">{{ sub }}</div>

    <div class="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-[12px] flex items-center justify-center" :class="iconBgClass">
      <slot name="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: string
  sub: string
  variant?: 'green' | 'amber'
}>(), {
  variant: 'green',
})

const accentClass = computed(() => ({
  green: 'bg-primary dark:bg-(--green-light)',
  amber: 'bg-[#D97706] dark:bg-[#F59E0B]',
})[props.variant])

const valueClass = computed(() => ({
  green: 'text-primary dark:text-(--green-light)',
  amber: 'text-[#D97706] dark:text-[#F59E0B]',
})[props.variant])

const iconBgClass = computed(() => ({
  green: 'bg-(--green-pale) dark:bg-(--bg-primary-soft)',
  amber: 'bg-[#FEF3C7] dark:bg-[#F59E0B]/15',
})[props.variant])
</script>
