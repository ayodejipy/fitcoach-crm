<template>
  <div>
    <div class="section-label">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <polyline points="1,9 4,5 7,7 10,2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
      This Week's Metrics
    </div>

    <div class="grid grid-cols-2 gap-3">
      <!-- Energy -->
      <div class="metric-card">
        <div class="mc-label">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M7 1L2 7.5h5L4.5 12 11 5H6L7 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          Energy Level
        </div>
        <div class="flex items-baseline gap-1">
          <span class="mc-value">{{ metrics.energy.value }}</span>
          <span class="mc-unit">/ 10</span>
        </div>
        <SegmentBar :value="metrics.energy.value" tone="energy" />
        <div class="mc-sub" :class="deltaToneClass(metrics.energy.deltaTone)">{{ metrics.energy.delta }}</div>
      </div>

      <!-- Sleep -->
      <div class="metric-card">
        <div class="mc-label">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M10.5 8.5A5.5 5.5 0 014.5 2.5a5.5 5.5 0 006 6z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          Sleep Quality
        </div>
        <div class="flex items-baseline gap-1">
          <span class="mc-value">{{ metrics.sleep.value }}</span>
          <span class="mc-unit">/ 10</span>
        </div>
        <SegmentBar :value="metrics.sleep.value" tone="sleep" />
        <div class="mc-sub" :class="deltaToneClass(metrics.sleep.deltaTone)">{{ metrics.sleep.delta }}</div>
      </div>

      <!-- Adherence -->
      <div class="metric-card">
        <div class="mc-label">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M4 6.5l2 2 3.5-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Training Adherence
        </div>
        <div class="flex items-baseline gap-[3px]">
          <span class="mc-value text-primary dark:text-(--green-light)!">{{ metrics.adherence.done }}</span>
          <span class="mc-unit">of {{ metrics.adherence.total }} workouts</span>
        </div>
        <div class="flex gap-1.5 mt-2">
          <div
            v-for="i in metrics.adherence.total"
            :key="i"
            class="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0"
            :class="i <= metrics.adherence.done ? 'bg-primary dark:bg-(--green-light)' : 'bg-[#FAD7D3] dark:bg-[#F1948A]/30'"
          >
            <svg v-if="i <= metrics.adherence.done" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2.5L8 3" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="mc-sub" :class="deltaToneClass(metrics.adherence.deltaTone)">{{ metrics.adherence.delta }}</div>
      </div>

      <!-- Weight -->
      <div class="metric-card">
        <div class="mc-label">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1L3 4.5h7L6.5 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            <rect x="1.5" y="4.5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M4 8h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          Weight
        </div>
        <div class="flex items-baseline gap-1">
          <span class="mc-value">{{ metrics.weight.value }}</span>
          <span class="mc-unit">{{ metrics.weight.unit }}</span>
          <svg v-if="metrics.weight.trend === 'down'" width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-primary dark:text-(--green-light) mb-0.5">
            <path d="M7 10V4M4 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="metrics.weight.trend === 'up'" width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-[#E67E22] mb-0.5">
            <path d="M7 4v6M4 7l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="h-7 mt-2">
          <svg viewBox="0 0 180 28" class="w-full h-7 overflow-visible">
            <defs>
              <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="currentColor" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <g class="text-primary dark:text-(--green-light)">
              <polygon :fill="`url(#${gradId})`" :points="areaPoints"/>
              <polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :points="linePoints"/>
              <circle :cx="lastPoint.x" :cy="lastPoint.y" r="3" fill="currentColor"/>
            </g>
          </svg>
        </div>
        <div class="mc-sub" :class="deltaToneClass(metrics.weight.deltaTone)">{{ metrics.weight.delta }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SegmentBar from './SegmentBar.vue'

export type DeltaTone = 'good' | 'warn' | 'alert' | 'muted'

export interface CheckInMetricsData {
  energy: { value: number; delta: string; deltaTone: DeltaTone }
  sleep:  { value: number; delta: string; deltaTone: DeltaTone }
  adherence: { done: number; total: number; delta: string; deltaTone: DeltaTone }
  weight: {
    value: number
    unit: string
    trend: 'up' | 'down' | 'flat'
    delta: string
    deltaTone: DeltaTone
    history: number[]
  }
}

const props = defineProps<{
  metrics: CheckInMetricsData
}>()

const gradId = computed(() => `weightGrad-${Math.random().toString(36).slice(2, 8)}`)

const deltaToneClass = (t: DeltaTone) => ({
  good:  'text-primary dark:text-(--green-light)',
  warn:  'text-[#E67E22]',
  alert: 'text-[#E74C3C]',
  muted: 'text-[#6B8F72] dark:text-(--text-muted)',
}[t])

// Plot the sparkline over viewBox 0..180 × 0..28
const points = computed(() => {
  const vals = props.metrics.weight.history
  if (!vals.length) return [] as Array<{ x: number; y: number }>
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  return vals.map((v, i) => ({
    x: (i / Math.max(vals.length - 1, 1)) * 180,
    y: 28 - ((v - min) / range) * 28,
  }))
})

const linePoints = computed(() => points.value.map((p) => `${p.x},${p.y}`).join(' '))
const areaPoints = computed(() => {
  const p = points.value
  if (!p.length) return ''
  const forward = p.map((pt) => `${pt.x},${pt.y}`).join(' ')
  const last = p[p.length - 1]!
  const first = p[0]!
  return `${forward} ${last.x},28 ${first.x},28`
})
const lastPoint = computed(() => points.value[points.value.length - 1] ?? { x: 0, y: 0 })
</script>

<style scoped>
.section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8FAD97;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #E8F0EB;
}

.metric-card {
  background: #F7FAF8;
  border: 1px solid #E8F0EB;
  border-radius: 12px;
  padding: 14px 16px;
}

.mc-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6B8F72;
  margin-bottom: 10px;
}
.mc-label svg { color: var(--green-brand); flex-shrink: 0; }

.mc-value {
  font-size: 26px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.8px;
  line-height: 1;
}
.mc-unit {
  font-size: 13px;
  font-weight: 500;
  color: #8FAD97;
}
.mc-sub {
  font-size: 12px;
  font-weight: 600;
  margin-top: 6px;
}
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .section-label { color: var(--text-muted); }
.dark .section-label::after { background: var(--border); }
.dark .metric-card { background: rgba(255,255,255,.03); border-color: var(--border); }
.dark .mc-label { color: var(--text-muted); }
.dark .mc-label svg { color: var(--green-light); }
.dark .mc-unit { color: var(--text-muted); }
</style>
