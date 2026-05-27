<script setup lang="ts">
import { computed } from 'vue'
import Avatar from '~/components/Avatar.vue'
import type { SessionData } from './CalendarGrid.vue'

const {open, session} = defineProps<{
  open: boolean
  session: SessionData | null
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  edit: []
  cancel: []
}>()

// ── Type badge ─────────────────────────────────────────────
const TYPE_META = {
  virtual:  { badge: 'bg-[#EBF5FB] dark:bg-[#3498DB]/15 text-[#3498DB]', label: 'Virtual · Zoom',  icon: 'i-hugeicons-video-02' },
  inperson: { badge: 'bg-[#E8F5EE] dark:bg-(--bg-primary-soft) text-primary dark:text-(--green-light)', label: 'In-Person', icon: 'i-hugeicons-maps-location-01' },
  group:    { badge: 'bg-[#F4ECF7] dark:bg-[#9B59B6]/15 text-[#9B59B6]',  label: 'Group Session', icon: 'i-hugeicons-user-multiple-02' },
} as const

const typeBadgeClass = computed(() => session ? TYPE_META[session.sessionType].badge : '')
const typeBadgeLabel = computed(() => session ? TYPE_META[session.sessionType].label : '')
const typeIcon       = computed(() => session ? TYPE_META[session.sessionType].icon  : '')

// ── Detail rows ────────────────────────────────────────────
const detailRows = computed(() => {
  if (!session) return []
  const confirmed = session.status === 'confirmed'
  return [
    {
      icon: 'i-hugeicons-clock-02',
      text: session.time,
      iconClass: 'text-primary dark:text-(--green-light)',
      textClass: 'text-[#3D5A45] dark:text-(--text-secondary)',
    },
    {
      icon: 'i-hugeicons-location-01',
      text: session.location,
      iconClass: 'text-primary dark:text-(--green-light)',
      textClass: 'text-[#3D5A45] dark:text-(--text-secondary)',
    },
    {
      icon: confirmed ? 'i-hugeicons-checkmark-circle-02' : 'i-hugeicons-alert-02',
      text: confirmed ? 'Confirmed' : 'Awaiting confirmation',
      iconClass: confirmed ? 'text-primary dark:text-(--green-light)' : 'text-[#E67E22]',
      textClass:  confirmed ? 'text-primary dark:text-(--green-light) font-semibold' : 'text-[#E67E22] font-semibold',
    },
  ]
})
</script>

<template>
  <UModal
    :open="open"
    :ui="{ content: 'w-72 max-w-xs p-0 overflow-hidden' }"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div v-if="session">
        <!-- Header: type badge + client info -->
        <div class="relative px-4 pt-3.5 pb-3.5 border-b border-(--border-muted)">
          <UButton
            icon="i-hugeicons-cancel-01"
            size="xs"
            variant="ghost"
            color="neutral"
            class="absolute top-2 right-2"
            @click="emit('update:open', false)"
          />

          <div
            class="inline-flex items-center gap-1.5 text-[11px] font-bold py-[3px] px-2.5 rounded-full mb-2.5"
            :class="typeBadgeClass"
          >
            <UIcon :name="typeIcon" class="size-[11px]" />
            {{ typeBadgeLabel }}
          </div>

          <div class="flex items-center gap-2.5">
            <Avatar :initials="session.initials" :variant="session.variant" :size="36" />
            <div class="min-w-0">
              <div class="text-[15px] font-bold text-(--text-primary) truncate">{{ session.client }}</div>
              <div class="text-xs text-(--text-muted) mt-px truncate">{{ session.type }}</div>
            </div>
          </div>
        </div>

        <!-- Detail rows -->
        <div class="px-4 py-2.5 flex flex-col divide-y divide-[#F5F7F5] dark:divide-(--border-muted)">
          <div
            v-for="row in detailRows"
            :key="row.text"
            class="flex items-center gap-2 py-[5px]"
          >
            <UIcon :name="row.icon" class="size-3.5 shrink-0" :class="row.iconClass" />
            <span class="text-xs truncate" :class="row.textClass">{{ row.text }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-4 py-2.5 bg-[#F9FBF9] dark:bg-white/[.02] border-t border-(--border-muted) flex gap-2">
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
            icon="i-hugeicons-cancel-01"
            variant="outline"
            color="error"
            size="sm"
            class="flex-1 justify-center"
            @click="emit('cancel')"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
