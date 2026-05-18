<template>
  <div class="flex items-center gap-2.5 py-[9px] px-3 rounded-lg mb-1.5 border border-[#E8F0EB] dark:border-(--border) bg-[#FAFCFB] dark:bg-white/[.02] transition-colors hover:bg-[#F0F9F4] dark:hover:bg-(--bg-primary-soft) hover:border-(--green-soft)">
    <button
      type="button"
      class="day-check"
      :class="done ? 'done' : 'todo'"
      @click="$emit('toggle')"
    >
      <svg v-if="done" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="flex-1">
      <div class="text-[13px] font-semibold text-(--text-primary)">{{ label }}</div>
      <div class="text-[11px] text-[#8FAD97] dark:text-(--text-muted)">{{ type }}</div>
    </div>
    <div class="text-xs font-semibold text-[#6B8F72] dark:text-(--text-secondary)">{{ duration }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  type: string
  duration: string
  done: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.day-check {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  padding: 0;
}
.day-check.done { background: var(--green-brand); }
.day-check.todo { background: transparent; border: 1.5px solid #C8D9CE; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .day-check.done { background: var(--green-light); }
.dark .day-check.todo { border-color: var(--border-strong); }
</style>
