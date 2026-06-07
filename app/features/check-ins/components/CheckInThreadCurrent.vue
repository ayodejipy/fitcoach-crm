<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import CheckInResponseComposer from './CheckInResponseComposer.vue'
import { fmtRelative } from '~/utils/format'
import type { ModelsCoachCheckIn } from '~/services'

defineProps<{
  checkIn: ModelsCoachCheckIn
  weekNumber: number
  clientName: string
  initialDraft?: string
  sending?: boolean
}>()

defineEmits<{
  send: [text: string]
  saveDraft: [text: string]
}>()

const { unit: weightUnit } = useWeightUnit()

function formatSubmittedAt(iso: string): string {
  return format(parseISO(iso), 'EEE, MMM d · h:mm a')
}
</script>

<template>
  <article
    class="rounded-[10px] border border-(--green-soft) bg-(--bg-surface) shadow-[0_0_0_1px_var(--green-soft)] overflow-hidden"
  >
    <header class="flex items-center justify-between border-b border-(--green-soft) bg-(--green-pale) px-5 py-3 gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <span class="text-[13px] font-semibold text-(--text-primary)">Wk {{ weekNumber }} check-in</span>
        <span v-if="checkIn.submitted_at" class="text-[11.5px] text-(--text-muted) tabular-nums">
          · {{ formatSubmittedAt(checkIn.submitted_at) }}
        </span>
      </div>
      <div v-if="checkIn.submitted_at" class="text-[11.5px] text-(--green-brand)">
        Submitted {{ fmtRelative(checkIn.submitted_at) }}
      </div>
    </header>

    <div class="grid grid-cols-4 px-5 py-4 max-md:grid-cols-2">
      <div class="px-2 border-r border-(--border-muted) max-md:border-r-0 max-md:border-b max-md:pb-3">
        <div class="text-[10px] text-(--text-muted) uppercase tracking-wide">Energy</div>
        <div class="mt-1 flex items-baseline gap-1">
          <span class="text-[18px] font-semibold tabular-nums text-(--green-brand)">{{ checkIn.energy_score ?? '—' }}</span>
          <span v-if="checkIn.energy_score != null" class="text-[10.5px] text-(--text-muted)">/10</span>
        </div>
      </div>
      <div class="px-2 border-r border-(--border-muted) max-md:border-r-0 max-md:border-b max-md:pb-3">
        <div class="text-[10px] text-(--text-muted) uppercase tracking-wide">Sleep</div>
        <div class="mt-1 flex items-baseline gap-1">
          <span class="text-[18px] font-semibold tabular-nums">{{ checkIn.sleep_hrs ?? '—' }}</span>
          <span v-if="checkIn.sleep_hrs != null" class="text-[10.5px] text-(--text-muted)">hrs</span>
        </div>
      </div>
      <div class="px-2 border-r border-(--border-muted) max-md:border-r-0 max-md:border-b max-md:pb-3 max-md:pt-3 max-md:border-t">
        <div class="text-[10px] text-(--text-muted) uppercase tracking-wide">Weight</div>
        <div class="mt-1 flex items-baseline gap-1">
          <span class="text-[18px] font-semibold tabular-nums">{{ checkIn.weight ?? '—' }}</span>
          <span v-if="checkIn.weight != null" class="text-[10.5px] text-(--text-muted)">{{ weightUnit }}</span>
        </div>
      </div>
      <div class="px-2 max-md:pt-3 max-md:border-t max-md:border-(--border-muted)">
        <div class="text-[10px] text-(--text-muted) uppercase tracking-wide">Mood</div>
        <div class="mt-1 flex items-baseline gap-1">
          <span class="text-[18px] font-semibold tabular-nums">{{ checkIn.mood_score ?? '—' }}</span>
          <span v-if="checkIn.mood_score != null" class="text-[10.5px] text-(--text-muted)">/10</span>
        </div>
      </div>
    </div>

    <div v-if="checkIn.notes" class="border-t border-(--border-muted) px-5 py-4">
      <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-2">Client's note</div>
      <blockquote class="border-l-2 border-(--green-brand) pl-3 italic text-[13px] text-(--text-primary)">
        "{{ checkIn.notes }}"
      </blockquote>
    </div>

    <CheckInResponseComposer
      :client-name="clientName"
      :initial-draft="initialDraft || checkIn.response_draft"
      :sending="sending"
      @send="$emit('send', $event)"
      @save-draft="$emit('saveDraft', $event)"
    />
  </article>
</template>
