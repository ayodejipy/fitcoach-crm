<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import type { ModelsCoachSession } from '~/services'

defineProps<{
  session?: ModelsCoachSession
}>()
</script>

<template>
  <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-5">
    <h3 class="text-[12px] font-semibold uppercase tracking-wide text-(--text-muted) mb-3">Next session</h3>
    <div v-if="session?.starts_at" class="text-[12.5px]">
      <div class="font-semibold text-(--text-primary)">{{ session.title || 'Session' }}</div>
      <div class="mt-0.5 text-(--text-muted) tabular-nums">
        {{ format(parseISO(session.starts_at), 'EEE, MMM d · h:mm a') }}
      </div>
    </div>
    <div v-else class="text-[12.5px] text-(--text-muted)">Nothing scheduled</div>
    <UButton
      color="neutral"
      size="sm"
      icon="i-lucide-plus"
      class="mt-3 w-full"
      to="/schedule"
    >
      Book session
    </UButton>
  </div>
</template>
