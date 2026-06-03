<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { fmtRelative } from '~/utils/format'
import type { ModelsCoachCheckIn } from '~/services'

defineProps<{
  checkIn: ModelsCoachCheckIn
  weekNumber: number
}>()
</script>

<template>
  <details class="rounded-[10px] border border-(--border) bg-(--bg-surface)">
    <summary class="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-(--bg-subtle) gap-3 flex-wrap">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-chevron-right" class="size-3 text-(--text-muted)" />
        <span class="text-[12.5px] font-semibold text-(--text-primary)">Wk {{ weekNumber }} check-in</span>
        <span v-if="checkIn.submitted_at" class="text-[11px] text-(--text-muted) tabular-nums">
          · {{ format(parseISO(checkIn.submitted_at), 'EEE, MMM d') }}
        </span>
        <span aria-hidden="true" class="text-[10.5px] text-(--text-muted)">·</span>
        <span class="text-[10.5px] tabular-nums text-(--text-secondary)">
          <span v-if="checkIn.energy_score != null"><span class="text-(--text-muted)">E</span> {{ checkIn.energy_score }}</span>
          <span v-if="checkIn.sleep_hrs != null"> · <span class="text-(--text-muted)">S</span> {{ checkIn.sleep_hrs }}h</span>
          <span v-if="checkIn.weight_lbs != null"> · <span class="text-(--text-muted)">W</span> {{ checkIn.weight_lbs }} lbs</span>
        </span>
      </div>
      <span class="text-[11px] text-(--text-muted)">
        {{ checkIn.coach_response ? 'Responded' : 'No response' }}
      </span>
    </summary>
    <div class="border-t border-(--border-muted) px-5 py-4">
      <div class="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <div>
          <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-1.5">Client's note</div>
          <blockquote
            v-if="checkIn.notes"
            class="border-l-2 border-(--border-strong) pl-3 italic text-[12.5px] text-(--text-secondary)"
          >
            "{{ checkIn.notes }}"
          </blockquote>
          <p v-else class="text-[12px] text-(--text-muted) italic">No note submitted this week.</p>
        </div>
        <div v-if="checkIn.coach_response">
          <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-1.5">
            Your response<span v-if="checkIn.responded_at"> · {{ fmtRelative(checkIn.responded_at) }}</span>
          </div>
          <div class="rounded-md border border-(--green-soft) bg-(--green-pale) p-3 text-[12.5px] text-(--text-secondary)">
            "{{ checkIn.coach_response }}"
          </div>
        </div>
      </div>
    </div>
  </details>
</template>
