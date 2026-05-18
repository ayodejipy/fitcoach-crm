<template>
  <ClientProfileCard title="Progress Metrics" link-label="View full chart">
    <template #icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <polyline points="1,12 5,6 8,9 11,4 14,7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </template>

    <div class="relative">
      <svg class="w-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="currentColor" stop-opacity="0.01"/>
          </linearGradient>
        </defs>

        <g class="text-[#F0F4F1] dark:text-white/5">
          <line v-for="y in [20, 55, 90, 125]" :key="y" :x1="40" :y1="y" :x2="490" :y2="y" stroke="currentColor" stroke-width="1"/>
        </g>

        <g class="text-[#8FAD97] dark:text-[--text-muted]" font-family="Inter, system-ui">
          <text v-for="(label, i) in yLabels" :key="`y-${i}`" :x="34" :y="24 + i * 35" text-anchor="end" font-size="10" fill="currentColor">{{ label }}</text>
        </g>

        <g class="text-[#8FAD97] dark:text-[--text-muted]" font-family="Inter, system-ui">
          <text v-for="(week, i) in xLabels" :key="`x-${i}`" :x="40 + i * 90" :y="150" text-anchor="middle" font-size="10" fill="currentColor">{{ week }}</text>
        </g>

        <g class="text-primary dark:text-(--green-light)">
          <polygon :fill="`url(#${gradId})`" :points="areaPoints"/>
          <polyline :points="linePoints" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle
            v-for="(pt, i) in points"
            :key="i"
            :cx="pt.x"
            :cy="pt.y"
            :r="i === points.length - 1 ? 5 : 4"
            :fill="i === points.length - 1 ? 'currentColor' : 'var(--bg-surface)'"
            stroke="currentColor"
            stroke-width="2.5"
          />
        </g>

        <rect
          v-if="lastPoint"
          :x="lastPoint.x - 32"
          :y="lastPoint.y - 27"
          width="64"
          height="22"
          rx="5"
          fill="var(--green-deep)"
        />
        <text
          v-if="lastPoint"
          :x="lastPoint.x"
          :y="lastPoint.y - 12"
          text-anchor="middle"
          font-size="11"
          font-weight="700"
          fill="#6EE7A0"
          font-family="Inter, system-ui"
        >{{ history[history.length - 1] }} {{ unit }}</text>
      </svg>
    </div>

    <div class="grid grid-cols-3 gap-2.5 mt-3.5">
      <div v-for="m in tiles" :key="m.label" class="bg-[#F7FAF8] dark:bg-white/[.03] rounded-[10px] py-3 px-3.5 border border-[#E8F0EB] dark:border-(--border)">
        <div class="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#6B8F72] dark:text-(--text-muted) mb-1.5">{{ m.label }}</div>
        <div class="text-xl font-extrabold text-(--text-primary) tracking-[-0.5px]" :class="m.valueClass">
          {{ m.value }}<span v-if="m.unit" class="text-[11px] font-medium text-[#8FAD97] dark:text-(--text-muted) ml-0.5">{{ m.unit }}</span>
        </div>
        <div class="text-[11px] font-semibold mt-1" :class="toneClass(m.changeTone)">{{ m.change }}</div>
      </div>
    </div>
  </ClientProfileCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ClientProfileCard from './ClientProfileCard.vue'

export type MetricTone = 'down' | 'up' | 'flat'

export interface MetricTile {
  label: string
  value: string
  unit?: string
  valueClass?: string
  change: string
  changeTone: MetricTone
}

const props = defineProps<{
  history: number[]
  unit: string
  yLabels: Array<number | string>
  xLabels: string[]
  tiles: MetricTile[]
}>()

const gradId = computed(() => `progressGrad-${Math.random().toString(36).slice(2, 8)}`)

const points = computed(() => {
  const v = props.history
  if (!v.length) return [] as Array<{ x: number; y: number }>
  const max = Math.max(...v)
  const min = Math.min(...v)
  const range = max - min || 1
  const xStep = 450 / Math.max(v.length - 1, 1)
  return v.map((val, i) => ({
    x: 40 + i * xStep,
    y: 20 + ((max - val) / range) * 105,
  }))
})

const linePoints = computed(() => points.value.map((p) => `${p.x},${p.y}`).join(' '))

const areaPoints = computed(() => {
  const p = points.value
  if (!p.length) return ''
  const forward = p.map((pt) => `${pt.x},${pt.y}`).join(' ')
  const last = p[p.length - 1]!
  const first = p[0]!
  return `${forward} ${last.x},125 ${first.x},125`
})

const lastPoint = computed(() => points.value[points.value.length - 1] ?? null)

const toneClass = (t: MetricTone) => ({
  down: 'text-primary dark:text-(--green-light)',
  up:   'text-[#E74C3C]',
  flat: 'text-[#8FAD97] dark:text-(--text-muted)',
}[t])
</script>
