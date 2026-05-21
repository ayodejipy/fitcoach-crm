<script setup lang="ts">
import CheckInDetailHeader from './CheckInDetailHeader.vue'
import CheckInMetrics, { type CheckInMetricsData } from './CheckInMetrics.vue'
import ClientNote from './ClientNote.vue'
import ProgressPhoto from './ProgressPhoto.vue'
import ResponseComposer from './ResponseComposer.vue'
import PreviousResponses, { type PreviousResponse } from './PreviousResponses.vue'
import type { CheckInSummary } from './CheckInCard.vue'

const props = withDefaults(defineProps<{
  checkIn: CheckInSummary
  metrics: CheckInMetricsData
  previousResponses: PreviousResponse[]
  clientNote: string
  weekLabel: string
  submittedAt: string
  weekCurrent: number
  weekTotal: number
  hasPrev?: boolean
  hasNext?: boolean
  initialDraft?: string
  photoWeekLabel?: string
  photoSubmittedAt?: string
  loading?: boolean
  sending?: boolean
}>(), {
  hasPrev: false,
  hasNext: false,
  initialDraft: '',
  loading: false,
  sending: false,
})

const emit = defineEmits<{
  send: [text: string]
  'save-draft': [text: string]
  'prev-week': []
  'next-week': []
}>()

const response = ref(props.initialDraft)

const onSend = () => {
  emit('send', response.value)
  response.value = ''
}

const onSaveDraft = () => {
  emit('save-draft', response.value)
}
</script>

<template>
  <div class="flex-1 min-w-0 overflow-y-auto bg-(--bg-surface) rounded-[14px] border border-[#E5EDE8] dark:border-(--border) flex flex-col custom-scrollbar">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="py-5 px-6 border-b border-[#F0F4F1] dark:border-(--border)">
        <div class="flex items-center gap-3">
          <USkeleton class="w-11 h-11 rounded-full shrink-0" />
          <div class="flex-1 flex flex-col gap-2">
            <USkeleton class="h-4 w-36 rounded" />
            <USkeleton class="h-3 w-52 rounded" />
          </div>
        </div>
      </div>
      <div class="py-5 px-6 flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <USkeleton v-for="n in 4" :key="n" class="h-[120px] rounded-xl" />
        </div>
        <USkeleton class="h-20 rounded-xl" />
        <USkeleton class="h-[160px] rounded-xl" />
      </div>
    </template>

    <template v-else>
      <CheckInDetailHeader
        :client="{ initials: checkIn.initials, variant: checkIn.variant, name: checkIn.name }"
        :week="{ label: weekLabel, submittedAt: submittedAt, current: weekCurrent, total: weekTotal }"
        :has-prev="hasPrev"
        :has-next="hasNext"
        @prev-week="emit('prev-week')"
        @next-week="emit('next-week')"
      />

      <div class="py-5 px-6 flex-1 flex flex-col gap-5">
        <CheckInMetrics :metrics="metrics" />

        <div v-if="clientNote">
          <div class="section-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8a1 1 0 011 1v5a1 1 0 01-1 1H4l-3 2V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            </svg>
            Client's Notes
          </div>
          <ClientNote :text="clientNote" />
        </div>

        <div v-if="photoWeekLabel">
          <div class="section-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
              <circle cx="6" cy="6" r="2" stroke="currentColor" stroke-width="1.2"/>
              <path d="M4 2V1M8 2V1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            Progress Photo
          </div>
          <ProgressPhoto :week-label="photoWeekLabel" :submitted-at="photoSubmittedAt ?? ''" />
        </div>

        <ResponseComposer
          v-model="response"
          :client-name="checkIn.name"
          @send="onSend"
          @save-draft="onSaveDraft"
        />

        <PreviousResponses v-if="previousResponses.length" :responses="previousResponses" />

        <div class="h-2" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8FAD97;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #E8F0EB;
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #D1E0D5; border-radius: 3px; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .section-label { color: var(--text-muted); }
.dark .section-label::after { background: var(--border); }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); }
</style>
