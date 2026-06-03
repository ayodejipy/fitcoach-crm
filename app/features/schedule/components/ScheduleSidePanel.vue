<script setup lang="ts">
import { computed } from 'vue'
import UpcomingSessionItem from './UpcomingSessionItem.vue'
import WeekAtAGlance from './WeekAtAGlance.vue'

export interface UpcomingSession {
  time: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  type: string
  status: 'confirmed' | 'pending'
  today?: boolean
  past?: boolean
}

export interface UpcomingGroup {
  label: string
  items: UpcomingSession[]
}

const props = defineProps<{
  groupedSessions: UpcomingGroup[]
  confirmed: number
  total: number
  footerHint: string
  hours: string
  deltaSessions: string
}>()

const confirmPct = computed(() => props.total ? Math.round((props.confirmed / props.total) * 100) : 0)
const pendingCount = computed(() => props.total - props.confirmed)
</script>

<template>
  <aside class="w-[280px] shrink-0 sticky top-20 flex flex-col gap-3 max-lg:w-full max-lg:static" aria-label="This week summary">
    <section class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden">
      <header class="flex items-center justify-between px-4 py-3 border-b border-(--border-muted)">
        <h2 class="text-[12.5px] font-semibold text-(--text-primary)">This week</h2>
        <span class="text-[10.5px] text-(--text-muted) tabular-nums">{{ total }} session{{ total === 1 ? '' : 's' }}</span>
      </header>

      <div v-if="!groupedSessions.length" class="px-4 py-8 text-center">
        <UIcon name="i-lucide-calendar-x" class="size-5 text-(--text-muted) mb-1.5 inline-block" />
        <p class="text-[11.5px] text-(--text-muted)">No sessions scheduled this week.</p>
      </div>

      <div v-else>
        <template v-for="group in groupedSessions" :key="group.label">
          <div class="px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-(--text-secondary) bg-(--bg-subtle)/60 border-b border-(--border-muted)">
            {{ group.label }}
          </div>
          <UpcomingSessionItem
            v-for="session in group.items"
            :key="`${group.label}-${session.name}-${session.time}`"
            v-bind="session"
          />
        </template>
      </div>

      <footer class="px-4 py-3 border-t border-(--border-muted)">
        <div class="flex items-baseline justify-between text-[11.5px] mb-1.5">
          <span class="font-semibold text-(--text-primary) tabular-nums">{{ confirmed }} of {{ total }} confirmed</span>
          <span v-if="pendingCount > 0" class="text-(--text-muted) tabular-nums">{{ pendingCount }} pending</span>
        </div>
        <UProgress :model-value="confirmPct" color="success" size="sm" />
        <p v-if="footerHint" class="mt-2 text-[10.5px] text-(--text-muted)">{{ footerHint }}</p>
      </footer>
    </section>

    <WeekAtAGlance :sessions="total" :hours="hours" :delta-sessions="deltaSessions" />
  </aside>
</template>
