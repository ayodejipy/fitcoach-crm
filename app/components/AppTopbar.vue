<script setup lang="ts">
import NotificationsPopover from '~/features/notifications/components/NotificationsPopover.vue'

defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <header
    class="sticky top-0 z-20 bg-(--bg-surface) border-b border-(--border) px-6 flex items-center justify-between"
    :style="{ height: 'var(--topbar-h)' }"
  >
    <div class="flex items-center gap-3 min-w-0">
      <slot name="title">
        <h1 class="text-[14px] font-semibold text-(--text-primary) tracking-[-0.01em] truncate">{{ title }}</h1>
        <template v-if="subtitle">
          <span class="text-[12px] text-(--text-muted)">·</span>
          <span class="text-[12px] text-(--text-muted) tabular-nums truncate">{{ subtitle }}</span>
        </template>
      </slot>
    </div>

    <div class="flex items-center gap-2">
      <slot name="actions" />

      <div v-if="$slots.actions" class="mx-1 h-5 w-px bg-(--border)" />

      <NotificationsPopover />
    </div>
  </header>
</template>
