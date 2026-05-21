<script setup lang="ts">
defineProps<{
name: string
weeks: number
}>()
</script>

<template>
  <div class="flex items-center justify-between rounded-xl py-4 px-[22px] mb-5 text-white" :style="{ background: 'linear-gradient(135deg, #0F2418, #1A7A4A)' }">
    <div class="flex items-center gap-3">
      <div class="text-[28px] leading-none">🔥</div>
      <div>
        <h3 class="text-base font-bold">{{ name }} is on a {{ weeks }}-week check-in streak</h3>
        <p class="text-xs text-white/60 mt-0.5">Consistent check-ins are strongly correlated with better results. Keep it up!</p>
      </div>
    </div>
    <div class="text-right">
      <div class="text-[32px] font-black text-[#6EE7A0] tracking-[-1px] leading-none">{{ weeks }}</div>
      <div class="text-[11px] text-white/50 font-semibold uppercase">Week Streak</div>
    </div>
  </div>
</template>

