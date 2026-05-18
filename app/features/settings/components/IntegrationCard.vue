<template>
  <div class="int-card bg-(--bg-surface) rounded-[14px] shadow-(--shadow-card) border border-(--border) p-[22px] pb-5 flex flex-col transition-shadow">
    <div class="flex items-start gap-3.5 mb-3.5">
      <div class="int-logo w-[46px] h-[46px] rounded-xl flex items-center justify-center shrink-0 border border-[#EAEAEA] dark:border-(--border)" :class="logoClass">
        <slot name="logo" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-(--text-primary)">{{ name }}</div>
        <div class="text-[12.5px] text-(--text-muted) mt-0.5 leading-[1.45]">{{ description }}</div>
      </div>
    </div>

    <div
      class="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-[20px] text-[11.5px] font-semibold mb-3.5 self-start"
      :class="connected ? 'bg-(--green-pale) text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)' : 'bg-[#F3F4F6] dark:bg-white/5 text-(--text-muted)'"
    >
      <span v-if="connected" class="w-1.5 h-1.5 rounded-full bg-primary dark:bg-(--green-light)"></span>
      {{ connected ? 'Connected' : 'Not connected' }}
    </div>

    <div class="text-xs text-(--text-muted) mb-3.5 flex items-center gap-1.5">
      <svg class="w-[13px] h-[13px] shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
      </svg>
      {{ meta }}
    </div>

    <div class="flex items-center justify-between pt-3.5 border-t border-(--border-muted)">
      <span class="text-xs" :class="connected ? 'text-primary dark:text-(--green-light) font-semibold' : 'text-(--text-muted)'">{{ statusText }}</span>

      <SettingsToggle
        v-if="connected"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
      />
      <button
        v-else
        type="button"
        class="connect-btn"
        @click="$emit('connect')"
      >Connect</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SettingsToggle from './SettingsToggle.vue'

const props = defineProps<{
  name: string
  description: string
  meta: string
  statusText: string
  connected: boolean
  modelValue?: boolean
  logoVariant?: 'white' | 'zoom' | 'stripe' | 'mfp'
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  connect: []
}>()

const logoClass = computed(() => ({
  white:  'bg-white',
  zoom:   'bg-[#2D8CFF]',
  stripe: 'bg-[#635BFF]',
  mfp:    'bg-[#4DB6AC]',
})[props.logoVariant ?? 'white'])
</script>

<style scoped>
.int-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.05); }

.connect-btn {
  padding: 7px 13px;
  font-size: 12.5px;
  border-radius: 7px;
  font-weight: 600;
  background: #fff;
  color: var(--green-brand);
  border: 1.5px solid var(--green-brand);
  cursor: pointer;
  font-family: inherit;
  transition: background .15s;
}
.connect-btn:hover { background: var(--green-pale); }
</style>

<style>
.dark .connect-btn {
  background: transparent;
  color: var(--green-light);
  border-color: var(--green-light);
}
.dark .connect-btn:hover { background: var(--bg-primary-soft); }
</style>
