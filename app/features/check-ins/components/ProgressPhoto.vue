<template>
  <div class="flex gap-2.5 items-center">
    <button
      type="button"
      class="relative w-[72px] h-[72px] rounded-[10px] border-[1.5px] border-[#D1E0D5] dark:border-(--border) overflow-hidden flex items-center justify-center cursor-pointer transition-shadow duration-100 hover:shadow-[0_4px_12px_rgba(26,122,74,0.2)]"
      :style="{ background: 'linear-gradient(135deg, #E8F2EC, #C8E6D5)' }"
    >
      <div class="text-center">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="mx-auto text-[#A8BFB0]">
          <rect x="2" y="4" width="18" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="11" cy="11" r="3.5" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="17" cy="7" r="1.2" fill="currentColor"/>
        </svg>
        <span class="block text-[9px] font-semibold text-[#8FAD97] mt-0.5">Progress<br>photo</span>
      </div>
    </button>
    <div>
      <div class="text-[13px] font-semibold text-(--text-primary) mb-0.5">{{ weekLabel }} photo submitted</div>
      <div class="text-xs text-(--text-muted) mb-2">Submitted with check-in · {{ submittedAt }}</div>
      <a href="#" class="text-xs font-semibold text-primary dark:text-(--green-light) no-underline hover:underline">View full size →</a>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weekLabel: string
  submittedAt: string
}>()
</script>
