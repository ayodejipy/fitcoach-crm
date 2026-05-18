<template>
  <div class="relative bg-[#F7FAF8] dark:bg-white/[.03] rounded-[10px] py-3.5 px-[18px] border-l-4 border-(--green-brand) dark:border-(--green-light) text-sm text-[#2D4A36] dark:text-(--text-primary) leading-[1.7] italic">
    <span class="absolute top-1 left-3 text-[36px] text-(--green-soft) dark:text-(--green-light)/30 leading-none not-italic font-serif select-none">“</span>
    <p class="ml-4">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>
