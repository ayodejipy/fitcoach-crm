<script setup lang="ts">
type Trend = 'up' | 'down' | 'flat' | 'live'

defineProps<{
  metrics: Array<{
    label: string
    value: string
    suffix?: string
    prefix?: string
    note?: string
    noteTrend?: Trend
    sparkline?: number[]
    progressFilled?: number
    progressTotal?: number
    href?: string
    href_label?: string
  }>
}>()

const trendClass = (t?: Trend) => {
  if (t === 'up') return 'text-(--green-brand)'
  if (t === 'down') return 'text-(--red)'
  if (t === 'live') return 'text-(--green-brand)'
  return 'text-(--text-muted)'
}
</script>

<template>
  <section
    aria-label="Today's overview"
    class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden"
  >
    <dl class="grid grid-cols-4 divide-x divide-(--border) max-md:grid-cols-2 max-md:divide-x-0 max-md:divide-y">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="px-6 py-5"
      >
        <div class="flex items-center justify-between gap-2">
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-(--text-secondary)">{{ metric.label }}</dt>
          <span
            v-if="metric.note"
            class="text-[11px] font-semibold tabular-nums inline-flex items-center gap-1"
            :class="trendClass(metric.noteTrend)"
          >
            <span
              v-if="metric.noteTrend === 'live'"
              aria-hidden="true"
              class="h-1.5 w-1.5 rounded-full animate-pulse bg-(--green-brand)"
            />
            {{ metric.note }}
          </span>
        </div>

        <dd class="mt-3 flex items-baseline gap-1.5">
          <span v-if="metric.prefix" class="text-[14px] font-medium text-(--text-secondary) tabular-nums">{{ metric.prefix }}</span>
          <span class="text-[28px] font-semibold tabular-nums tracking-tight text-(--text-primary)">{{ metric.value }}</span>
          <span v-if="metric.suffix" class="text-[12.5px] font-medium text-(--text-secondary)">{{ metric.suffix }}</span>
        </dd>

        <div v-if="metric.sparkline" class="mt-2 flex items-end gap-0.5 h-5" aria-hidden="true">
          <span
            v-for="(bar, i) in metric.sparkline"
            :key="i"
            class="w-1 rounded-sm"
            :class="i >= (metric.sparkline.length - 3) ? 'bg-(--green-brand)' : 'bg-(--border-strong)'"
            :style="{ height: `${Math.max(8, bar * 4)}px` }"
          />
        </div>

        <div
          v-else-if="metric.progressTotal != null && metric.progressFilled != null"
          class="mt-3 flex gap-1"
          :aria-label="`${metric.progressFilled} of ${metric.progressTotal} complete`"
        >
          <span
            v-for="i in metric.progressTotal"
            :key="i"
            class="flex-1 h-1.5 rounded-full"
            :class="i <= metric.progressFilled ? 'bg-(--green-brand)' : 'bg-(--bg-subtle)'"
          />
        </div>

        <NuxtLink
          v-if="metric.href"
          :to="metric.href"
          class="mt-2 inline-block text-[12px] font-semibold hover:underline"
          :class="metric.noteTrend === 'up' || metric.noteTrend === 'live' ? 'text-(--green-brand)' : 'text-(--text-accent)'"
        >
          {{ metric.href_label || 'View →' }}
        </NuxtLink>
      </div>
    </dl>
  </section>
</template>
