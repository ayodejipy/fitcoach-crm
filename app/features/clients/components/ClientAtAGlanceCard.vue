<script setup lang="ts">
defineProps<{
  clientFirstName: string
  weight: number | null
  weightDelta: number | null
  avgEnergy: number | null
  streak: number
  checkInsCount: number
}>()

defineEmits<{
  seeFullStats: []
}>()

const { unit: weightUnit } = useWeightUnit()
</script>

<template>
  <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-5">
    <h3 class="text-[12px] font-semibold uppercase tracking-wide text-(--text-muted) mb-3">At a glance</h3>

    <p v-if="checkInsCount === 0" class="text-[12.5px] text-(--text-secondary) leading-relaxed">
      No check-ins yet. Stats appear here once {{ clientFirstName }} submits their first.
    </p>

    <template v-else>
      <div class="space-y-3">
        <div v-if="weight != null">
          <div class="text-[10.5px] text-(--text-muted) uppercase tracking-wide">Current weight</div>
          <div class="mt-0.5 flex items-baseline gap-1.5">
            <span class="text-[18px] font-semibold tabular-nums">{{ weight }}</span>
            <span class="text-[11px] text-(--text-muted)">{{ weightUnit }}</span>
            <span
              v-if="weightDelta != null"
              class="text-[10.5px] tabular-nums"
              :class="weightDelta < 0 ? 'text-(--green-brand)' : 'text-(--text-muted)'"
            >
              {{ weightDelta < 0 ? '↓' : '↑' }} {{ Math.abs(weightDelta).toFixed(1) }}
            </span>
          </div>
        </div>
        <div v-if="avgEnergy != null">
          <div class="text-[10.5px] text-(--text-muted) uppercase tracking-wide">Avg energy</div>
          <div class="mt-0.5 flex items-baseline gap-1.5">
            <span class="text-[18px] font-semibold tabular-nums">{{ avgEnergy }}</span>
            <span class="text-[11px] text-(--text-muted)">/10 · {{ checkInsCount }} check-ins</span>
          </div>
        </div>
        <div v-if="streak > 0">
          <div class="text-[10.5px] text-(--text-muted) uppercase tracking-wide">Streak</div>
          <div class="mt-0.5 flex items-baseline gap-1.5">
            <span class="text-[18px] font-semibold tabular-nums">{{ streak }}</span>
            <span class="text-[11px] text-(--text-muted)">{{ streak === 1 ? 'week' : 'weeks' }} in a row</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="mt-4 inline-block text-[11.5px] font-medium text-(--green-brand) hover:underline"
        @click="$emit('seeFullStats')"
      >
        See full stats →
      </button>
    </template>
  </div>
</template>
