<script setup lang="ts">
import { format } from 'date-fns'
import ClientNoteComposer from './ClientNoteComposer.vue'
import { fmtRelative } from '~/utils/format'
import type { TimelineEvent, TimelineGroup } from '../utils/timeline'

defineProps<{
  groups: TimelineGroup[]
  clientFirstName: string
  clientDisplayName: string
}>()

defineEmits<{
  saveNote: [text: string]
  respondCheckIn: [id: string]
  markRead: [id: string]
}>()

function eventIcon(event: TimelineEvent): string {
  if (event.kind === 'checkin') return 'i-lucide-check-square'
  if (event.kind === 'session') return 'i-lucide-calendar'
  if (event.kind === 'joined') return 'i-lucide-sparkles'
  return 'i-lucide-file-text'
}

function eventDotClass(event: TimelineEvent): string {
  if (event.kind === 'checkin' && !event.checkIn.is_read) return 'bg-(--green-soft) text-(--green-brand)'
  if (event.kind === 'joined') return 'bg-(--bg-subtle) text-(--green-brand)'
  return 'bg-(--bg-subtle) text-(--text-muted)'
}

function formatEventDateLong(date: Date): string {
  return format(date, 'EEE, MMM d')
}

function formatEventDateTime(date: Date): string {
  return format(date, 'EEE, MMM d · h:mm a')
}
</script>

