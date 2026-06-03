<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import type { AvatarVariant } from '~/utils/client'

defineProps<{
  id: string
  initials: string
  variant: AvatarVariant
  name: string
  weekLabel: string
  relativeLabel: string
  preview?: string | null
  replyPreview?: string | null
}>()
</script>

<template>
  <NuxtLink
    :to="`/check-ins/${id}`"
    class="flex items-center gap-4 px-5 py-3.5 hover:bg-(--bg-subtle) no-underline"
  >
    <Avatar :initials="initials" :variant="variant" :size="36" :muted="true" />
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[13px] font-medium text-(--text-secondary) truncate">{{ name }}</span>
        <span class="text-[11px] text-(--text-muted) tabular-nums">· {{ weekLabel }}</span>
        <span class="text-[11px] text-(--text-muted) tabular-nums ml-auto">{{ relativeLabel }}</span>
      </div>
      <p class="mt-0.5 text-[11.5px] text-(--text-muted) leading-snug line-clamp-1">
        <span v-if="preview">{{ preview }}</span>
        <template v-if="replyPreview">
          <span v-if="preview" class="text-(--text-muted)"> · </span>
          <span class="text-(--text-secondary)">You replied:</span> {{ replyPreview }}
        </template>
      </p>
    </div>
  </NuxtLink>
</template>
