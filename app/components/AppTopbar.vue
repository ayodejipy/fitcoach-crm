<script setup lang="ts">
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

      <button
        type="button"
        class="relative inline-flex h-7 w-7 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg-subtle) hover:text-(--text-primary)"
        aria-label="Notifications"
      >
        <UIcon name="i-lucide-bell" class="size-3.5" />
        <span
          v-if="false"
          class="absolute -top-0.5 -right-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-(--green-brand) text-[8.5px] font-bold tabular-nums text-white"
        >3</span>
      </button>
    </div>
  </header>
</template>
