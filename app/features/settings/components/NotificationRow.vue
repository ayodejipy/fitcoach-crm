<template>
  <div class="flex items-center gap-3.5 py-3.5 border-b border-(--border-muted) last:border-b-0">
    <div class="flex-1">
      <div class="text-[13.5px] font-semibold text-(--text-primary)">{{ name }}</div>
      <div class="text-xs text-(--text-muted) mt-0.5">{{ description }}</div>
    </div>
    <UToggle color="primary" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event ?? false)" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  description: string
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
