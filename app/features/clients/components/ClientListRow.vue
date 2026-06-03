<script setup lang="ts">
import Avatar from '~/components/Avatar.vue'
import type { AvatarVariant } from '~/utils/client'
import type { EngagementReason } from '../utils/engagement'

type MenuItem = {
  label?: string
  icon?: string
  type?: 'separator' | 'label' | 'link'
  color?: 'error' | 'primary' | 'neutral' | 'success' | 'warning' | 'info'
  onSelect?: () => void
}

defineProps<{
  id: string
  initials: string
  variant: AvatarVariant
  name: string
  goal?: string
  isNew?: boolean
  reason: EngagementReason
  sessionsLogged?: number
  primaryActionLabel: string
  menuItems: MenuItem[]
}>()

defineEmits<{
  open: [id: string]
  primary: [id: string]
}>()

const reasonClass = (tone: EngagementReason['tone']) => ({
  error: 'text-(--red)',
  warning: 'text-(--warning)',
  info: 'text-(--info)',
  success: 'text-(--green-brand)',
  muted: 'text-(--text-muted)',
}[tone])
</script>

<template>
  <div
    class="group flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-(--bg-subtle) focus-within:bg-(--bg-subtle)"
    role="row"
    tabindex="0"
    @click="$emit('open', id)"
    @keydown.enter="$emit('open', id)"
  >
    <Avatar :initials="initials" :variant="variant" :size="32" />

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[13px] font-semibold text-(--text-primary) truncate">{{ name }}</span>
        <UBadge
          v-if="isNew"
          label="New"
          color="info"
          variant="subtle"
          size="sm"
        />
        <span v-if="goal" class="text-[11px] text-(--text-muted) truncate">· {{ goal }}</span>
      </div>
      <div class="mt-0.5 flex items-center gap-3 text-[11.5px] flex-wrap">
        <span class="inline-flex items-center gap-1 tabular-nums" :class="reasonClass(reason.tone)">
          <UIcon :name="reason.icon" class="size-3" />
          {{ reason.text }}
        </span>
        <template v-if="sessionsLogged != null && sessionsLogged > 0">
          <span aria-hidden="true" class="text-(--text-muted)">·</span>
          <span class="text-(--text-muted) tabular-nums">{{ sessionsLogged }} {{ sessionsLogged === 1 ? 'session' : 'sessions' }}</span>
        </template>
      </div>
    </div>

    <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        @click.stop="$emit('primary', id)"
      >
        {{ primaryActionLabel }}
      </UButton>
      <UDropdownMenu
        :items="menuItems"
        :content="{ side: 'bottom', align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-more-vertical"
          aria-label="More actions"
          @click.stop
        />
      </UDropdownMenu>
    </div>
  </div>
</template>
