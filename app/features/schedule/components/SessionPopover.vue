<script setup lang="ts">
import { computed } from 'vue'
import Avatar from '~/components/Avatar.vue'
import type { SessionData } from './CalendarGrid.vue'

const { open, session } = defineProps<{
  open: boolean
  session: SessionData | null
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  edit: []
  cancel: []
  confirm: []
}>()

const TYPE_META = {
  virtual:  { color: 'info'    as const, label: 'Virtual · Zoom',  icon: 'i-hugeicons-video-02' },
  inperson: { color: 'success' as const, label: 'In-person',       icon: 'i-hugeicons-maps-location-01' },
  group:    { color: 'neutral' as const, label: 'Group session',   icon: 'i-hugeicons-user-multiple-02' },
}

const typeMeta = computed(() => session ? TYPE_META[session.sessionType] : null)

const confirmed = computed(() => session?.status === 'confirmed')

const detailRows = computed(() => {
  if (!session) return []
  return [
    { icon: 'i-hugeicons-time-04',                 text: session.time,     tone: 'neutral' as const },
    { icon: 'i-hugeicons-location-04',             text: session.location, tone: 'neutral' as const },
    {
      icon: confirmed.value ? 'i-hugeicons-checkmark-circle-02' : 'i-hugeicons-alert-02',
      text: confirmed.value ? 'Confirmed' : 'Awaiting client confirmation',
      tone: confirmed.value ? 'success' as const : 'warning' as const,
    },
  ]
})

const toneClass = (tone: 'neutral' | 'success' | 'warning') => ({
  neutral: 'text-(--text-secondary)',
  success: 'text-(--green-brand)',
  warning: 'text-(--warning)',
}[tone])

const iconToneClass = (tone: 'neutral' | 'success' | 'warning') => ({
  neutral: 'text-(--text-muted)',
  success: 'text-(--green-brand)',
  warning: 'text-(--warning)',
}[tone])
</script>

<template>
  <UModal
    :open="open"
    :ui="{ content: 'sm:max-w-[300px] p-0 overflow-hidden', overlay: 'bg-transparent' }"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div v-if="session && typeMeta">
        <div class="relative px-4 pt-3.5 pb-3.5 border-b border-(--border-muted)">
          <UButton
            icon="i-lucide-x"
            size="xs"
            variant="ghost"
            color="neutral"
            class="absolute top-2 right-2"
            aria-label="Close session details"
            @click="emit('update:open', false)"
          />

          <UBadge
            :label="typeMeta.label"
            :color="typeMeta.color"
            :icon="typeMeta.icon"
            variant="soft"
            size="sm"
            class="mb-2.5"
          />

          <div class="flex items-center gap-2.5">
            <Avatar :initials="session.initials" :variant="session.variant" :size="36" />
            <div class="min-w-0">
              <div class="text-[14px] font-semibold text-(--text-primary) truncate">{{ session.client }}</div>
              <div class="text-[11.5px] text-(--text-secondary) mt-0.5 truncate">{{ session.type }}</div>
            </div>
          </div>
        </div>

        <ul class="px-4 py-2.5 divide-y divide-(--border-muted)">
          <li
            v-for="row in detailRows"
            :key="row.text"
            class="flex items-center gap-2 py-1.5"
          >
            <UIcon :name="row.icon" class="size-3.5 shrink-0" :class="iconToneClass(row.tone)" />
            <span class="text-[11.5px] font-medium truncate" :class="toneClass(row.tone)">{{ row.text }}</span>
          </li>
        </ul>

        <div class="px-4 py-2.5 bg-(--bg-subtle)/60 border-t border-(--border-muted) space-y-1.5">
          <UButton
            v-if="!confirmed"
            label="Mark as confirmed"
            icon="i-hugeicons-checkmark-circle-02"
            variant="soft"
            color="success"
            size="sm"
            block
            @click="emit('confirm')"
          />
          <div class="flex gap-2">
            <UButton
              label="Edit"
              icon="i-hugeicons-pencil-edit-02"
              variant="outline"
              color="neutral"
              size="sm"
              class="flex-1 justify-center"
              @click="emit('edit')"
            />
            <UButton
              label="Cancel"
              icon="i-hugeicons-cancel-circle"
              variant="outline"
              color="error"
              size="sm"
              class="flex-1 justify-center"
              @click="emit('cancel')"
            />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
