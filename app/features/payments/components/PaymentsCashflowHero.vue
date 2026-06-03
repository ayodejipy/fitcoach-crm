<script setup lang="ts">
import { moneyParts, type MonthBar } from '../utils/format'

defineProps<{
  bars: MonthBar[]
  totalCents: number
  trendLabel?: string
  paidThisMonthCents: number
  paidThisMonthDelta?: string | null
  outstandingCents: number
  outstandingCount: number
  outstandingOverdue: number
  avgPerClientCents: number
  activeClients: number
}>()

const range = ref<'6M' | '1Y' | 'ALL'>('6M')
</script>

<template>
  <section
    aria-label="Cashflow summary"
    class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden"
  >
    <div class="grid grid-cols-[1fr_320px] max-lg:grid-cols-1">
      <div class="p-6 border-r border-(--border) max-lg:border-r-0 max-lg:border-b">
        <div class="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">
              Revenue · last {{ range === '6M' ? '6 months' : range === '1Y' ? 'year' : 'all-time' }}
            </div>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-[26px] font-semibold tabular-nums tracking-tight">
                {{ moneyParts(totalCents).symbol }}{{ moneyParts(totalCents).amount }}
              </span>
              <span v-if="trendLabel" class="text-[11.5px] tabular-nums text-(--green-brand)">
                {{ trendLabel }}
              </span>
            </div>
          </div>
          <div role="tablist" class="flex items-center gap-1">
            <button
              v-for="opt in (['6M', '1Y', 'ALL'] as const)"
              :key="opt"
              role="tab"
              :aria-selected="range === opt"
              type="button"
              class="rounded-md px-2 py-1 text-[11.5px]"
              :class="range === opt
                ? 'bg-(--bg-subtle) text-(--text-primary) font-medium'
                : 'text-(--text-secondary) hover:bg-(--bg-subtle)'"
              @click="range = opt"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div class="flex items-end gap-2 h-40" role="img" aria-label="Monthly revenue bars">
          <div
            v-for="bar in bars"
            :key="bar.monthKey"
            class="flex-1 flex flex-col items-center gap-1.5"
          >
            <div
              class="w-full rounded-t-md transition-colors"
              :class="bar.isCurrent ? 'bg-(--green-brand)' : 'bg-(--green-soft)'"
              :style="{ height: `${Math.max(4, bar.height)}%` }"
              :title="`${bar.label}: ${moneyParts(bar.cents).symbol}${moneyParts(bar.cents).amount}`"
            />
            <div
              class="text-[10px] tabular-nums"
              :class="bar.isCurrent ? 'font-semibold text-(--green-brand)' : 'text-(--text-muted)'"
            >
              {{ bar.label }}
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-3 text-[11px] text-(--text-muted) flex-wrap">
          <span class="inline-flex items-center gap-1.5">
            <span aria-hidden="true" class="h-2 w-3 rounded bg-(--green-brand)" />
            Paid revenue
          </span>
          <span aria-hidden="true">·</span>
          <span class="tabular-nums">
            Best: {{ bars.reduce((best, b) => b.cents > best.cents ? b : best, bars[0]!).label }}
            ({{ moneyParts(bars.reduce((best, b) => b.cents > best.cents ? b : best, bars[0]!).cents).symbol }}{{ moneyParts(bars.reduce((best, b) => b.cents > best.cents ? b : best, bars[0]!).cents).amount }})
          </span>
        </div>
      </div>

      <div class="p-6 bg-(--bg-subtle) space-y-5">
        <div>
          <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Paid this month</div>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-[10.5px] text-(--text-muted) tabular-nums">{{ moneyParts(paidThisMonthCents).symbol }}</span>
            <span class="text-[22px] font-semibold tabular-nums tracking-tight">{{ moneyParts(paidThisMonthCents).amount }}</span>
          </div>
          <div v-if="paidThisMonthDelta" class="text-[11px] tabular-nums mt-0.5 text-(--green-brand)">
            {{ paidThisMonthDelta }}
          </div>
        </div>
        <div>
          <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Outstanding</div>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-[10.5px] text-(--text-muted) tabular-nums">{{ moneyParts(outstandingCents).symbol }}</span>
            <span class="text-[22px] font-semibold tabular-nums tracking-tight">{{ moneyParts(outstandingCents).amount }}</span>
          </div>
          <div
            class="text-[11px] tabular-nums mt-0.5"
            :class="outstandingOverdue > 0 ? 'text-(--warning)' : 'text-(--text-muted)'"
          >
            {{ outstandingCount }} {{ outstandingCount === 1 ? 'invoice' : 'invoices' }}<span v-if="outstandingOverdue"> · {{ outstandingOverdue }} overdue</span>
          </div>
        </div>
        <div>
          <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Avg per client</div>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-[10.5px] text-(--text-muted) tabular-nums">{{ moneyParts(avgPerClientCents).symbol }}</span>
            <span class="text-[22px] font-semibold tabular-nums tracking-tight">{{ moneyParts(avgPerClientCents).amount }}</span>
          </div>
          <div class="text-[11px] mt-0.5 text-(--text-muted)">
            / month · {{ activeClients }} active {{ activeClients === 1 ? 'client' : 'clients' }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
