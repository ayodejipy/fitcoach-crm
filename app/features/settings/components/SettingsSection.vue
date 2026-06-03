<script setup lang="ts">
defineProps<{
  id: string
  title: string
  description?: string
  isFirst?: boolean
  isLast?: boolean
}>()
</script>

<template>
  <section
    :id="id"
    :aria-labelledby="`${id}-heading`"
    class="grid grid-cols-[260px_1fr] gap-8 scroll-mt-[72px] max-md:grid-cols-1 max-md:gap-4"
    :class="[
      isFirst ? '' : 'pt-10',
      isLast ? '' : 'pb-10 border-b border-(--border)',
    ]"
  >
    <div>
      <div class="flex items-center gap-2 flex-wrap">
        <h2 :id="`${id}-heading`" class="text-[14px] font-semibold text-(--text-primary)">{{ title }}</h2>
        <slot name="badge" />
      </div>
      <p v-if="description" class="mt-1.5 text-[12px] text-(--text-secondary) leading-relaxed">
        {{ description }}
      </p>
    </div>
    <div class="min-w-0 space-y-4">
      <slot />
    </div>
  </section>
</template>
