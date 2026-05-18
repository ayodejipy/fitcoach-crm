<template>
  <div class="flex-1 min-w-0 overflow-y-auto bg-(--bg-surface) rounded-[14px] border border-[#E5EDE8] dark:border-(--border) flex flex-col custom-scrollbar">
    <CheckInDetailHeader
      :client="{ initials: checkIn.initials, variant: checkIn.variant, name: checkIn.name }"
      :week="{ label: weekLabel, submittedAt: submittedAt, current: 14, total: 14 }"
      :has-prev="true"
      :has-next="false"
    />

    <div class="py-5 px-6 flex-1 flex flex-col gap-5">
      <CheckInMetrics :metrics="metrics" />

      <div>
        <div class="section-label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 3h8a1 1 0 011 1v5a1 1 0 01-1 1H4l-3 2V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          Client's Notes
        </div>
        <ClientNote :text="clientNoteText" />
      </div>

      <div>
        <div class="section-label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
            <circle cx="6" cy="6" r="2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M4 2V1M8 2V1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          Progress Photo
        </div>
        <ProgressPhoto week-label="Week 14" submitted-at="Apr 14" />
      </div>

      <ResponseComposer
        v-model="response"
        :client-name="checkIn.name"
        @send="onSend"
        @save-draft="onSaveDraft"
      />

      <PreviousResponses :responses="previousResponses" />

      <div class="h-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CheckInDetailHeader from './CheckInDetailHeader.vue'
import CheckInMetrics, { type CheckInMetricsData } from './CheckInMetrics.vue'
import ClientNote from './ClientNote.vue'
import ProgressPhoto from './ProgressPhoto.vue'
import ResponseComposer from './ResponseComposer.vue'
import PreviousResponses, { type PreviousResponse } from './PreviousResponses.vue'
import type { CheckInSummary } from './CheckInCard.vue'

defineProps<{
  checkIn: CheckInSummary
  metrics: CheckInMetricsData
  previousResponses: PreviousResponse[]
}>()

// Demo copy — in a real implementation, sourced from the selected check-in payload.
const weekLabel = 'Week 14'
const submittedAt = 'Mon, Apr 14 at 8:02 AM'
const clientNoteText = '"Feeling really strong this week! Hit all 4 workouts and actually enjoyed the Saturday circuit — first time I\'ve looked forward to a session instead of dreading it. Weight is down again, first time I\'ve seen 143 on the scale. Really happy with how things are going. The high-protein breakfast you suggested has been a game changer — I\'m not starving by 11am anymore."'

const response = ref('')
const onSend = () => { response.value = '' }
const onSaveDraft = () => { /* TODO: persist draft */ }
</script>

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
