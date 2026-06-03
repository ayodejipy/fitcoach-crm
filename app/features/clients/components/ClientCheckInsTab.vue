<script setup lang="ts">
import { format, parseISO, differenceInDays } from 'date-fns'
import type { ModelsCoachCheckIn } from '~/services'

const props = defineProps<{
  checkIns: ModelsCoachCheckIn[]
  startDate: string | null
}>()

defineEmits<{
  open: [id: string]
}>()

const sorted = computed(() =>
  [...props.checkIns]
    .filter(ci => ci.submitted_at)
    .sort((a, b) => parseISO(b.submitted_at!).getTime() - parseISO(a.submitted_at!).getTime()),
)

function weekNumber(ci: ModelsCoachCheckIn): number {
  if (!props.startDate || !ci.submitted_at) return 0
  return Math.max(1, Math.floor(differenceInDays(parseISO(ci.submitted_at), parseISO(props.startDate)) / 7) + 1)
}

function statusBadge(ci: ModelsCoachCheckIn): { color: 'success' | 'warning' | 'neutral', label: string } {
  if (!ci.is_read) return { color: 'success', label: 'New' }
  if (ci.responded_at) return { color: 'neutral', label: 'Responded' }
  return { color: 'warning', label: 'Read' }
}

const unreadCount = computed(() => sorted.value.filter(ci => !ci.is_read).length)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <p class="text-[12px] text-(--text-muted)">
        {{ sorted.length }} total
        <template v-if="unreadCount"> · <span class="text-(--green-brand) font-semibold">{{ unreadCount }} new</span></template>
      </p>
    </div>

    <div
      v-if="!sorted.length"
      class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-10 text-center"
    >
      <UIcon name="i-lucide-clipboard-list" class="size-7 text-(--text-muted) mb-2 inline-block" />
      <p class="text-[13.5px] font-medium text-(--text-secondary)">No check-ins yet</p>
      <p class="mt-1 text-[12px] text-(--text-muted)">Submissions appear here once your client checks in.</p>
    </div>

    <ul v-else class="rounded-[10px] border border-(--border) bg-(--bg-surface) divide-y divide-(--border-muted)" role="list">
      <li
        v-for="ci in sorted"
        :key="ci.id"
        class="hover:bg-(--bg-subtle) transition-colors"
      >
        <button
          type="button"
          class="w-full flex items-center gap-4 px-4 py-3.5 text-left"
          :aria-label="`Open check-in for week ${weekNumber(ci)}`"
          @click="$emit('open', ci.id!)"
        >
          <span
            v-if="!ci.is_read"
            aria-hidden="true"
            class="h-2 w-2 rounded-full bg-(--green-brand) shrink-0"
          />
          <span v-else aria-hidden="true" class="w-2 shrink-0" />

          <div class="text-center shrink-0 w-[42px]">
            <div class="text-[9.5px] font-semibold uppercase tracking-wide text-(--text-muted)">Wk</div>
            <div class="text-[16px] font-semibold tabular-nums text-(--text-primary) leading-tight">{{ weekNumber(ci) }}</div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-3 flex-wrap mb-0.5">
              <span class="text-[12.5px] font-semibold text-(--text-primary)" :class="{ 'font-semibold': !ci.is_read }">
                {{ format(parseISO(ci.submitted_at!), 'EEE · MMM d') }}
              </span>
              <UBadge :label="statusBadge(ci).label" :color="statusBadge(ci).color" variant="soft" size="sm" />
            </div>
            <div class="text-[11.5px] tabular-nums text-(--text-secondary) flex items-center gap-3 flex-wrap">
              <span v-if="ci.energy_score != null"><span class="text-(--text-muted)">E</span> {{ ci.energy_score }}/10</span>
              <span v-if="ci.mood_score != null"><span class="text-(--text-muted)">M</span> {{ ci.mood_score }}/10</span>
              <span v-if="ci.sleep_hrs != null"><span class="text-(--text-muted)">S</span> {{ ci.sleep_hrs }}h</span>
              <span v-if="ci.weight_lbs != null"><span class="text-(--text-muted)">W</span> {{ ci.weight_lbs }} lbs</span>
            </div>
            <p v-if="ci.notes" class="mt-1 text-[11.5px] italic text-(--text-secondary) truncate">"{{ ci.notes }}"</p>
          </div>

          <UIcon name="i-lucide-chevron-right" class="size-4 text-(--text-muted) shrink-0" />
        </button>
      </li>
    </ul>
  </div>
</template>
