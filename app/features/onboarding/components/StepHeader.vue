<template>
  <div class="card-header flex items-start justify-between gap-4 px-9 pt-8 pb-6 border-b border-(--border) max-[600px]:px-5 max-[600px]:pt-[22px] max-[600px]:pb-[18px]">
    <div class="card-header-left flex-1">
      <div class="step-badge inline-flex items-center gap-1.5 bg-(--green-pale) text-primary text-[11px] font-semibold px-2.5 py-1 rounded-[20px] tracking-[0.3px] uppercase mb-2.5">
        <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
        <span class="step-badge-text max-[600px]:hidden">{{ stepLabel }}</span>
        <span class="hidden max-[600px]:inline">{{ stepLabelShort }}</span>
      </div>
      <h2 class="card-title text-[22px] font-bold text-(--text-primary) tracking-[-0.4px] leading-[1.2] max-[600px]:text-lg">{{ title }}</h2>
      <p class="card-sub text-[13.5px] text-(--text-secondary) mt-1.5 leading-normal">{{ sub }}</p>
    </div>
    <div class="card-header-icon w-[52px] h-[52px] rounded-[14px] bg-(--green-pale) flex items-center justify-center shrink-0">
      <slot name="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  stepLabel: string
  title: string
  sub: string
}>()

const stepLabelShort = props.stepLabel.replace(/^Step (\d+) of \d+$/, 'Step $1')
</script>
