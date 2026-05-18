<template>
  <label class="toggle-switch relative w-[42px] h-6 shrink-0 inline-block">
    <input
      type="checkbox"
      class="absolute opacity-0 w-0 h-0"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span class="toggle-track absolute inset-0 bg-[#CBD5E1] dark:bg-white/15 rounded-xl cursor-pointer transition-colors"></span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.toggle-track::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .2);
}
.toggle-switch input:checked + .toggle-track { background: var(--green-brand); }
.toggle-switch input:checked + .toggle-track::before { transform: translateX(18px); }
</style>
