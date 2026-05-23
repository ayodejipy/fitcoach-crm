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
          <!-- Working Hours section -->
          <div :class="sectionLabelClass">Working Hours</div>

          <div
            v-for="day in days"
            :key="day.name"
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
            <USelect v-model="bufferTime" :items="bufferOptions" size="sm" class="w-[120px]" />
          </div>

          <!-- Booking Rules section -->
          <div :class="[sectionLabelClass, 'mt-5']">Booking Rules</div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3 py-2.5 px-3 border-[1.5px] border-(--border) rounded-xl">
              <div class="flex-1">
                <div class="text-[13px] font-semibold text-(--text-primary)">Minimum notice</div>
                <div class="text-[11px] text-(--text-muted) mt-px">How soon clients can book</div>
              </div>
              <USelect v-model="minNotice" :items="noticeOptions" size="sm" class="w-[120px]" />
            </div>
            <div class="flex items-center gap-3 py-2.5 px-3 border-[1.5px] border-(--border) rounded-xl">
              <div class="flex-1">
                <div class="text-[13px] font-semibold text-(--text-primary)">Max sessions / day</div>
                <div class="text-[11px] text-(--text-muted) mt-px">Limit your daily workload</div>
              </div>
              <USelect v-model="maxSessions" :items="maxSessionOptions" size="sm" class="w-[120px]" />
            </div>
          </div>
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
            @click="handleSave"
          >Save Availability</UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [val: boolean]; saved: [] }>()

interface DayConfig {
  name: string
  enabled: boolean
  from: string
  to: string
}

const days = ref<DayConfig[]>([
  { name: 'Monday',    enabled: true,  from: '8:00 AM',  to: '6:00 PM' },
  { name: 'Tuesday',   enabled: true,  from: '8:00 AM',  to: '6:00 PM' },
  { name: 'Wednesday', enabled: true,  from: '9:00 AM',  to: '5:00 PM' },
  { name: 'Thursday',  enabled: true,  from: '8:00 AM',  to: '7:00 PM' },
  { name: 'Friday',    enabled: true,  from: '8:00 AM',  to: '5:00 PM' },
  { name: 'Saturday',  enabled: false, from: '9:00 AM',  to: '1:00 PM' },
  { name: 'Sunday',    enabled: false, from: '10:00 AM', to: '2:00 PM' },
])

const bufferTime = ref('10 min')
const minNotice = ref('4 hours')
const maxSessions = ref('6 sessions')
const saving = ref(false)

const timeOptions: string[] = (() => {
  const opts: string[] = []
  for (let h = 6; h <= 22; h++) {
    const suffix = h < 12 ? 'AM' : 'PM'
    const display = h <= 12 ? h : h - 12
    opts.push(`${display}:00 ${suffix}`)
  }
  return opts
})()

const bufferOptions = ['None', '5 min', '10 min', '15 min', '30 min']
const noticeOptions = ['1 hour', '4 hours', '24 hours', '48 hours']
const maxSessionOptions = ['No limit', '4 sessions', '6 sessions', '8 sessions']

const sectionLabelClass = 'text-[11px] font-bold uppercase tracking-[0.8px] text-[#8FAD97] dark:text-(--text-muted) mb-2.5 mt-1'

async function handleSave() {
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 1100))
  saving.value = false
  emit('saved')
  emit('update:open', false)
}
</script>
