<script setup lang="ts">
defineProps<{
  label: string
  dotClass: string
  description: string
  count: number
  emptyHint: string
  startOpen?: boolean
}>()

const open = ref(true)
</script>

<template>
  <section
    class="rounded-[10px] border border-(--border) bg-(--bg-surface) overflow-hidden"
    :aria-labelledby="`engagement-${label.toLowerCase().replace(/\s+/g, '-')}`"
  >
    <header
      class="flex items-center justify-between border-b border-(--border) bg-(--bg-subtle) px-5 py-2.5"
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
        <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full" :class="dotClass" />
        <h3 :id="`engagement-${label.toLowerCase().replace(/\s+/g, '-')}`" class="text-[13px] font-semibold text-(--text-primary)">
          {{ label }}
        </h3>
        <span class="rounded-full border border-(--border) bg-(--bg-surface) px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-(--text-secondary)">
          {{ count }}
        </span>
      </button>
      <span class="text-[11px] text-(--text-muted)">{{ description }}</span>
    </header>

    <div v-show="open">
      <div v-if="count === 0" class="px-5 py-6 text-center text-[12px] text-(--text-muted)">
        {{ emptyHint }}
      </div>
      <div v-else class="divide-y divide-(--border-muted)">
        <slot />
      </div>
    </div>
  </section>
</template>
