<template>
  <div class="bg-(--bg-surface) border border-[#E5EDE8] dark:border-(--border) rounded-[14px] py-[60px] px-10 text-center text-[#8FAD97] dark:text-(--text-muted)">
    <div v-if="$slots.icon" class="mx-auto mb-3 text-[#C8D9CE] dark:text-white/20">
      <slot name="icon" />
    </div>
    <div class="text-[15px] font-semibold text-[#3D5A45] dark:text-(--text-primary) mb-1">{{ title }}</div>
    <div class="text-[13px]">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
