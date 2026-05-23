<template>
  <div>
    <StepHeader
      step-label="Step 3 of 4"
      title="Set up check-ins"
      sub="Weekly check-ins keep your clients accountable and your coaching data-driven."
    >
      <template #icon>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-(--text-accent)">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </template>
    </StepHeader>

    <div class="card-body px-9 py-7 min-h-[340px] max-[600px]:px-5 max-[600px]:py-5">
      <!-- Day picker — custom toggle buttons, keep as native -->
      <div class="field">
        <div class="field-label mb-2">Check-in day <span class="font-normal text-(--text-muted)">— when clients submit their weekly update</span></div>
        <div class="day-picker flex gap-2 flex-wrap mb-[18px]">
          <button
            v-for="day in days"
            :key="day"
            type="button"
            class="day-btn w-11 h-11 rounded-full border-[1.5px] text-xs font-semibold cursor-pointer transition-[border-color,background,color] duration-200 flex items-center justify-center"
            :class="form.selectedDays.includes(day)
              ? 'border-primary bg-primary text-white'
              : 'border-(--border) bg-(--bg-input) text-(--text-secondary) hover:border-(--green-mid) hover:text-primary'"
            @click="toggleDay(day)"
          >{{ day }}</button>
        </div>
      </div>

      <!-- Deadline / Reminder -->
      <div class="field-row">
        <UFormField label="Submission deadline" name="deadline" class="field !mb-0">
          <USelect v-model="form.deadline" :items="deadlineOptions" class="w-full" />
        </UFormField>
        <UFormField label="Reminder sent" name="reminder" class="field !mb-0">
          <USelect v-model="form.reminder" :items="reminderOptions" class="w-full" />
        </UFormField>
      </div>

      <!-- Questions -->
      <div>
        <div class="field-label mb-2">Check-in questions</div>
        <div class="question-list mb-[18px]">
          <TransitionGroup name="q">
            <div
              v-for="q in form.questions"
              :key="q.id"
              class="q-item flex items-start gap-2.5 py-3 px-3.5 rounded-[10px] bg-(--bg-input) border-[1.5px] border-(--border) mb-2 transition-[border-color] duration-200 hover:border-(--green-soft) dark:hover:border-white/20"
            >
              <div class="q-drag text-(--text-muted) cursor-grab mt-0.5 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </div>
              <div class="q-text flex-1 text-[13px] text-(--text-primary) leading-[1.4]">{{ q.text }}</div>
              <span
                class="q-badge text-[10.5px] font-semibold px-2 py-0.5 rounded-[10px] shrink-0"
                :class="q.required
                  ? 'bg-(--green-muted) text-primary dark:text-(--green-light)'
                  : 'bg-black/5 dark:bg-white/5 text-(--text-muted)'"
              >{{ q.required ? 'Required' : 'Optional' }}</span>
              <UButton
                v-if="q.removable"
                variant="ghost"
                color="neutral"
                class="size-6 p-0 shrink-0 mt-px text-(--text-muted) hover:text-[var(--red)]"
                @click="removeQuestion(q.id)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </UButton>
            </div>
          </TransitionGroup>
        </div>
        <UButton
          variant="outline"
          color="neutral"
          block
          class="border-dashed gap-[7px] text-(--text-muted) hover:border-(--green-mid) hover:text-primary hover:bg-(--green-pale) dark:hover:bg-(--bg-primary-soft)"
          @click="addQuestion"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add custom question
        </UButton>
      </div>

      <!-- Preview -->
      <div class="checkin-preview bg-(--green-pale) dark:bg-(--bg-primary-soft) rounded-xl py-3.5 px-4 mt-[18px] border border-(--green-soft) dark:border-(--border) flex items-center gap-3">
        <div class="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8a16 16 0 0 0 8 8l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23.7 17"/>
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-[13px] font-semibold text-(--text-primary)">{{ previewTitle }}</div>
          <div class="text-[11.5px] text-(--text-secondary) mt-0.5">{{ previewSub }}</div>
        </div>
      </div>
    </div>

    <StepFooter
      show-back
      show-skip
      :progress="75"
      @back="$emit('prev')"
      @skip="$emit('skip')"
      @continue="$emit('next')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StepHeader from '../StepHeader.vue'
import StepFooter from '../StepFooter.vue'

interface Question {
  id: number
  text: string
  required: boolean
  removable: boolean
}

const props = defineProps<{
  form: {
    selectedDays: string[]
    deadline: string
    reminder: string
    questions: Question[]
  }
}>()

defineEmits<{
  next: []
  prev: []
  skip: []
}>()

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const deadlineOptions = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '5:00 PM', '8:00 PM']
const reminderOptions = ['1 hour before', '2 hours before', 'Morning of', 'Night before', 'None']

const customPrompts = [
  'How was your nutrition adherence this week? (1–10)',
  'Did you experience any pain or discomfort this week?',
  'How many steps did you average per day?',
  'Rate your energy levels this week (1–10)',
  'What habit are you most proud of this week?',
]
let customCount = 0
let nextId = 100

const toggleDay = (day: string) => {
  const list = props.form.selectedDays
  const i = list.indexOf(day)
  if (i >= 0) {
    if (list.length === 1) return
    list.splice(i, 1)
  } else {
    list.push(day)
  }
}

const addQuestion = () => {
  customCount++
  const text = customPrompts[(customCount - 1) % customPrompts.length]!
  props.form.questions.push({ id: nextId++, text, required: false, removable: true })
}

const removeQuestion = (id: number) => {
  const idx = props.form.questions.findIndex(q => q.id === id)
  if (idx >= 0) props.form.questions.splice(idx, 1)
}

const previewTitle = computed(() => {
  const days = props.form.selectedDays.join(' & ')
  return `Check-in every ${days} at ${props.form.deadline}`
})
const previewSub = computed(() => {
  const n = props.form.questions.length
  return `Reminder ${props.form.reminder} · ${n} question${n !== 1 ? 's' : ''}`
})
</script>

<style scoped>
.q-enter-active,
.q-leave-active {
  transition: opacity .2s, transform .25s;
}
.q-enter-from { opacity: 0; transform: translateX(-12px); }
.q-leave-to   { opacity: 0; transform: translateX(12px); }
</style>
