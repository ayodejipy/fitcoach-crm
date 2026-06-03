<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'

withDefaults(defineProps<{
  time: string
  initials: string
  variant: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
  name: string
  type: string
  status: 'confirmed' | 'pending'
  today?: boolean
  past?: boolean
}>(), {
  today: false,
  past: false,
})
</script>

<template>
  <div
    class="flex items-center gap-2.5 px-4 py-2.5 border-b border-(--border-muted) last:border-b-0 hover:bg-(--bg-subtle) transition-colors"
    :class="{ 'bg-(--bg-primary-soft)/40': today }"
  >
    <span
      class="text-[12px] font-semibold tabular-nums w-[44px] shrink-0"
      :class="past ? 'text-(--text-muted) line-through decoration-(--text-muted)/40' : 'text-(--green-brand)'"
    >{{ time }}</span>

    <Avatar :initials="initials" :variant="variant" :size="28" />

    <div class="flex-1 min-w-0">
      <div class="text-[12.5px] font-semibold text-(--text-primary) truncate">{{ name }}</div>
      <div class="text-[11px] text-(--text-secondary) mt-px truncate">{{ type }}</div>
    </div>

    <span
      class="text-[10px] font-semibold py-0.5 px-1.5 rounded shrink-0"
      :class="status === 'confirmed'
        ? 'bg-(--green-pale) text-(--green-brand)'
        : 'bg-(--warning-soft) text-(--warning)'"
      :aria-label="status === 'confirmed' ? 'Confirmed' : 'Pending'"
    >{{ status === 'confirmed' ? '✓' : '?' }}</span>
  </div>
</template>
