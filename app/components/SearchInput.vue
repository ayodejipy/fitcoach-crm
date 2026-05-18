<template>
  <div class="relative flex items-center">
    <svg class="absolute left-[11px] top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 10l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="border-[1.5px] border-(--border) rounded-lg py-2 pr-3.5 pl-[34px] text-[13px] text-(--text-primary) bg-[#F9FBF9] dark:bg-(--bg-input) outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#A8BFB0] focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,122,74,0.1)]"
      :style="{ width: width + 'px' }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  width?: number
}>(), {
  modelValue: '',
  placeholder: 'Search…',
  width: 220,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
