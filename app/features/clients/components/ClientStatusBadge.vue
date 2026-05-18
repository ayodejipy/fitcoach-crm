<template>
  <span
    class="inline-flex items-center gap-1.5 text-[11px] font-bold py-1 px-2.5 rounded-[20px] whitespace-nowrap"
    :class="wrapClass"
  >
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="dotClass"></span>
    {{ label || defaultLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ClientStatus = 'active' | 'paused' | 'new' | 'ended'

const props = defineProps<{
  status: ClientStatus
  label?: string
}>()

const wrapClass = computed(() => ({
  active: 'bg-(--green-pale) text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)',
  paused: 'bg-[#FEF3EA] text-[#E67E22] dark:bg-[#E67E22]/15',
  new:    'bg-[#EBF5FB] text-[#3498DB] dark:bg-[#3498DB]/15',
  ended:  'bg-[#F5F5F5] text-[#95A5A6] dark:bg-white/5',
}[props.status]))

const dotClass = computed(() => ({
  active: 'bg-primary dark:bg-(--green-light)',
  paused: 'bg-[#E67E22]',
  new:    'bg-[#3498DB]',
  ended:  'bg-[#BDC3C7]',
}[props.status]))

const defaultLabel = computed(() => ({
  active: 'Active', paused: 'Paused', new: 'Trial', ended: 'Ended',
}[props.status]))
</script>
