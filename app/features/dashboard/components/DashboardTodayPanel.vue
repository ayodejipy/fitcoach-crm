<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import EmptyState from '~/components/EmptyState.vue'
import type { AvatarVariant } from '~/utils/client'

type SessionStatus = 'virtual' | 'confirmed' | 'pending'

defineProps<{
  sessions: Array<{
    id?: string
    time: string
    period: string
    initials: string
    variant: AvatarVariant
    name: string
    meta: string
    status: SessionStatus
    statusLabel: string
  }>
  completedCount?: number
}>()

defineEmits<{
  confirm: [id: string]
  schedule: []
}>()

const statusBadge = (status: SessionStatus): { color: 'success' | 'warning' | 'info', variant: 'soft' } => ({
  confirmed: { color: 'success', variant: 'soft' },
  pending: { color: 'warning', variant: 'soft' },
  virtual: { color: 'info', variant: 'soft' },
}[status])
</script>

<template>
  <section
    aria-labelledby="today-panel-heading"
    class="rounded-[10px] border border-(--border) bg-(--bg-surface)"
  >
    <header class="flex items-center justify-between border-b border-(--border) px-5 py-3">
      <div>
        <h3 id="today-panel-heading" class="text-[13.5px] font-semibold text-(--text-primary)">
          Today's sessions
        </h3>
        <p class="mt-0.5 text-[11px] text-(--text-muted)">
          {{ sessions.length }} booked
          <span v-if="completedCount != null"> · {{ completedCount }} completed</span>
        </p>
      </div>
      <NuxtLink
        to="/schedule"
        class="text-[11.5px] text-(--text-secondary) hover:text-(--text-primary) no-underline"
      >
        Calendar →
      </NuxtLink>
    </header>

    <div v-if="sessions.length" class="p-2">
      <div
        v-for="session in sessions"
        :key="session.id ?? session.name + session.time"
        class="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-(--bg-subtle)"
      >
        <div class="flex flex-col items-center w-12 shrink-0 border-r border-(--border) pr-3">
          <span class="text-[12.5px] font-semibold uppercase tabular-nums" :class="session.status === 'pending' ? 'text-(--warning)' : 'text-(--green-brand)'">
            {{ session.time }}
          </span>
          <span class="text-[9.5px] text-(--text-muted)">{{ session.period }}</span>
        </div>
        <Avatar :initials="session.initials" :variant="session.variant" :size="28" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-[13px] font-semibold text-(--text-primary) truncate">{{ session.name }}</span>
            <UBadge
              :label="session.statusLabel"
              :color="statusBadge(session.status).color"
              :variant="statusBadge(session.status).variant"
              size="sm"
            />
          </div>
          <div class="mt-0.5 text-[11.5px] text-(--text-muted) truncate">{{ session.meta }}</div>
        </div>
        <UButton
          v-if="session.status === 'pending'"
          color="primary"
          size="sm"
          @click="$emit('confirm', session.id ?? '')"
        >
          Confirm
        </UButton>
      </div>
    </div>

    <EmptyState
      v-else
      icon="i-lucide-calendar-x-2"
      headline="No sessions today"
      hint="Your calendar is clear. Schedule a session with a client to get started."
      cta="Schedule session"
      @cta="$emit('schedule')"
    />
  </section>
</template>
