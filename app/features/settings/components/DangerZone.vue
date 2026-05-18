<template>
  <div class="border-[1.5px] border-[#FECACA] dark:border-[#F87171]/40 rounded-[14px] py-5 px-6 bg-[#FFF5F5] dark:bg-[#F87171]/10 flex items-center gap-4">
    <div class="flex-1">
      <div class="text-[13.5px] font-bold text-[#DC2626] dark:text-[#F87171]">{{ title }}</div>
      <div class="text-[12.5px] text-(--text-muted) mt-1">{{ description }}</div>
    </div>
    <button
      type="button"
      class="danger-btn bg-(--bg-surface) text-[#DC2626] dark:text-[#F87171] border-[1.5px] border-[#FECACA] dark:border-[#F87171]/40 py-2 px-4 rounded-lg text-[13px] font-bold cursor-pointer whitespace-nowrap transition-colors"
      @click="$emit('confirm')"
    >{{ buttonLabel }}</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  buttonLabel: string
}>()

defineEmits<{
  confirm: []
}>()
</script>

<style scoped>
.danger-btn:hover { background: #FEE2E2; }
</style>

<style>
.dark .danger-btn:hover { background: rgba(248, 113, 113, 0.18); }
</style>
