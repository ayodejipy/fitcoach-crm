<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { useScheduleApi } from '~/features/schedule/composables/useScheduleApi'
import {
  parseStartsAt,
  parseDurationMins,
  formatDateInput,
  formatStartTimeSlot,
  durationLabel,
} from '~/features/schedule/utils/session'
import type { SessionData } from '~/features/schedule/components/CalendarGrid.vue'

const props = defineProps<{ open: boolean; session?: SessionData | null }>()
const emit = defineEmits<{ 'update:open': [val: boolean]; scheduled: []; updated: [] }>()

type SessionType = 'virtual' | 'inperson' | 'group'

const toast = useToast()
const { list: listClients } = useClientsApi()
const { create, get, update } = useScheduleApi()

const isEdit = computed(() => !!props.session)
const modalTitle = computed(() => isEdit.value ? 'Edit session' : 'Schedule session')
const modalDescription = computed(() =>
  isEdit.value ? 'Update the details of this session.' : 'Book a 1:1 or group session with a client.',
)

const { data: clientsData } = useAsyncData('modal-clients', () => listClients({ per_page: 200 }))
const clientOptions = computed(() =>
  (clientsData.value?.clients ?? []).map(client => ({
    id: client.id ?? '',
    label: `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim(),
  })),
)

const SESSION_TYPES: Array<{ value: SessionType; label: string; icon: string }> = [
  { value: 'virtual',  label: 'Virtual',   icon: 'i-hugeicons-video-02' },
  { value: 'inperson', label: 'In-person', icon: 'i-hugeicons-maps-location-01' },
  { value: 'group',    label: 'Group',     icon: 'i-hugeicons-user-multiple-02' },
]

const FOCUSES = [
  'Strength & Conditioning', 'Progress Check-in', 'Nutrition Review',
  'Mobility & Recovery', 'Marathon Prep', 'Weight Management', 'Goal Setting',
]

const TIME_SLOTS = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
]

const DURATIONS = ['30 min', '45 min', '60 min', '90 min', '2 hours']
const INVITE_OPTIONS = ['Email + In-app', 'Email only', 'In-app only', "Don't notify"]

const sessionType = ref<SessionType>('virtual')
const client = ref('')
const focus = ref('')
const date = ref('')
const startTime = ref('10:00 AM')
const duration = ref('60 min')
const sendInvite = ref('Email + In-app')
const zoomEnabled = ref(true)
const saving = ref(false)
const loading = ref(false)
const clientError = ref(false)

const clientName = computed(() => clientOptions.value.find(option => option.id === client.value)?.label ?? '')

const sessionTypeColor: Record<SessionType, string> = {
  virtual:  'bg-(--info)',
  inperson: 'bg-(--green-brand)',
  group:    'bg-[#9B59B6]',
}

const locationLabel = computed(() => {
  if (sessionType.value === 'virtual') return zoomEnabled.value ? 'Virtual · auto-link' : 'Virtual'
  if (sessionType.value === 'inperson') return 'In-person'
  return 'Group session'
})

watch(() => props.open, async (val) => {
  if (!val) return
  clientError.value = false
  saving.value = false

  if (props.session) {
    loading.value = true
    try {
      const session = await get(props.session.id)
      sessionType.value = (session.session_type as SessionType) ?? 'virtual'
      client.value = session.client_id ?? ''
      focus.value = session.notes ?? ''
      date.value = formatDateInput(session.starts_at)
      startTime.value = formatStartTimeSlot(session.starts_at)
      duration.value = durationLabel(session.duration_mins)
      zoomEnabled.value = !!session.zoom_link
    } catch {
      toast.add({ title: 'Could not load session', color: 'error' })
      emit('update:open', false)
    } finally {
      loading.value = false
    }
  } else {
    sessionType.value = 'virtual'
    client.value = ''
    focus.value = ''
    date.value = format(new Date(), 'yyyy-MM-dd')
    startTime.value = '10:00 AM'
    duration.value = '60 min'
    zoomEnabled.value = true
  }
})

async function handleSubmit() {
  if (!client.value) {
    clientError.value = true
    setTimeout(() => { clientError.value = false }, 2000)
    return
  }
  saving.value = true
  try {
    const body = {
      title: clientName.value || props.session?.client,
      session_type: sessionType.value,
      starts_at: parseStartsAt(date.value, startTime.value),
      duration_mins: parseDurationMins(duration.value),
      notes: focus.value || undefined,
    }
    if (props.session) {
      await update(props.session.id, body)
      emit('updated')
    } else {
      await create({ ...body, client_id: client.value, confirmed: false })
      emit('scheduled')
    }
    emit('update:open', false)
  } catch {
    toast.add({ title: props.session ? 'Could not update session' : 'Could not schedule session', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    :open="open"
    :title="modalTitle"
    :description="modalDescription"
    :ui="{ content: 'sm:max-w-lg', body: 'p-5 space-y-4', footer: 'p-4' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <fieldset>
        <legend class="text-[12px] font-semibold text-(--text-secondary) mb-1.5">Session type</legend>
        <div class="grid grid-cols-3 gap-2.5">
          <button
            v-for="type in SESSION_TYPES"
            :key="type.value"
            type="button"
            class="flex flex-col items-center gap-2 py-3 px-2 rounded-md border-[1.5px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--green-brand)"
            :class="sessionType === type.value
              ? 'border-(--green-brand) bg-(--green-pale)'
              : 'border-(--border) bg-(--bg-surface) hover:bg-(--bg-subtle)'"
            :aria-pressed="sessionType === type.value"
            @click="sessionType = type.value"
          >
            <span
              class="inline-flex items-center justify-center size-8 rounded-md"
              :class="sessionType === type.value ? 'bg-(--green-brand) text-white' : 'bg-(--bg-subtle) text-(--text-secondary)'"
            >
              <UIcon :name="type.icon" class="size-4" />
            </span>
            <span
              class="text-[12px] font-semibold"
              :class="sessionType === type.value ? 'text-(--green-brand)' : 'text-(--text-secondary)'"
            >
              {{ type.label }}
            </span>
          </button>
        </div>
      </fieldset>

      <UFormField
        name="client"
        label="Client"
        required
        :error="clientError ? 'Please select a client' : undefined"
      >
        <USelect
          v-model="client"
          :items="clientOptions"
          value-key="id"
          label-key="label"
          :disabled="isEdit"
          placeholder="Select a client…"
          size="md"
          class="w-full"
          @update:model-value="clientError = false"
        />
      </UFormField>

      <UFormField name="focus" label="Session focus" hint="optional">
        <UInputMenu
          v-model="focus"
          :items="FOCUSES"
          placeholder="e.g. Strength & Conditioning"
          size="md"
          class="w-full"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-3">
        <UFormField name="date" label="Date" required>
          <UInput v-model="date" type="date" size="md" class="w-full tabular-nums" />
        </UFormField>
        <UFormField name="startTime" label="Start time" required>
          <USelect v-model="startTime" :items="TIME_SLOTS" size="md" class="w-full tabular-nums" />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <UFormField name="duration" label="Duration" required>
          <USelect v-model="duration" :items="DURATIONS" size="md" class="w-full" />
        </UFormField>
        <UFormField name="sendInvite" label="Send invite">
          <USelect v-model="sendInvite" :items="INVITE_OPTIONS" size="md" class="w-full" />
        </UFormField>
      </div>

      <div
        v-if="sessionType === 'virtual'"
        class="flex items-start justify-between gap-3 rounded-md border border-(--border) bg-(--info-soft)/60 px-3.5 py-2.5"
      >
        <div class="flex items-start gap-2.5 min-w-0">
          <UIcon name="i-hugeicons-video-02" class="size-4 text-(--info) shrink-0 mt-0.5" />
          <div class="min-w-0">
            <label for="zoom-toggle" class="text-[12.5px] font-semibold text-(--text-primary) cursor-pointer">
              Auto-generate meeting link
            </label>
            <p class="text-[11px] text-(--text-secondary) mt-0.5">
              Uses Google Meet via your connected Calendar. Connect in
              <NuxtLink to="/settings#integrations" class="underline">Settings</NuxtLink>
              if you haven't yet.
            </p>
          </div>
        </div>
        <UToggle id="zoom-toggle" v-model="zoomEnabled" color="primary" aria-label="Auto-generate meeting link" class="shrink-0 mt-0.5" />
      </div>

      <div class="rounded-md border border-(--border) bg-(--bg-subtle)/40 p-3 flex items-center gap-3">
        <template v-if="client">
          <span aria-hidden="true" class="size-2.5 rounded-sm shrink-0" :class="sessionTypeColor[sessionType]" />
          <div class="flex-1 min-w-0">
            <div class="text-[12.5px] font-semibold text-(--text-primary) truncate">{{ clientName }}</div>
            <div class="text-[11px] text-(--text-secondary) truncate">{{ focus || 'No focus set' }} · {{ locationLabel }}</div>
          </div>
          <div class="text-[11.5px] font-semibold text-(--green-brand) whitespace-nowrap tabular-nums">{{ startTime }} · {{ duration }}</div>
        </template>
        <template v-else>
          <div class="text-[12px] text-(--text-muted) italic">Select a client to preview</div>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton variant="ghost" color="neutral" :disabled="saving" @click="emit('update:open', false)">
          Cancel
        </UButton>
        <UButton color="primary" :loading="saving" :disabled="loading" @click="handleSubmit">
          {{ isEdit ? 'Save changes' : 'Schedule' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
