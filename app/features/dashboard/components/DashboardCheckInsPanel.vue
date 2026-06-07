<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import EmptyState from '~/components/EmptyState.vue'
import type { AvatarVariant } from '~/utils/client'

defineProps<{
  checkIns: Array<{
    id?: string
    initials: string
    variant: AvatarVariant
    name: string
    weekLabel?: string
    quote?: string
    energy?: number | null
    weight?: number | null
    sleepHours?: number | null
    unread: boolean
  }>
  oldestUnreadDays?: number | null
}>()

defineEmits<{
  respond: [id: string]
}>()

const { unit: weightUnit } = useWeightUnit()
</script>

<template>
  <section
    aria-labelledby="checkins-panel-heading"
    class="rounded-[10px] border border-(--border) bg-(--bg-surface)"
  >
    <header class="flex items-center justify-between border-b border-(--border) px-5 py-3">
      <div>
        <h3 id="checkins-panel-heading" class="text-[13.5px] font-semibold text-(--text-primary)">
          Pending check-ins
        </h3>
        <p class="mt-0.5 text-[11px] text-(--text-muted)">
          {{ checkIns.length }} unread<span v-if="oldestUnreadDays"> · oldest {{ oldestUnreadDays }}d</span>
        </p>
      </div>
      <NuxtLink
        to="/check-ins"
        class="text-[11.5px] text-(--text-secondary) hover:text-(--text-primary) no-underline"
      >
        All →
      </NuxtLink>
    </header>

    <div v-if="checkIns.length" class="p-2">
      <div
        v-for="entry in checkIns"
        :key="entry.id ?? entry.name"
        class="flex items-start gap-3 rounded-md px-3 py-3 hover:bg-(--bg-subtle)"
      >
        <span
          v-if="entry.unread"
          aria-label="Unread"
          class="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-(--green-brand)"
        />
        <Avatar :initials="entry.initials" :variant="entry.variant" :size="28" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[13px] font-semibold text-(--text-primary)">{{ entry.name }}</span>
            <span v-if="entry.weekLabel" class="text-[11px] text-(--text-muted) tabular-nums">{{ entry.weekLabel }}</span>
          </div>
          <p v-if="entry.quote" class="mt-1 text-[12.5px] text-(--text-secondary) leading-snug line-clamp-2">
            "{{ entry.quote }}"
          </p>
          <div class="mt-1.5 flex items-center gap-3 text-[10.5px] text-(--text-muted) tabular-nums flex-wrap">
            <span v-if="entry.energy != null" class="text-(--green-brand) font-medium">
              Energy {{ entry.energy }}/10
            </span>
            <span v-if="entry.weight != null">· {{ entry.weight }} {{ weightUnit }}</span>
            <span v-if="entry.sleepHours != null">· Sleep {{ entry.sleepHours }}h</span>
          </div>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          @click="$emit('respond', entry.id ?? '')"
        >
          Respond
        </UButton>
      </div>
    </div>

    <EmptyState
      v-else
      icon="i-lucide-inbox"
      headline="All caught up"
      hint="No check-ins waiting for your response. You're doing great."
      cta="View all check-ins"
      cta-to="/check-ins"
    />
  </section>
</template>
