<script setup lang="ts">
defineProps<{
  icon: string
  headline: string
  hint: string
  cta?: string
  ctaTo?: string
}>()

defineEmits<{ cta: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-10 px-6 text-center gap-3">
    <div class="w-14 h-14 rounded-[16px] bg-(--green-pale) dark:bg-(--bg-primary-soft) flex items-center justify-center shrink-0">
      <UIcon :name="icon" class="w-6 h-6 text-primary dark:text-(--green-light)" />
    </div>
    <div class="space-y-1">
      <div class="text-[15px] font-bold text-(--text-primary)">{{ headline }}</div>
      <div class="text-[13px] text-(--text-muted) max-w-[220px] leading-[1.5]">{{ hint }}</div>
    </div>
    <NuxtLink v-if="cta && ctaTo" :to="ctaTo" class="empty-cta">{{ cta }}</NuxtLink>
    <button v-else-if="cta" type="button" class="empty-cta" @click="$emit('cta')">{{ cta }}</button>
  </div>
</template>

<style scoped>
.empty-cta {
  font-size: 13px;
  font-weight: 600;
  color: var(--green-brand);
  border: 1.5px solid var(--green-brand);
  border-radius: 8px;
  padding: 6px 16px;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  display: inline-flex;
  align-items: center;
}
.empty-cta:hover {
  background: var(--green-pale);
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .empty-cta { color: var(--green-light); border-color: var(--green-light); }
.dark .empty-cta:hover { background: var(--bg-primary-soft); }
</style>
