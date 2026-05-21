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

<template>
  <div class="flex items-center gap-2 mb-5 flex-wrap">
    <button
      v-for="chip in chips"
      :key="chip.id"
      type="button"
      class="inline-flex items-center gap-[5px] px-[14px] py-1.5 rounded-[20px] text-[12px] font-semibold cursor-pointer border-[1.5px] select-none transition-all"
      :class="[
        modelValue === chip.id
          ? 'bg-(--green-brand) text-white border-(--green-brand) shadow-[0_1px_4px_rgba(26,122,74,.25)]'
          : chip.variant === 'danger'
            ? 'border-[#E74C3C] text-[#E74C3C] bg-(--bg-surface) hover:bg-[#FEECEC]'
            : 'border-[#D1E0D5] dark:border-(--border) text-[#3D5A45] dark:text-(--text-secondary) bg-(--bg-surface) hover:border-(--green-brand) hover:bg-[#F0F9F4] dark:hover:bg-(--bg-primary-soft)',
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
      <span
        class="text-[11px] font-bold px-1.5 py-px rounded-[10px]"
        :class="[
          modelValue === chip.id
            ? 'bg-white/25 text-inherit'
            : chip.variant === 'danger'
              ? 'bg-[#FEECEC] text-[#E74C3C]'
              : 'bg-[#E8F2EC] dark:bg-(--bg-primary-soft) text-(--green-brand) dark:text-(--green-light)',
        ]"
      >{{ chip.count }}</span>
    </button>
  </div>
</template>
