<template>
  <div class="flex items-center gap-2 mb-5 flex-wrap">
    <button
      v-for="chip in chips"
      :key="chip.id"
      type="button"
      class="chip"
      :class="[
        modelValue === chip.id ? 'chip-active' : 'chip-default',
        chip.variant === 'danger' ? 'chip-danger' : '',
      ]"
      @click="$emit('update:modelValue', chip.id)"
    >
      <svg
        v-if="chip.variant === 'danger'"
        width="11" height="11" viewBox="0 0 11 11" fill="none" class="shrink-0"
      >
        <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1.2"/>
        <path d="M5.5 3v2.5M5.5 7.5v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      {{ chip.label }}
      <span class="chip-count" :class="chip.variant === 'danger' && modelValue !== chip.id ? 'chip-count-danger' : ''">{{ chip.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
export interface FilterChip {
  id: string
  label: string
  count: number
  variant?: 'default' | 'danger'
}

defineProps<{
  modelValue: string
  chips: FilterChip[]
}>()

defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  user-select: none;
  background: transparent;
  transition: all .15s;
}
.chip-default {
  border-color: #D1E0D5;
  color: #3D5A45;
  background: var(--bg-surface);
}
.chip-default:hover {
  border-color: var(--green-brand);
  background: #F0F9F4;
}
.chip-active {
  background: var(--green-brand);
  color: #fff;
  border-color: var(--green-brand);
  box-shadow: 0 1px 4px rgba(26, 122, 74, .25);
}
.chip-danger.chip-default {
  border-color: #E74C3C;
  color: #E74C3C;
}
.chip-danger.chip-default:hover {
  background: #FEECEC;
}

.chip-count {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  background: #E8F2EC;
  color: var(--green-brand);
}
.chip-active .chip-count {
  background: rgba(255, 255, 255, .25);
  color: inherit;
}
.chip-count-danger {
  background: #FEECEC;
  color: #E74C3C;
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .chip-default { border-color: var(--border); color: var(--text-secondary); }
.dark .chip-default:hover { background: var(--bg-primary-soft); }
.dark .chip-default .chip-count { background: var(--bg-primary-soft); color: var(--green-light); }
</style>
