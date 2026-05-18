<template>
  <div class="flex items-center justify-between py-3.5 px-[22px] border-t border-[#F0F4F1] dark:border-white/5 bg-[#FAFCFB] dark:bg-white/[.02]">
    <div class="text-[13px] text-(--text-muted)">
      Showing <strong class="text-(--text-secondary)">{{ from }}–{{ to }}</strong> of <strong class="text-(--text-secondary)">{{ total }}</strong> {{ itemsLabel }}
    </div>

    <div class="flex items-center gap-1">
      <button
        type="button"
        class="page-btn"
        :disabled="modelValue <= 1"
        @click="$emit('update:modelValue', modelValue - 1)"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M8 2L4 6l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Previous
      </button>
      <button
        v-for="p in pages"
        :key="p"
        type="button"
        class="page-btn"
        :class="{ active: p === modelValue }"
        @click="$emit('update:modelValue', p)"
      >{{ p }}</button>
      <button
        type="button"
        class="page-btn"
        :disabled="modelValue >= pages"
        @click="$emit('update:modelValue', modelValue + 1)"
      >
        Next
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: number
  pages: number
  from: number
  to: number
  total: number
  itemsLabel?: string
}>(), {
  itemsLabel: 'items',
})

defineEmits<{
  'update:modelValue': [page: number]
}>()
</script>

<style scoped>
.page-btn {
  height: 32px;
  min-width: 32px;
  padding: 0 10px;
  border: 1.5px solid var(--border);
  border-radius: 7px;
  background: var(--bg-surface);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: border-color .12s, color .12s, background .12s;
}
.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--green-brand);
  color: var(--green-brand);
  background: #F0F9F4;
}
.page-btn.active {
  background: var(--green-brand);
  border-color: var(--green-brand);
  color: #fff;
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .page-btn:hover:not(:disabled):not(.active) {
  background: var(--bg-primary-soft);
  color: var(--green-light);
}
</style>
