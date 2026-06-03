<script setup lang="ts">
defineProps<{
  sessions: number
  hours: string
  deltaSessions: string
}>()
</script>

<template>
  <div class="rounded-md border border-(--border) bg-(--bg-surface) p-4">
    <div class="text-[11.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-2.5">Week at a glance</div>
    <dl class="grid grid-cols-2 gap-2">
      <div class="rounded-md bg-(--bg-subtle) p-2.5">
        <dt class="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">Sessions</dt>
        <dd class="mt-1 text-[18px] font-semibold tabular-nums text-(--text-primary)">{{ sessions }}</dd>
        <p v-if="deltaSessions" class="text-[10.5px] text-(--green-brand) font-semibold mt-0.5">{{ deltaSessions }}</p>
      </div>
      <div class="rounded-md bg-(--bg-subtle) p-2.5">
        <dt class="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">Hours</dt>
        <dd class="mt-1 text-[18px] font-semibold tabular-nums text-(--text-primary)">{{ hours }}</dd>
        <p class="text-[10.5px] text-(--text-muted) mt-0.5">coaching hrs</p>
      </div>
    </dl>
  </div>
</template>
