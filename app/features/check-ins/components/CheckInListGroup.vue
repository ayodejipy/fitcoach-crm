<script setup lang="ts">
defineProps<{
  label: string
  description: string
  count: number
  tone?: 'attention' | 'muted'
  startOpen?: boolean
}>()

const open = ref(true)
</script>

<template>
  <section class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden">
    <header
      class="flex items-center justify-between border-b border-(--border) px-5 py-2.5"
      :class="tone === 'attention' ? 'bg-(--green-pale)' : 'bg-(--bg-subtle)'"
    >
      <button
        type="button"
        class="flex items-center gap-2.5 text-left"
        :aria-expanded="open"
        @click="open = !open"
      >
        <UIcon
          :name="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
          class="size-3 text-(--text-muted)"
        />
        <span
          aria-hidden="true"
          class="h-1.5 w-1.5 rounded-full"
          :class="tone === 'attention' ? 'bg-(--green-brand)' : 'bg-(--text-muted)'"
        />
        <h3
          class="text-[13px] font-semibold"
          :class="tone === 'attention' ? 'text-(--text-primary)' : 'text-(--text-secondary)'"
        >
          {{ label }}
        </h3>
        <span
          class="rounded-full border bg-(--bg-surface) px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums"
          :class="tone === 'attention' ? 'border-(--green-soft) text-(--green-brand)' : 'border-(--border) text-(--text-muted)'"
        >
          {{ count }}
        </span>
      </button>
      <span class="text-[11px] text-(--text-muted)">{{ description }}</span>
    </header>

    <div v-show="open">
      <div v-if="count === 0" class="px-5 py-6 text-center text-[12px] text-(--text-muted)">
        Nothing here.
      </div>
      <div v-else class="divide-y divide-(--border-muted)">
        <slot />
      </div>
    </div>
  </section>
</template>
