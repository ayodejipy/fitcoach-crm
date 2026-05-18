<template>
  <div class="flex items-center gap-0 border-b-2 border-(--border) mb-5">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="tab-btn"
      :class="{ 'tab-btn-active': modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="tab-count" :class="{ 'tab-count-active': modelValue === tab.id }">{{ tab.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
export interface Tab {
  id: string
  label: string
  count?: number
}

defineProps<{
  modelValue: string
  tabs: Tab[]
}>()

defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<style scoped>
.tab-btn {
  padding: 10px 20px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color .15s, border-color .15s;
  display: flex;
  align-items: center;
  gap: 7px;
}
.tab-btn:hover { color: var(--text-secondary); }
.tab-btn-active {
  color: var(--green-brand);
  border-bottom-color: var(--green-brand);
}

.tab-count {
  background: #E5EAE7;
  color: #374151;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 20px;
}
.tab-count-active { background: var(--green-pale); color: var(--green-brand); }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .tab-btn-active { color: var(--green-light); border-bottom-color: var(--green-light); }
.dark .tab-count { background: rgba(255,255,255,.08); color: var(--text-secondary); }
.dark .tab-count-active { background: var(--bg-primary-soft); color: var(--green-light); }
</style>
