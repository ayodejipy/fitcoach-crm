<script setup lang="ts">
import { centsToStr } from '~/utils/format'

defineProps<{
  goal?: string
  email?: string
  phone?: string
  startedLabel?: string | null
  planName?: string
  planPriceCents?: number
}>()
</script>

<template>
  <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-5">
    <h3 class="text-[12px] font-semibold uppercase tracking-wide text-(--text-muted) mb-3">Profile</h3>
    <dl class="space-y-2 text-[12px]">
      <div v-if="goal" class="flex justify-between gap-3">
        <dt class="text-(--text-muted)">Goal</dt>
        <dd class="text-(--text-primary)">{{ goal }}</dd>
      </div>
      <div v-if="email" class="flex justify-between gap-3 min-w-0">
        <dt class="text-(--text-muted)">Email</dt>
        <dd class="truncate text-(--text-primary)">{{ email }}</dd>
      </div>
      <div v-if="phone" class="flex justify-between gap-3">
        <dt class="text-(--text-muted)">Phone</dt>
        <dd class="text-(--text-primary)">{{ phone }}</dd>
      </div>
      <div v-if="startedLabel" class="flex justify-between gap-3">
        <dt class="text-(--text-muted)">Started</dt>
        <dd class="tabular-nums text-(--text-primary)">{{ startedLabel }}</dd>
      </div>
      <div v-if="planName" class="flex justify-between gap-3">
        <dt class="text-(--text-muted)">Plan</dt>
        <dd class="text-(--text-primary)">{{ planName }}</dd>
      </div>
      <div v-if="planPriceCents" class="flex justify-between gap-3">
        <dt class="text-(--text-muted)">Price</dt>
        <dd class="tabular-nums text-(--text-primary)">${{ centsToStr(planPriceCents) }}/mo</dd>
      </div>
    </dl>
  </div>
</template>
