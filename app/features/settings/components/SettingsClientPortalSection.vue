<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import { useSettingsApi } from '../composables/useSettingsApi'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import type { ModelsCoachSettings } from '~/services'

const DAYS = [
  { value: 1, short: 'Mon' },
  { value: 2, short: 'Tue' },
  { value: 3, short: 'Wed' },
  { value: 4, short: 'Thu' },
  { value: 5, short: 'Fri' },
  { value: 6, short: 'Sat' },
  { value: 0, short: 'Sun' },
] as const

const DEADLINE_OPTIONS = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '23:00', label: '11:00 PM' },
] as const

const REMINDER_OPTIONS = [
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '20:00', label: '8:00 PM' },
] as const

const authStore = useAuthStore()
const settingsApi = useSettingsApi()
const toast = useToast()

const slug = ref(authStore.coach?.slug ?? '')
const savedSlug = ref(authStore.coach?.slug ?? '')
const savingSlug = ref(false)
const portalBase = 'portal.fitcoachcrm.com/'
const portalUrl = computed(() => `https://${portalBase}${savedSlug.value}`)

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function saveSlug() {
  const next = normalizeSlug(slug.value)
  if (next === savedSlug.value) {
    slug.value = next
    return
  }
  if (next.length < 3) {
    slug.value = savedSlug.value
    toast.add({ title: 'Slug must be at least 3 characters', color: 'warning' })
    return
  }
  slug.value = next
  savingSlug.value = true
  try {
    await settingsApi.updateCoach({ slug: next })
    savedSlug.value = next
    toast.add({ title: 'Portal URL updated', color: 'success' })
  } catch (err: unknown) {
    slug.value = savedSlug.value
    const message = err instanceof Error && 'data' in err && (err.data as { error?: string })?.error
      ? (err.data as { error: string }).error
      : 'Could not update portal URL'
    toast.add({ title: message, color: 'error' })
  } finally {
    savingSlug.value = false
  }
}

const selectedDays = ref<number[]>([1])
const deadline = ref<string>('10:00')
const reminderTime = ref<string>('08:00')
const loadingSettings = ref(true)
const savingDays = ref(false)
const savingDeadline = ref(false)
const savingReminder = ref(false)

onMounted(async () => {
  try {
    const settings = (await settingsApi.getSettings()) as ModelsCoachSettings | undefined
    const days = settings?.checkin_days
    if (Array.isArray(days) && days.length > 0) {
      selectedDays.value = [...days].sort((a, b) => a - b)
    }
    const currentDeadline = settings?.checkin_deadline
    if (typeof currentDeadline === 'string' && DEADLINE_OPTIONS.some(o => o.value === currentDeadline)) {
      deadline.value = currentDeadline
    }
    const reminder = settings?.reminder_time
    if (typeof reminder === 'string' && REMINDER_OPTIONS.some(o => o.value === reminder)) {
      reminderTime.value = reminder
    }
  } finally {
    loadingSettings.value = false
  }
})

async function toggleDay(day: number) {
  const previous = [...selectedDays.value]
  const next = previous.includes(day)
    ? previous.filter(d => d !== day)
    : [...previous, day].sort((a, b) => a - b)
  if (next.length === 0) {
    toast.add({ title: 'At least one check-in day is required', color: 'warning' })
    return
  }
  selectedDays.value = next
  savingDays.value = true
  try {
    await settingsApi.updateSettings({ checkin_days: next })
    toast.add({ title: 'Check-in days updated', color: 'success' })
  } catch {
    selectedDays.value = previous
    toast.add({ title: 'Could not update check-in days', color: 'error' })
  } finally {
    savingDays.value = false
  }
}

function isSelected(day: number): boolean {
  return selectedDays.value.includes(day)
}

async function onDeadlineChange(next: string) {
  const previous = deadline.value
  if (next === previous) return
  deadline.value = next
  savingDeadline.value = true
  try {
    await settingsApi.updateSettings({ checkin_deadline: next })
    toast.add({ title: 'Submission deadline updated', color: 'success' })
  } catch {
    deadline.value = previous
    toast.add({ title: 'Could not update deadline', color: 'error' })
  } finally {
    savingDeadline.value = false
  }
}

