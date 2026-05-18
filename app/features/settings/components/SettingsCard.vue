<template>
  <div class="bg-(--bg-surface) rounded-[14px] shadow-(--shadow-card) border border-(--border) overflow-hidden mb-5">
    <div v-if="$slots.head || title" class="py-4 px-6 pb-3.5 border-b border-(--border-muted) flex items-center gap-2.5">
      <slot name="head">
        <div class="flex-1">
          <div class="text-sm font-bold text-(--text-primary)">{{ title }}</div>
          <div v-if="subtitle" class="text-[12.5px] text-(--text-muted) mt-0.5">{{ subtitle }}</div>
        </div>
      </slot>
    </div>

    <div :class="[bodyPadding]">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="py-4 px-6 border-t border-(--border-muted) flex items-center justify-end gap-2.5 bg-[#FAFBFA] dark:bg-white/[.02]"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  subtitle?: string
  bodyPadding?: string
}>(), {
  bodyPadding: 'p-6',
})
</script>
