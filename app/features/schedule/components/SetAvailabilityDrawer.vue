<template>
  <USlideover :open="open" side="right" @update:open="$emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-start justify-between px-5 pt-5 pb-4 border-b border-(--border) flex-shrink-0">
          <div>
            <div class="text-[15px] font-bold text-(--text-primary) tracking-[-0.2px]">Set Availability</div>
            <div class="text-[12px] text-(--text-muted) mt-0.5">Define when clients can book sessions with you</div>
          </div>
          <UButton
            variant="ghost"
            color="neutral"
            class="size-8 p-0 justify-center"
            @click="$emit('update:open', false)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </UButton>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div v-if="loading" class="py-20 text-center text-(--text-muted) text-sm">Loading availability…</div>

          <template v-else>
            <!-- Working Hours section -->
            <div :class="sectionLabelClass">Working Hours</div>

            <div
              v-for="day in days"
              :key="day.dow"
              class="flex items-center gap-2.5 py-2.5 px-3 border-[1.5px] rounded-xl mb-2 transition-colors"
              :class="day.enabled
                ? 'border-[#A8D4BC] dark:border-(--green-light)/30 bg-[#F7FAF8] dark:bg-(--bg-primary-soft)/30'
                : 'border-(--border) bg-transparent'"
            >
              <div class="w-[82px] font-semibold text-(--text-primary) text-sm flex-shrink-0">{{ day.name }}</div>
              <div class="flex items-center gap-1.5 flex-1 min-w-0" :class="{ 'opacity-40': !day.enabled }">
                <USelect
                  v-model="day.from"
                  :items="timeOptions"
                  :disabled="!day.enabled"
                  size="xs"
                  class="flex-1 min-w-0"
                />
                <span class="text-[11px] text-(--text-muted) flex-shrink-0">to</span>
                <USelect
                  v-model="day.to"
                  :items="timeOptions"
                  :disabled="!day.enabled"
                  size="xs"
                  class="flex-1 min-w-0"
                />
              </div>
              <UToggle v-model="day.enabled" color="primary" size="sm" class="flex-shrink-0" />
            </div>

            <!-- Buffer Time section -->
            <div :class="[sectionLabelClass, 'mt-5']">Buffer Time</div>
            <div class="flex items-center gap-3 py-2.5 px-3 border-[1.5px] border-(--border) rounded-xl">
              <div class="flex-1">
                <div class="text-[13px] font-semibold text-(--text-primary)">Between sessions</div>
                <div class="text-[11px] text-(--text-muted) mt-px">Blocks time so you can prepare</div>
              </div>
              <USelect v-model="bufferMins" :items="bufferOptions" size="sm" class="w-[120px]" />
            </div>

            <!-- Booking Rules section -->
            <div :class="[sectionLabelClass, 'mt-5']">Booking Rules</div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-3 py-2.5 px-3 border-[1.5px] border-(--border) rounded-xl">
                <div class="flex-1">
                  <div class="text-[13px] font-semibold text-(--text-primary)">Minimum notice</div>
                  <div class="text-[11px] text-(--text-muted) mt-px">How soon clients can book</div>
                </div>
                <USelect v-model="minNoticeHrs" :items="noticeOptions" size="sm" class="w-[120px]" />
              </div>
              <div class="flex items-center gap-3 py-2.5 px-3 border-[1.5px] border-(--border) rounded-xl">
                <div class="flex-1">
                  <div class="text-[13px] font-semibold text-(--text-primary)">Max sessions / day</div>
                  <div class="text-[11px] text-(--text-muted) mt-px">Limit your daily workload</div>
                </div>
                <USelect v-model="maxSessionsPerDay" :items="maxSessionOptions" size="sm" class="w-[120px]" />
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-(--border) flex-shrink-0">
          <UButton
            variant="outline"
            color="neutral"
            size="lg"
            class="hover:border-primary hover:text-primary hover:bg-[#F0F9F4] dark:hover:border-(--green-light) dark:hover:text-(--green-light) dark:hover:bg-(--bg-primary-soft)"
            @click="$emit('update:open', false)"
          >Cancel</UButton>
          <UButton
            color="primary"
            size="lg"
            :loading="saving"
            :disabled="loading"
            @click="handleSave"
          >Save Availability</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ModelsCoachAvailabilitySlot, HandlersUpdateAvailabilitySlot } from '~/services/types.gen'
import { useAvailability } from '~/features/schedule/composables/useAvailability'
import { useSettingsApi } from '~/features/settings/composables/useSettingsApi'
import { parseClockMinutes } from '~/features/schedule/utils/calendar'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [val: boolean]; saved: [] }>()

