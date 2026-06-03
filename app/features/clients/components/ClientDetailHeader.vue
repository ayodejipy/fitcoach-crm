<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import type { AvatarVariant } from '~/utils/client'

defineProps<{
  initials: string
  variant: AvatarVariant
  name: string
  email?: string
  goal?: string
  startedLabel?: string | null
  program?: { week: number, total: number, pct: number } | null
}>()
</script>

<template>
  <div class="flex items-start gap-4">
    <Avatar :initials="initials" :variant="variant" :size="48" />
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2 flex-wrap">
        <h1 class="text-[20px] font-semibold tracking-[-0.01em] text-(--text-primary)">{{ name }}</h1>
        <span v-if="email" class="text-[12.5px] text-(--text-muted) truncate">· {{ email }}</span>
      </div>
      <div class="mt-1.5 flex items-center gap-3 text-[12px] text-(--text-secondary) flex-wrap">
        <span v-if="goal" class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-target" class="size-3" />
          {{ goal }}
        </span>
        <template v-if="startedLabel">
          <span aria-hidden="true" class="text-(--text-muted)">·</span>
          <span class="tabular-nums">Started {{ startedLabel }}</span>
        </template>
        <template v-if="program">
          <span aria-hidden="true" class="text-(--text-muted)">·</span>
          <span class="tabular-nums">{{ program.total }}-week program</span>
        </template>
      </div>
      <div v-if="program" class="mt-3 flex items-center gap-3">
        <div class="flex-1 max-w-[400px] h-1.5 rounded-full overflow-hidden bg-(--bg-subtle)">
          <div class="h-full rounded-full bg-(--green-brand)" :style="{ width: `${program.pct}%` }" />
        </div>
        <span class="text-[11.5px] tabular-nums text-(--text-secondary)">
          Week {{ program.week }} of {{ program.total }} · {{ program.pct }}%
        </span>
      </div>
    </div>
  </div>
</template>
