<template>
  <div class="flex bg-(--bg-surface) border border-[#E5EDE8] dark:border-(--border) rounded-[14px] overflow-hidden mb-6 mt-3">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="tab"
      :class="{ 'tab-active': modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)"
    >
      <span v-html="tab.iconSvg" class="shrink-0"></span>
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="tab-count" :class="{ 'tab-count-active': modelValue === tab.id }">{{ tab.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
export interface ProfileTab {
  id: string
  label: string
  iconSvg: string
  count?: number
}

defineProps<{
  modelValue: string
  tabs: readonly ProfileTab[]
}>()

defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<style scoped>
.tab {
  flex: 1;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6B8F72;
  cursor: pointer;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-bottom: 3px solid transparent;
  transition: color .15s, background .15s, border-color .15s;
  position: relative;
}
.tab:hover { color: var(--green-brand); background: #F9FBF9; }
.tab-active { color: var(--green-brand); border-bottom-color: var(--green-brand); background: #FAFCFA; }

.tab-count {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  background: #E8F2EC;
  color: var(--green-brand);
}
.tab-count-active { background: var(--green-brand); color: #fff; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .tab { color: var(--text-muted); }
.dark .tab:hover { color: var(--green-light); background: rgba(255,255,255,.03); }
.dark .tab-active { color: var(--green-light); border-bottom-color: var(--green-light); background: rgba(255,255,255,.02); }
.dark .tab-count { background: var(--bg-primary-soft); color: var(--green-light); }
.dark .tab-count-active { background: var(--green-light); color: var(--green-deep); }
</style>
