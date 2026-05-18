<template>
  <div
    class="inline-flex items-center gap-1 text-[11px] font-semibold py-[3px] px-2 rounded-md border whitespace-nowrap"
    :class="toneClass"
  >
    <component :is="iconComponent" v-if="iconComponent" class="shrink-0" />
    <slot>{{ label }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

export type MiniMetricTone = 'default' | 'good' | 'warn' | 'alert'
export type MiniMetricIcon = 'clock' | 'sleep' | 'check' | 'trend' | 'minus'

const props = withDefaults(defineProps<{
  label?: string
  tone?: MiniMetricTone
  icon?: MiniMetricIcon
}>(), {
  tone: 'default',
})

const toneClass = computed(() => ({
  default: 'bg-[#F7FAF8] border-[#E8F0EB] text-[#3D5A45] dark:bg-white/[.03] dark:border-(--border) dark:text-(--text-secondary)',
  good:    'bg-(--green-pale) border-[#A8D4BC] text-primary dark:bg-(--bg-primary-soft) dark:border-transparent dark:text-(--green-light)',
  warn:    'bg-[#FEF3EA] border-[#F5CBA7] text-[#E67E22] dark:bg-[#E67E22]/15 dark:border-transparent',
  alert:   'bg-[#FEECEC] border-[#F1948A] text-[#E74C3C] dark:bg-(--red)/15 dark:border-transparent dark:text-(--red)',
}[props.tone]))

const iconComponent = computed(() => {
  if (!props.icon) return null
  const paths: Record<MiniMetricIcon, () => unknown> = {
    clock: () => h('svg', { width: 11, height: 11, viewBox: '0 0 11 11', fill: 'none' }, [
      h('circle', { cx: 5.5, cy: 5.5, r: 4.5, stroke: 'currentColor', 'stroke-width': 1.2 }),
      h('path',   { d: 'M5.5 3v3l2 1', stroke: 'currentColor', 'stroke-width': 1.2, 'stroke-linecap': 'round' }),
    ]),
    sleep: () => h('svg', { width: 11, height: 11, viewBox: '0 0 11 11', fill: 'none' }, [
      h('path', { d: 'M2 7c0-2.5 1.6-4.5 3.5-4.5S9 4.5 9 7v3H2V7z', stroke: 'currentColor', 'stroke-width': 1.2 }),
      h('path', { d: 'M1 10h9', stroke: 'currentColor', 'stroke-width': 1.2, 'stroke-linecap': 'round' }),
    ]),
    check: () => h('svg', { width: 11, height: 11, viewBox: '0 0 11 11', fill: 'none' }, [
      h('path', { d: 'M2 5.5l2 2.5 5-5', stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    ]),
    trend: () => h('svg', { width: 11, height: 11, viewBox: '0 0 11 11', fill: 'none' }, [
      h('polyline', { points: '1,8 3.5,4 6,6 8,2.5 10,4.5', stroke: 'currentColor', 'stroke-width': 1.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }),
    ]),
    minus: () => h('svg', { width: 11, height: 11, viewBox: '0 0 11 11', fill: 'none' }, [
      h('path', { d: 'M2 5.5h7', stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-linecap': 'round' }),
    ]),
  }
  return paths[props.icon]
})
</script>
