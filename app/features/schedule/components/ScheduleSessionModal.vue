<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { useClientsApi } from '~/features/clients/composables/useClientsApi'
import { useScheduleApi } from '~/features/schedule/composables/useScheduleApi'
import { parseStartsAt, parseDurationMins } from '~/features/schedule/utils/session'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [val: boolean]; scheduled: [] }>()

type SessionType = 'virtual' | 'inperson' | 'group'

const { list: listClients } = useClientsApi()
const { create } = useScheduleApi()

const { data: clientsData } = useAsyncData('modal-clients', () => listClients({ per_page: 200 }))
const clientOptions = computed(() =>
  (clientsData.value?.clients ?? []).map(c => ({
    id: c.id ?? '',
    label: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim(),
  }))
)

const sessionType = ref<SessionType>('virtual')
const client = ref('')
const clientName = computed(() => clientOptions.value.find(c => c.id === client.value)?.label ?? '')
const focus = ref('')
const date = ref('')
const startTime = ref('10:00 AM')
const duration = ref('60 min')
const sendInvite = ref('Email + In-app')
const zoomEnabled = ref(true)
const saving = ref(false)
const clientError = ref(false)

const SESSION_TYPES: Array<{ value: SessionType; label: string; iconBg: string; iconColor: string; svgPath: string }> = [
  {
    value: 'virtual',
    label: 'Virtual',
    iconBg: 'bg-[#DBEAFE]',
    iconColor: 'text-[#1E40AF]',
    svgPath: '<rect x="1" y="2.5" width="9" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M10 6l4-2v7l-4-2V6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  },
  {
    value: 'inperson',
    label: 'In-Person',
    iconBg: 'bg-[#D1FAE5]',
    iconColor: 'text-[#065F46]',
    svgPath: '<path d="M8 1.5C5.8 1.5 4 3.3 4 5.5c0 3.5 4 9 4 9s4-5.5 4-9c0-2.2-1.8-4-4-4z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="5.5" r="1.8" stroke="currentColor" stroke-width="1.3"/>',
  },
  {
    value: 'group',
    label: 'Group',
    iconBg: 'bg-[#EDE9FE]',
    iconColor: 'text-[#5B21B6]',
    svgPath: '<circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 14c0-2.8 2.2-5 5-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="11" cy="6" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M11 11c1.7 0 3 1.3 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  },
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

const dotColor = computed(() => ({
  virtual: '#3498DB',
  inperson: '#1A7A4A',
  group: '#9B59B6',
})[sessionType.value])

const locationLabel = computed(() => {
  if (sessionType.value === 'virtual') return zoomEnabled.value ? 'Zoom · auto-link' : 'Virtual'
  if (sessionType.value === 'inperson') return 'In-Person'
  return 'Group Session'
})

watch(() => props.open, (val) => {
  if (val) {
    client.value = ''
    focus.value = ''
    date.value = format(new Date(), 'yyyy-MM-dd')
    clientError.value = false
    saving.value = false
  }
})

async function handleSchedule() {
  if (!client.value) {
    clientError.value = true
    setTimeout(() => { clientError.value = false }, 2000)
    return
  }
  saving.value = true
  try {
    await create({
      client_id: client.value,
      title: clientName.value,
      session_type: sessionType.value,
      starts_at: parseStartsAt(date.value, startTime.value),
      duration_mins: parseDurationMins(duration.value),
      notes: focus.value || undefined,
      confirmed: false,
    })
    emit('scheduled')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal :open="open" @update:open="$emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-start justify-between px-5 pt-5 pb-4 border-b border-(--border)">
          <div>
            <div class="text-[15px] font-bold text-(--text-primary) tracking-[-0.2px]">Schedule Session</div>
            <div class="text-[12px] text-(--text-muted) mt-0.5">Book a 1:1 or group session with a client</div>
          </div>
          <button
            type="button"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-hover) transition-colors"
            @click="$emit('update:open', false)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          <!-- Session Type picker (custom — no NUI equivalent) -->
          <div>
            <div class="text-[12px] font-bold text-[#3D5A45] dark:text-(--text-secondary) mb-[5px]">Session Type</div>
            <div class="grid grid-cols-3 gap-2.5">
              <button
                v-for="st in SESSION_TYPES"
                :key="st.value"
                type="button"
                class="flex flex-col items-center gap-2 py-3 px-2 border-[1.5px] rounded-xl transition-colors"
                :class="sessionType === st.value
                  ? 'border-primary bg-[#F0F9F4]'
                  : 'border-[#D1E0D5] dark:border-(--border) bg-white dark:bg-(--bg-surface) hover:border-primary/50'"
                @click="sessionType = st.value"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="st.iconBg">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" v-html="st.svgPath" :class="st.iconColor" />
                </div>
                <span
                  class="text-[12px] font-semibold transition-colors"
                  :class="sessionType === st.value ? 'text-primary' : 'text-(--text-secondary)'"
                >{{ st.label }}</span>
              </button>
            </div>
          </div>

          <!-- Client -->
          <UFormField
            name="client"
            label="Client"
            :error="clientError ? 'Please select a client' : undefined"
          >
            <USelect
              v-model="client"
              :items="clientOptions"
              value-key="id"
              label-key="label"
              placeholder="Select a client…"
              class="rounded-[10px] w-full"
              @update:model-value="clientError = false"
            />
          </UFormField>

          <!-- Session Focus — free text + suggestions via UInputMenu -->
          <UFormField name="focus" label="Session Focus">
            <UInputMenu
              v-model="focus"
              :items="FOCUSES"
              placeholder="e.g. Strength & Conditioning"
              class="rounded-[10px] w-full"
            />
          </UFormField>

          <!-- Date + Start Time -->
          <div class="grid grid-cols-2 gap-3">
            <UFormField name="date" label="Date">
              <UInput v-model="date" type="date" class="rounded-[10px] w-full" />
            </UFormField>
            <UFormField name="startTime" label="Start Time">
              <USelect v-model="startTime" :items="TIME_SLOTS" class="rounded-[10px] w-full" />
            </UFormField>
          </div>

          <!-- Duration + Send Invite -->
          <div class="grid grid-cols-2 gap-3">
            <UFormField name="duration" label="Duration">
              <USelect v-model="duration" :items="DURATIONS" class="rounded-[10px] w-full" />
            </UFormField>
            <UFormField name="sendInvite" label="Send Invite">
              <USelect v-model="sendInvite" :items="INVITE_OPTIONS" class="rounded-[10px] w-full" />
            </UFormField>
          </div>

          <!-- Zoom toggle row (virtual only) -->
          <div
            v-if="sessionType === 'virtual'"
            class="flex items-center justify-between bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-3.5 py-2.5"
          >
            <div class="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2.5" width="9" height="8" rx="1.5" fill="#2563EB"/>
                <path d="M10 6l4-2v7l-4-2V6z" fill="#2563EB"/>
              </svg>
              <span class="text-[#1D4ED8] font-semibold text-sm">Auto-generate Zoom link</span>
            </div>
            <UToggle v-model="zoomEnabled" color="primary" />
          </div>

          <!-- Preview strip -->
          <div class="mt-0.5 bg-[#F7FAF8] dark:bg-(--bg-surface-raised) border-[1.5px] border-(--border) rounded-xl p-3 flex items-center gap-3">
            <template v-if="client">
              <div
                class="w-[10px] h-[10px] rounded-[3px] flex-shrink-0"
                :style="{ background: dotColor }"
              />
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-bold text-(--text-primary) truncate">{{ clientName }}</div>
                <div class="text-[11px] text-(--text-muted) truncate">{{ focus || 'No focus set' }} · {{ locationLabel }}</div>
              </div>
              <div class="text-xs font-bold text-primary whitespace-nowrap">{{ startTime }} · {{ duration }}</div>
            </template>
            <template v-else>
              <div class="text-[12px] text-(--text-muted) italic">Select a client to preview</div>
            </template>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-(--border)">
          <UButton variant="ghost" color="neutral" size="lg" :disabled="saving" @click="$emit('update:open', false)">
            Cancel
          </UButton>
          <UButton color="primary" size="lg" :loading="saving" @click="handleSchedule">
            Schedule
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