async function onReminderChange(next: string) {
  const previous = reminderTime.value
  if (next === previous) return
  reminderTime.value = next
  savingReminder.value = true
  try {
    await settingsApi.updateSettings({ reminder_time: next })
    toast.add({ title: 'Reminder time updated', color: 'success' })
  } catch {
    reminderTime.value = previous
    toast.add({ title: 'Could not update reminder time', color: 'error' })
  } finally {
    savingReminder.value = false
  }
}

function onCopy() {
  if (!import.meta.client) return
  navigator.clipboard?.writeText(portalUrl.value).then(
    () => toast.add({ title: 'Copied to clipboard', color: 'success' }),
    () => toast.add({ title: 'Could not copy', color: 'error' }),
  )
}
</script>

<template>
  <SettingsSection
    id="client-portal"
    title="Client portal"
    description="The branded portal where your clients submit check-ins."
  >
    <UFormField label="Portal URL">
      <div class="flex items-stretch rounded-md border border-(--border) overflow-hidden bg-(--bg-surface)">
        <span class="px-3 py-2 text-[12.5px] text-(--text-muted) font-mono bg-(--bg-subtle)">{{ portalBase }}</span>
        <input
          v-model="slug"
          type="text"
          :disabled="savingSlug"
          placeholder="your-slug"
          class="flex-1 px-3 py-2 text-[12.5px] font-mono text-(--text-primary) bg-transparent focus:outline-none disabled:opacity-60"
          :aria-label="`Portal slug · ${portalBase}<slug>`"
          @blur="saveSlug"
          @keydown.enter.prevent="saveSlug"
        />
        <button
          type="button"
          class="px-3 text-[11.5px] text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-subtle) border-l border-(--border)"
          @click="onCopy"
        >
          Copy
        </button>
      </div>
      <template #help>
        <p class="text-[10.5px] text-(--text-muted) mt-1">
          Clients receive this link in their invite email · changing the slug will break old links · saves on blur or Enter.
        </p>
      </template>
    </UFormField>

    <UFormField label="Check-in schedule" class="mt-5">
      <USkeleton v-if="loadingSettings" class="h-10 w-full max-w-[360px] rounded-md" />
      <div v-else class="flex flex-wrap gap-2" role="group" aria-label="Days clients can submit check-ins">
        <button
          v-for="day in DAYS"
          :key="day.value"
          type="button"
          class="h-10 w-12 rounded-full border-[1.5px] text-[12px] font-semibold transition-colors disabled:opacity-60"
          :class="isSelected(day.value)
            ? 'border-(--green-brand) bg-(--green-brand) text-white'
            : 'border-(--border) text-(--text-secondary) hover:bg-(--bg-subtle)'"
          :disabled="savingDays"
          :aria-pressed="isSelected(day.value)"
          @click="toggleDay(day.value)"
        >
          {{ day.short }}
        </button>
      </div>
      <template #help>
        <p class="text-[10.5px] text-(--text-muted) mt-1">
          Each scheduled day grants one check-in slot per week · clients can submit on any selected day.
        </p>
      </template>
    </UFormField>

    <UFormField label="Submission deadline" class="mt-5">
      <USkeleton v-if="loadingSettings" class="h-9 w-full max-w-[280px] rounded-md" />
      <USelect
        v-else
        :model-value="deadline"
        :items="DEADLINE_OPTIONS"
        value-key="value"
        label-key="label"
        :disabled="savingDeadline"
        size="md"
        class="w-full max-w-[280px]"
        @update:model-value="onDeadlineChange"
      />
      <template #help>
        <p class="text-[10.5px] text-(--text-muted) mt-1">
          The latest time on each scheduled day a client can submit · late submissions get flagged.
        </p>
      </template>
    </UFormField>

    <UFormField label="Reminder time" class="mt-5">
      <USkeleton v-if="loadingSettings" class="h-9 w-full max-w-[280px] rounded-md" />
      <USelect
        v-else
        :model-value="reminderTime"
        :items="REMINDER_OPTIONS"
        value-key="value"
        label-key="label"
        :disabled="savingReminder"
        size="md"
        class="w-full max-w-[280px]"
        @update:model-value="onReminderChange"
      />
      <template #help>
        <p class="text-[10.5px] text-(--text-muted) mt-1">
          The clock time we nudge clients on each scheduled day · stays the same even if the deadline moves.
        </p>
      </template>
    </UFormField>
  </SettingsSection>
</template>
