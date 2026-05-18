<template>
  <div class="bg-(--bg-surface) rounded-[14px] border border-(--border) overflow-hidden">
    <header class="flex items-center justify-between py-[18px] px-[22px] pb-3.5 border-b border-[#F0F4F1] dark:border-white/5">
      <span class="text-[15px] font-bold text-(--text-primary)">Revenue Trend</span>
      <a href="#" class="text-xs font-semibold text-primary dark:text-(--green-light) cursor-pointer no-underline">Full Report →</a>
    </header>
    <div class="py-4 px-[22px] pb-[22px]">
      <div class="text-xs font-semibold text-(--text-muted) mb-3">Last 6 months (USD)</div>
      <div class="flex items-end gap-1.5 h-20">
        <div
          v-for="(m, i) in months"
          :key="m.label"
          class="flex flex-col items-center gap-1 flex-1"
        >
          <div
            class="w-full rounded-t transition-colors duration-200"
            :class="i === months.length - 1 ? 'bg-primary' : 'bg-(--green-pale) dark:bg-(--bg-primary-soft)'"
            :style="{ height: m.height + 'px' }"
            :title="`$${m.value}`"
          ></div>
          <div class="text-[10px]" :class="i === months.length - 1 ? 'text-primary dark:text-(--green-light) font-bold' : 'text-[#95A5A6]'">{{ m.label }}</div>
        </div>
      </div>
      <div class="mt-3 flex justify-between items-center">
        <div class="text-[13px] text-(--text-muted)">{{ footerLabel }}</div>
        <div class="text-[15px] font-bold text-primary dark:text-(--green-light)">${{ footerValue }} ↑</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  months: Array<{ label: string; value: string; height: number }>
  footerLabel: string
  footerValue: string
}>()
</script>
