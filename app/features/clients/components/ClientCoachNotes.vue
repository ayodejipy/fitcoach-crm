<template>
  <ClientProfileCard title="Coach Notes" link-label="Edit Notes">
    <template #icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 2h11v9l-3 3H2V2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M4.5 6h6M4.5 8.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    </template>

    <div class="flex items-center gap-1.5 text-[11px] font-semibold text-[#E67E22] bg-[#FEF3EA] dark:bg-[#E67E22]/15 rounded-md py-1 px-2.5 mb-3 w-max">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1.2"/>
        <path d="M4 5V4a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      Private — not visible to client
    </div>
    <div class="text-[13px] leading-[1.65] text-[#3D5A45] dark:text-(--text-secondary) bg-[#F7FAF8] dark:bg-white/[.03] rounded-lg py-3 px-3.5 border border-[#E8F0EB] dark:border-(--border) min-h-[80px] whitespace-pre-line">{{ text }}</div>
  </ClientProfileCard>
</template>

<script setup lang="ts">
import ClientProfileCard from './ClientProfileCard.vue'

defineProps<{
  text: string
}>()
</script>
