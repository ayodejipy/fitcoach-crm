<script setup lang="ts">
export interface DetailTab {
  id: string
  label: string
  badge?: number | string
}

defineProps<{
  modelValue: string
  tabs: DetailTab[]
}>()

defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<template>
  <div role="tablist" class="flex items-center gap-5 overflow-x-auto -mb-px">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      role="tab"
      type="button"
      :aria-selected="modelValue === tab.id"
      class="border-b-2 pb-2.5 text-[12.5px] font-medium whitespace-nowrap"
      :class="modelValue === tab.id
        ? 'border-(--text-primary) text-(--text-primary)'
        : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
      <span
        v-if="tab.badge"
        class="ml-1 inline-flex items-center justify-center rounded-full bg-(--green-soft) px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-(--green-brand)"
      >{{ tab.badge }}</span>
    </button>
  </div>
</template>
