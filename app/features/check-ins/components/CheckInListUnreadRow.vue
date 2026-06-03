<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import type { AvatarVariant } from '~/utils/client'
import type { MetricChip } from '../utils/groups'

defineProps<{
  id: string
  initials: string
  variant: AvatarVariant
  name: string
  weekLabel: string
  relativeLabel: string
  preview?: string | null
  unread: boolean
  chips: MetricChip[]
}>()

defineEmits<{
  markRead: [id: string]
  respond: [id: string]
}>()

const chipClass = (tone: MetricChip['tone']) => ({
  good:    'bg-(--green-soft) text-(--green-brand)',
  warning: 'bg-(--warning-soft) text-(--warning)',
  neutral: 'bg-(--bg-subtle) text-(--text-secondary)',
}[tone])
</script>

<template>
  <NuxtLink
    :to="`/check-ins/${id}`"
    class="group flex items-start gap-4 px-5 py-4 hover:bg-(--bg-subtle) focus-visible:bg-(--bg-subtle) no-underline outline-none"
  >
    <span
      aria-hidden="true"
      class="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
      :class="unread ? 'bg-(--green-brand)' : 'opacity-0'"
    />
    <Avatar :initials="initials" :variant="variant" :size="36" />
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[13.5px] font-semibold text-(--text-primary)">{{ name }}</span>
        <span class="text-[11.5px] text-(--text-muted) tabular-nums">· {{ weekLabel }}</span>
        <span class="text-[11px] text-(--text-muted) tabular-nums ml-auto">{{ relativeLabel }}</span>
      </div>
      <p v-if="preview" class="mt-1 text-[12.5px] text-(--text-secondary) leading-snug line-clamp-1">
        {{ preview }}
      </p>
      <div v-if="chips.length" class="mt-2 flex items-center gap-2 text-[10.5px] tabular-nums flex-wrap">
        <span
          v-for="(chip, i) in chips"
          :key="i"
          class="rounded px-1.5 py-0.5 font-medium"
          :class="chipClass(chip.tone)"
        >{{ chip.label }}</span>
      </div>
    </div>
    <div class="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center gap-1.5 shrink-0 ml-2">
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        @click.prevent.stop="$emit('markRead', id)"
      >
        Mark read
      </UButton>
      <UButton
        color="primary"
        size="sm"
        @click.prevent.stop="$emit('respond', id)"
      >
        Respond →
      </UButton>
    </div>
  </NuxtLink>
</template>