<template>
  <div class="min-w-0 space-y-5">
    <ClientNoteComposer :client-name="clientFirstName" @save="$emit('saveNote', $event)" />

    <div v-if="groups.length === 0" class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-8 text-center">
      <UIcon name="i-lucide-clock" class="size-6 text-(--text-muted) mb-2 inline-block" />
      <p class="text-[13px] text-(--text-secondary)">No activity yet for {{ clientDisplayName }}.</p>
      <p class="mt-1 text-[11.5px] text-(--text-muted)">Check-ins and sessions will appear here once logged.</p>
    </div>

    <div v-for="group in groups" :key="group.label">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">{{ group.label }}</span>
        <div class="flex-1 h-px bg-(--border)" />
      </div>
      <div class="relative timeline-rail pl-12 space-y-4">
        <article v-for="event in group.events" :key="event.id" class="relative">
          <span
            aria-hidden="true"
            class="absolute left-[-46px] top-3 inline-flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-(--bg-page)"
            :class="eventDotClass(event)"
          >
            <UIcon :name="eventIcon(event)" class="size-3.5" />
          </span>

          <div
            v-if="event.kind === 'checkin' && !event.checkIn.is_read"
            class="rounded-[10px] border border-(--green-soft) bg-(--bg-surface) p-4 shadow-[0_0_0_1px_var(--green-soft)]"
          >
            <div class="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-[12.5px] font-semibold">Wk {{ event.weekNumber }} check-in</span>
                <UBadge label="Needs response" color="success" variant="soft" size="sm" />
              </div>
              <span class="text-[11px] text-(--text-muted) tabular-nums">{{ formatEventDateTime(event.date) }}</span>
            </div>
            <div class="grid grid-cols-4 gap-3 my-3 text-center max-md:grid-cols-2">
              <div class="rounded-md py-2 bg-(--bg-subtle)">
                <div class="text-[10px] text-(--text-muted) uppercase tracking-wide">Energy</div>
                <div class="mt-0.5 text-[13px] font-semibold tabular-nums text-(--green-brand)">
                  {{ event.checkIn.energy_score ?? '—' }}<span v-if="event.checkIn.energy_score" class="text-(--text-muted) font-normal">/10</span>
                </div>
              </div>
              <div class="rounded-md py-2 bg-(--bg-subtle)">
                <div class="text-[10px] text-(--text-muted) uppercase tracking-wide">Sleep</div>
                <div class="mt-0.5 text-[13px] font-semibold tabular-nums">
                  {{ event.checkIn.sleep_hrs ?? '—' }}<span v-if="event.checkIn.sleep_hrs" class="text-(--text-muted) font-normal"> hrs</span>
                </div>
              </div>
              <div class="rounded-md py-2 bg-(--bg-subtle)">
                <div class="text-[10px] text-(--text-muted) uppercase tracking-wide">Weight</div>
                <div class="mt-0.5 text-[13px] font-semibold tabular-nums">
                  {{ event.checkIn.weight_lbs ?? '—' }}<span v-if="event.checkIn.weight_lbs" class="text-(--text-muted) font-normal"> lbs</span>
                </div>
              </div>
              <div class="rounded-md py-2 bg-(--bg-subtle)">
                <div class="text-[10px] text-(--text-muted) uppercase tracking-wide">Mood</div>
                <div class="mt-0.5 text-[13px] font-semibold tabular-nums">
                  {{ event.checkIn.mood_score ?? '—' }}<span v-if="event.checkIn.mood_score" class="text-(--text-muted) font-normal">/10</span>
                </div>
              </div>
            </div>
            <blockquote v-if="event.checkIn.notes" class="border-l-2 border-(--green-brand) pl-3 italic text-[12.5px] text-(--text-secondary)">
              "{{ event.checkIn.notes }}"
            </blockquote>
            <div class="mt-3 flex items-center gap-2">
              <UButton color="primary" size="sm" @click="$emit('respondCheckIn', event.id)">Respond →</UButton>
              <UButton color="neutral" variant="outline" size="sm" @click="$emit('markRead', event.id)">Mark read</UButton>
            </div>
          </div>

          <div
            v-else-if="event.kind === 'checkin'"
            class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-4"
          >
            <div class="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-[12.5px] font-semibold">Wk {{ event.weekNumber }} check-in</span>
                <span v-if="event.checkIn.responded_at" class="text-[10.5px] text-(--text-muted)">
                  · Responded {{ fmtRelative(event.checkIn.responded_at) }}
                </span>
              </div>
              <span class="text-[11px] text-(--text-muted) tabular-nums">{{ formatEventDateLong(event.date) }}</span>
            </div>
            <div class="flex items-center gap-4 mb-2 text-[11.5px] tabular-nums text-(--text-secondary) flex-wrap">
              <span v-if="event.checkIn.energy_score != null"><span class="text-(--text-muted)">Energy:</span> {{ event.checkIn.energy_score }}/10</span>
              <span v-if="event.checkIn.sleep_hrs != null"><span class="text-(--text-muted)">Sleep:</span> {{ event.checkIn.sleep_hrs }} hrs</span>
              <span v-if="event.checkIn.weight_lbs != null"><span class="text-(--text-muted)">Weight:</span> {{ event.checkIn.weight_lbs }} lbs</span>
            </div>
            <blockquote v-if="event.checkIn.notes" class="border-l-2 border-(--border-strong) pl-3 italic text-[12.5px] text-(--text-secondary)">
              "{{ event.checkIn.notes }}"
            </blockquote>
          </div>

          <div
            v-else-if="event.kind === 'session'"
            class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-3.5"
          >
            <div class="flex items-baseline justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2 text-[12px]">
                <span class="font-semibold">{{ event.session.title || 'Session' }}</span>
                <span class="text-(--text-muted)">
                  <template v-if="event.session.duration_mins">· {{ event.session.duration_mins }} min</template>
                  <template v-if="event.session.zoom_link"> · virtual</template>
                  <template v-else> · in-person</template>
                </span>
              </div>
              <span class="text-[11px] text-(--text-muted) tabular-nums">{{ formatEventDateLong(event.date) }}</span>
            </div>
          </div>

          <div
            v-else-if="event.kind === 'joined'"
            class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-3.5"
          >
            <span class="text-[12px]">
              <span class="font-semibold">{{ event.clientName }}</span>
              <span class="text-(--text-muted)"> joined the program · </span>
              <span class="text-(--text-muted) tabular-nums">{{ format(event.date, 'MMM d, yyyy') }}</span>
            </span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-rail::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border);
}
</style>
