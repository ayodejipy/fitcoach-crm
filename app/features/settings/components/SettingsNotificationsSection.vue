<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import { useSettingsApi } from '../composables/useSettingsApi'
import type { ModelsCoachSettings } from '~/services'

const settingsApi = useSettingsApi()
const toast = useToast()

const NOTIFICATION_FIELDS = [
  {
    key: 'notif_checkin_new' as const,
    label: 'Email me when a client submits a check-in',
  },
  {
    key: 'notif_payment_received' as const,
    label: 'Email me when a client pays an invoice',
  },
  {
    key: 'notif_checkin_overdue' as const,
    label: 'Email me when a client misses their check-in',
  },
  {
    key: 'notif_schedule_digest' as const,
    label: 'Daily digest at 7am',
    hint: 'Summary of what needs your attention',
  },
] as const

const settings = ref<ModelsCoachSettings>({})
const loading = ref(true)

onMounted(async () => {
  try {
    settings.value = await settingsApi.getSettings() ?? {}
  } finally {
    loading.value = false
  }
})

async function onToggle(key: typeof NOTIFICATION_FIELDS[number]['key'], value: boolean) {
  const previous = settings.value[key]
  settings.value[key] = value
  try {
    await settingsApi.updateSettings({ [key]: value })
  } catch {
    settings.value[key] = previous
    toast.add({ title: 'Failed to save preference', color: 'error' })
  }
}
</script>

<template>
  <SettingsSection
    id="notifications"
    title="Notifications"
    description="When and how we ping you."
  >
    <USkeleton v-if="loading" class="h-[160px] rounded-md" />

    <div v-else class="space-y-1">
      <div
        v-for="(field, idx) in NOTIFICATION_FIELDS"
        :key="field.key"
        class="flex items-center justify-between gap-3 py-2.5"
        :class="idx < NOTIFICATION_FIELDS.length - 1 ? 'border-b border-(--border-muted)' : ''"
      >
        <label :for="field.key" class="min-w-0 flex-1 cursor-pointer">
          <div class="text-[12.5px] font-medium text-(--text-primary)">{{ field.label }}</div>
          <div v-if="field.hint" class="text-[10.5px] text-(--text-muted) mt-0.5">{{ field.hint }}</div>
        </label>
        <USwitch
          :id="field.key"
          :model-value="!!settings[field.key]"
          @update:model-value="onToggle(field.key, $event)"
        />
      </div>
    </div>
  </SettingsSection>
</template>
