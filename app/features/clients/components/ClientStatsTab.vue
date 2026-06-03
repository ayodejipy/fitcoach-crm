<script setup lang="ts">
import { format, parseISO, differenceInWeeks } from 'date-fns'
import type { ModelsCoachCheckIn } from '~/services'

const props = defineProps<{
  checkIns: ModelsCoachCheckIn[]
  startDate: string | null
  streak: number
  programWeek?: number
  programTotal?: number
}>()

const submitted = computed(() =>
  [...props.checkIns]
    .filter(ci => ci.submitted_at)
    .sort((a, b) => parseISO(a.submitted_at!).getTime() - parseISO(b.submitted_at!).getTime()),
)

function avg(field: 'energy_score' | 'mood_score' | 'sleep_hrs'): number | null {
  const values = submitted.value.map(ci => ci[field]).filter((v): v is number => v != null)
  if (!values.length) return null
  return +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
}

const weightSeries = computed(() =>
  submitted.value
    .filter(ci => ci.weight_lbs != null)
    .map(ci => ({ date: parseISO(ci.submitted_at!), weight: ci.weight_lbs! })),
)

const firstWeight = computed(() => weightSeries.value[0]?.weight ?? null)
const latestWeight = computed(() => weightSeries.value.at(-1)?.weight ?? null)
const weightDelta = computed(() => {
  if (firstWeight.value == null || latestWeight.value == null) return null
  return +(latestWeight.value - firstWeight.value).toFixed(1)
})

const stats = computed(() => [
  {
    label: 'Latest weight',
    value: latestWeight.value != null ? `${latestWeight.value} lbs` : '—',
    sub: weightDelta.value != null
      ? `${weightDelta.value > 0 ? '+' : ''}${weightDelta.value} since week 1`
      : 'No weight logged',
    tone: weightDelta.value == null
      ? 'neutral'
      : weightDelta.value < 0
        ? 'positive'
        : weightDelta.value > 0
          ? 'warning'
          : 'neutral',
  },
  {
    label: 'Avg energy',
    value: avg('energy_score') != null ? `${avg('energy_score')}` : '—',
    sub: avg('energy_score') != null ? 'out of 10' : 'No data',
    tone: 'neutral' as const,
  },
  {
    label: 'Avg mood',
    value: avg('mood_score') != null ? `${avg('mood_score')}` : '—',
    sub: avg('mood_score') != null ? 'out of 10' : 'No data',
    tone: 'neutral' as const,
  },
  {
    label: 'Avg sleep',
    value: avg('sleep_hrs') != null ? `${avg('sleep_hrs')}h` : '—',
    sub: avg('sleep_hrs') != null ? 'per night' : 'No data',
    tone: 'neutral' as const,
  },
])

const programLabel = computed(() => {
  if (!props.programTotal) return null
  return `Week ${props.programWeek ?? 1} of ${props.programTotal}`
})

const submissionRate = computed(() => {
  if (!props.startDate) return null
  const weeksElapsed = Math.max(1, differenceInWeeks(new Date(), parseISO(props.startDate)) + 1)
  const submittedCount = submitted.value.length
  return {
    submitted: submittedCount,
    expected: weeksElapsed,
    pct: Math.min(100, Math.round((submittedCount / weeksElapsed) * 100)),
  }
})

const trendBars = computed(() => {
  if (weightSeries.value.length < 2) return []
  const min = Math.min(...weightSeries.value.map(p => p.weight))
  const max = Math.max(...weightSeries.value.map(p => p.weight))
  const range = Math.max(max - min, 0.1)
  return weightSeries.value.slice(-12).map((point, i) => ({
    key: i,
    weight: point.weight,
    label: format(point.date, 'MMM d'),
    height: 18 + ((point.weight - min) / range) * 70,
  }))
})

const toneClass = (tone: string) => ({
  positive: 'text-(--green-brand)',
  warning: 'text-(--warning)',
  neutral: 'text-(--text-secondary)',
}[tone] ?? 'text-(--text-secondary)')
</script>

<template>
  <div class="space-y-6">
    <section aria-labelledby="stats-overview">
      <h2 id="stats-overview" class="sr-only">Overview stats</h2>
      <dl class="grid grid-cols-4 gap-3 max-md:grid-cols-2">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-4"
        >
          <dt class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">{{ stat.label }}</dt>
          <dd class="mt-1.5 text-[22px] font-semibold tabular-nums text-(--text-primary)">{{ stat.value }}</dd>
          <p class="mt-0.5 text-[11.5px] tabular-nums" :class="toneClass(stat.tone)">{{ stat.sub }}</p>
        </div>
      </dl>
    </section>

    <div class="grid grid-cols-[1.4fr_1fr] gap-4 max-lg:grid-cols-1">
      <section
        aria-labelledby="weight-trend"
        class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-5"
      >
        <div class="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
          <h2 id="weight-trend" class="text-[13.5px] font-semibold text-(--text-primary)">Weight trend</h2>
          <span class="text-[11px] text-(--text-muted)">last {{ trendBars.length || 0 }} check-ins</span>
        </div>
        <div v-if="trendBars.length >= 2" class="flex items-end gap-2 h-[140px]">
          <div
            v-for="bar in trendBars"
            :key="bar.key"
            class="flex-1 flex flex-col items-center gap-1.5 group"
          >
            <span class="text-[10.5px] tabular-nums text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity">{{ bar.weight }}</span>
            <div
              class="w-full rounded-t-md bg-(--green-brand)/80 transition-colors group-hover:bg-(--green-brand)"
              :style="{ height: `${bar.height}%` }"
            />
            <span class="text-[9.5px] tabular-nums text-(--text-muted)">{{ bar.label }}</span>
          </div>
        </div>
        <div v-else class="py-10 text-center">
          <UIcon name="i-lucide-line-chart" class="size-6 text-(--text-muted) mb-1.5 inline-block" />
          <p class="text-[12.5px] text-(--text-secondary)">Need at least 2 weight entries to plot a trend.</p>
        </div>
      </section>

      <section
        aria-labelledby="adherence"
        class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-5 space-y-4"
      >
        <h2 id="adherence" class="text-[13.5px] font-semibold text-(--text-primary)">Adherence</h2>

        <div>
          <div class="flex items-baseline justify-between mb-1.5">
            <span class="text-[11.5px] text-(--text-secondary)">Check-in submission</span>
            <span v-if="submissionRate" class="text-[11.5px] font-semibold tabular-nums text-(--text-primary)">
              {{ submissionRate.submitted }} / {{ submissionRate.expected }}
            </span>
          </div>
          <UProgress
            v-if="submissionRate"
            :model-value="submissionRate.pct"
            color="success"
            size="md"
          />
          <p v-if="submissionRate" class="mt-1 text-[10.5px] text-(--text-muted) tabular-nums">{{ submissionRate.pct }}% submitted</p>
          <p v-else class="text-[11.5px] text-(--text-muted)">No start date on file.</p>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-1 border-t border-(--border-muted)">
          <div>
            <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Streak</div>
            <div class="mt-1 text-[18px] font-semibold tabular-nums text-(--green-brand)">{{ streak || 0 }}</div>
            <div class="text-[10.5px] text-(--text-muted)">weeks in a row</div>
          </div>
          <div v-if="programLabel">
            <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Program</div>
            <div class="mt-1 text-[13px] font-semibold tabular-nums text-(--text-primary)">{{ programLabel }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
