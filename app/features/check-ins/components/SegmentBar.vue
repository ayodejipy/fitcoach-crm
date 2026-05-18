<template>
  <div class="flex gap-[3px] mt-2">
    <div
      v-for="(_, i) in segments"
      :key="i"
      class="flex-1 h-[7px] rounded-[3px]"
      :class="segmentClass(i)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  total?: number
  tone?: 'energy' | 'sleep'
}>(), {
  total: 10,
  tone: 'energy',
})

const segments = computed(() => Array.from({ length: props.total }))

const thresholds = computed(() => {
  const halfway = Math.ceil(props.total / 2)
  return { halfway, filled: props.value }
})

const segmentClass = (i: number) => {
  const { halfway, filled } = thresholds.value
  if (i >= filled) return 'bg-[#E8F2EC] dark:bg-white/[.06]'
  if (props.tone === 'sleep') {
    return i < halfway ? 'bg-[#AED6F1] dark:bg-[#AED6F1]/40' : 'bg-[#2E86C1]'
  }
  return i < halfway ? 'bg-[#A8D4BC] dark:bg-(--green-light)/40' : 'bg-primary dark:bg-(--green-light)'
}
</script>
