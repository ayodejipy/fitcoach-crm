<template>
  <header class="sticky top-0 z-10 bg-(--bg-surface) border-b border-(--border) h-16 px-8 flex items-center justify-between">
    <div>
      <slot name="title">
        <div class="text-xl font-bold text-(--green-deep) dark:text-(--text-primary) tracking-[-0.3px]">{{ title }}</div>
        <div v-if="subtitle" class="text-[13px] text-(--text-muted) mt-0.5">{{ subtitle }}</div>
      </slot>
    </div>
    <div class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  subtitle?: string
}>(), {
  title: '',
})
</script>