const toast = useToast()
const availability = useAvailability()
const { getSettings, updateSettings } = useSettingsApi()

interface DayRow {
  name: string
  dow: number       // 0 = Sunday … 6 = Saturday (backend convention)
  enabled: boolean
  from: string      // "HH:MM"
  to: string        // "HH:MM"
}

// Displayed Mon-first; values carry the backend's Sunday=0 day_of_week.
const DAY_DEFS: ReadonlyArray<{ name: string; dow: number }> = [
  { name: 'Monday',    dow: 1 },
  { name: 'Tuesday',   dow: 2 },
  { name: 'Wednesday', dow: 3 },
  { name: 'Thursday',  dow: 4 },
  { name: 'Friday',    dow: 5 },
  { name: 'Saturday',  dow: 6 },
  { name: 'Sunday',    dow: 0 },
]

function defaultRows(): DayRow[] {
  return DAY_DEFS.map(({ name, dow }) => ({
    name,
    dow,
    enabled: dow >= 1 && dow <= 5,  // weekdays on by default
    from: '09:00',
    to: '17:00',
  }))
}

const days = ref<DayRow[]>(defaultRows())
const bufferMins = ref(10)
const minNoticeHrs = ref(4)
const maxSessionsPerDay = ref(6)
const saving = ref(false)
const loading = ref(false)

// "HH:MM" → "9:00 AM" label, every 30 min from 05:00 to 22:00.
const timeOptions: { label: string; value: string }[] = (() => {
  const opts: { label: string; value: string }[] = []
  for (let min = 5 * 60; min <= 22 * 60; min += 30) {
    const h = Math.floor(min / 60)
    const m = min % 60
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const suffix = h < 12 ? 'AM' : 'PM'
    const display = h % 12 === 0 ? 12 : h % 12
    opts.push({ label: `${display}:${String(m).padStart(2, '0')} ${suffix}`, value })
  }
  return opts
})()

const bufferOptions = [
  { label: 'None', value: 0 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
]
const noticeOptions = [
  { label: '1 hour', value: 1 },
  { label: '4 hours', value: 4 },
  { label: '24 hours', value: 24 },
  { label: '48 hours', value: 48 },
]
const maxSessionOptions = [
  { label: 'No limit', value: 0 },
  { label: '4 sessions', value: 4 },
  { label: '6 sessions', value: 6 },
  { label: '8 sessions', value: 8 },
]

const sectionLabelClass = 'text-[11px] font-bold uppercase tracking-[0.8px] text-[#8FAD97] dark:text-(--text-muted) mb-2.5 mt-1'

// Normalise a backend "HH:MM" (or "H:M") to the zero-padded "HH:MM" our options use.
function normaliseTime(hhmm?: string, fallback = '09:00'): string {
  const mins = parseClockMinutes(hhmm)
  if (mins === null) return fallback
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function hydrateFromSlots(slots: ModelsCoachAvailabilitySlot[]) {
  const byDow = new Map(slots.map(s => [s.day_of_week, s]))
  days.value = DAY_DEFS.map(({ name, dow }) => {
    const slot = byDow.get(dow)
    if (!slot) {
      return { name, dow, enabled: false, from: '09:00', to: '17:00' }
    }
    return {
      name,
      dow,
      enabled: slot.enabled ?? false,
      from: normaliseTime(slot.start_time, '09:00'),
      to: normaliseTime(slot.end_time, '17:00'),
    }
  })
}

async function load() {
  loading.value = true
  try {
    await availability.refresh()
    hydrateFromSlots(availability.slots.value)

    const settings = await getSettings()
    if (settings) {
      if (settings.buffer_mins != null) bufferMins.value = settings.buffer_mins
      if (settings.min_notice_hrs != null) minNoticeHrs.value = settings.min_notice_hrs
      if (settings.max_sessions_per_day != null) maxSessionsPerDay.value = settings.max_sessions_per_day
    }
  } catch {
    toast.add({ title: 'Could not load availability', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Load fresh whenever the drawer opens.
watch(() => props.open, (open) => {
  if (open) load()
})

async function handleSave() {
  saving.value = true
  try {
    const slots: HandlersUpdateAvailabilitySlot[] = days.value.map(d => ({
      day_of_week: d.dow,
      enabled: d.enabled,
      start_time: d.from,
      end_time: d.to,
    }))

    await availability.save(slots)
    await updateSettings({
      buffer_mins: bufferMins.value,
      min_notice_hrs: minNoticeHrs.value,
      max_sessions_per_day: maxSessionsPerDay.value,
    })

    emit('saved')
    emit('update:open', false)
  } catch {
    toast.add({ title: 'Could not save availability', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
