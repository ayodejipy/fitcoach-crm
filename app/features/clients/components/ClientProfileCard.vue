<template>
  <div class="bg-(--bg-surface) border border-[#E5EDE8] dark:border-(--border) rounded-[14px] overflow-hidden mb-[18px] last:mb-0">
    <div class="flex items-center justify-between py-4 px-5 pb-3 border-b border-[#F0F4F1] dark:border-(--border)">
      <span class="flex items-center gap-1.5 text-sm font-bold text-(--text-primary)">
        <span class="text-primary dark:text-(--green-light)">
          <slot name="icon" />
        </span>
        {{ title }}
      </span>
      <a
        v-if="linkLabel"
        href="#"
        class="text-xs font-semibold text-primary dark:text-(--green-light) no-underline hover:underline"
        @click.prevent="$emit('link-click')"
      >{{ linkLabel }} →</a>
    </div>
    <div class="py-[18px] px-5" :class="bodyClass">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  linkLabel?: string
  bodyClass?: string
}>()

defineEmits<{
  'link-click': []
}>()
</script>
