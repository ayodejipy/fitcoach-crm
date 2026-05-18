<template>
  <div class="flex items-center border-b-2 border-[#E5EDE8] dark:border-(--border)">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="ftab"
      :class="{ 'ftab-active': modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="ftab-count" :class="{ 'ftab-count-active': modelValue === tab.id }">{{ tab.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
export interface FilterTab {
  id: string
  label: string
  count?: number
}

defineProps<{
  modelValue: string
  tabs: readonly FilterTab[]
}>()

defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<style scoped>
.ftab {
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  color: #6B8F72;
  cursor: pointer;
  border: none;
  background: transparent;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color .15s, border-color .15s;
}
.ftab:hover { color: var(--green-brand); }

.ftab-active { color: var(--green-brand); border-bottom-color: var(--green-brand); }

.ftab-count {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  background: var(--green-pale);
  color: var(--green-brand);
}

.ftab-count-active { background: var(--green-brand); color: #fff; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid Vue SFC :global() compiler bug (vuejs/core#12404) */
.dark .ftab { color: var(--text-muted); }
.dark .ftab:hover { color: var(--green-light); }
.dark .ftab-active { color: var(--green-light); border-bottom-color: var(--green-light); }
.dark .ftab-count { background: var(--bg-primary-soft); color: var(--green-light); }
.dark .ftab-count-active { background: var(--green-light); color: var(--green-deep); }
</style>
