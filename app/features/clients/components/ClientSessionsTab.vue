<script setup lang="ts">
import { format, parseISO, isPast, isToday } from 'date-fns'
import type { ModelsCoachSession } from '~/services'

const props = defineProps<{
  sessions: ModelsCoachSession[]
  clientName: string
}>()

defineEmits<{
  bookSession: []
}>()

interface GroupedSessions {
  upcoming: ModelsCoachSession[]
  past: ModelsCoachSession[]
}

const grouped = computed<GroupedSessions>(() => {
  const upcoming: ModelsCoachSession[] = []
  const past: ModelsCoachSession[] = []
  for (const session of props.sessions) {
    if (!session.starts_at) continue
    if (isPast(parseISO(session.starts_at)) && !isToday(parseISO(session.starts_at))) {
      past.push(session)
    } else {
      upcoming.push(session)
    }
  }
  upcoming.sort((a, b) => parseISO(a.starts_at!).getTime() - parseISO(b.starts_at!).getTime())
  past.sort((a, b) => parseISO(b.starts_at!).getTime() - parseISO(a.starts_at!).getTime())
  return { upcoming, past }
})

function sessionLocation(session: ModelsCoachSession): { icon: string, label: string } {
  if (session.zoom_link) return { icon: 'i-lucide-video', label: 'Virtual' }
  if (session.session_type === 'group') return { icon: 'i-lucide-users', label: 'Group' }
  return { icon: 'i-lucide-map-pin', label: 'In-person' }
}

function statusTone(session: ModelsCoachSession): { color: 'success' | 'warning' | 'neutral', label: string } {
  if (session.confirmed) return { color: 'success', label: 'Confirmed' }
  return { color: 'warning', label: 'Awaiting client' }
}
</script>

<template>
  <div class="space-y-6">
    <section v-if="grouped.upcoming.length" aria-labelledby="upcoming-sessions">
      <div class="flex items-center justify-between mb-3">
        <h2 id="upcoming-sessions" class="text-[12px] font-semibold uppercase tracking-wide text-(--text-muted)">
          Upcoming · {{ grouped.upcoming.length }}
        </h2>
        <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-calendar-plus" @click="$emit('bookSession')">
          Book session
        </UButton>
      </div>
      <ul class="rounded-[10px] border border-(--border) bg-(--bg-surface) divide-y divide-(--border-muted)">
        <li
          v-for="session in grouped.upcoming"
          :key="session.id"
          class="flex items-center gap-4 px-4 py-3.5"
        >
          <div class="text-center shrink-0 w-[52px]">
            <div class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted)">
              {{ format(parseISO(session.starts_at!), 'MMM') }}
            </div>
            <div class="text-[20px] font-semibold tabular-nums text-(--text-primary) leading-tight">
              {{ format(parseISO(session.starts_at!), 'd') }}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[13px] font-semibold text-(--text-primary) truncate">
              {{ session.title || `Session with ${clientName}` }}
            </div>
            <div class="text-[11.5px] text-(--text-muted) mt-0.5 tabular-nums flex items-center gap-2 flex-wrap">
              <span>{{ format(parseISO(session.starts_at!), 'EEEE · h:mm a') }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ session.duration_mins ?? 60 }} min</span>
              <span aria-hidden="true">·</span>
              <span class="inline-flex items-center gap-1">
                <UIcon :name="sessionLocation(session).icon" class="size-3" />
                {{ sessionLocation(session).label }}
              </span>
            </div>
          </div>
          <UBadge
            :label="statusTone(session).label"
            :color="statusTone(session).color"
            variant="soft"
            size="sm"
          />
        </li>
      </ul>
    </section>

    <section v-if="grouped.past.length" aria-labelledby="past-sessions">
      <h2 id="past-sessions" class="text-[12px] font-semibold uppercase tracking-wide text-(--text-muted) mb-3">
        Past · {{ grouped.past.length }}
      </h2>
      <ul class="rounded-[10px] border border-(--border) bg-(--bg-surface) divide-y divide-(--border-muted)">
        <li
          v-for="session in grouped.past"
          :key="session.id"
          class="flex items-center gap-4 px-4 py-3 text-(--text-secondary)"
        >
          <div class="text-[11.5px] tabular-nums shrink-0 w-[100px]">
            {{ format(parseISO(session.starts_at!), 'MMM d') }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[12.5px] font-medium truncate">{{ session.title || `Session with ${clientName}` }}</div>
            <div class="text-[10.5px] text-(--text-muted) mt-0.5">
              {{ format(parseISO(session.starts_at!), 'h:mm a') }} · {{ session.duration_mins ?? 60 }} min · {{ sessionLocation(session).label }}
            </div>
          </div>
          <span class="text-[10.5px] text-(--text-muted)">Completed</span>
        </li>
      </ul>
    </section>

    <div
      v-if="!grouped.upcoming.length && !grouped.past.length"
      class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-10 text-center"
    >
      <UIcon name="i-lucide-calendar" class="size-7 text-(--text-muted) mb-2 inline-block" />
      <p class="text-[13.5px] font-medium text-(--text-secondary)">No sessions yet</p>
      <p class="mt-1 text-[12px] text-(--text-muted)">Book a first session to start tracking together.</p>
      <UButton color="primary" size="sm" icon="i-lucide-calendar-plus" class="mt-4" @click="$emit('bookSession')">
        Book first session
      </UButton>
    </div>
  </div>
</template>
