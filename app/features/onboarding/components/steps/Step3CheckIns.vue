<script setup lang="ts">
import StepHeader from '../StepHeader.vue'

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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const DEADLINE_OPTIONS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '5:00 PM', '8:00 PM']
const REMINDER_OPTIONS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
  '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM',
]

const CUSTOM_PROMPTS = [
  'How was your nutrition adherence this week? (1–10)',
  'Did you experience any pain or discomfort this week?',
  'How many steps did you average per day?',
  'Rate your energy levels this week (1–10)',
  'What habit are you most proud of this week?',
]

let customCount = 0
let nextId = 100

function toggleDay(day: string) {
  const list = props.form.selectedDays
  const i = list.indexOf(day)
  if (i >= 0) {
    if (list.length === 1) return
    list.splice(i, 1)
  } else {
    list.push(day)
  }
}

function addQuestion() {
  customCount++
  const text = CUSTOM_PROMPTS[(customCount - 1) % CUSTOM_PROMPTS.length]!
  props.form.questions.push({ id: nextId++, text, required: false, removable: true })
}

function removeQuestion(id: number) {
  const idx = props.form.questions.findIndex(q => q.id === id)
  if (idx >= 0) props.form.questions.splice(idx, 1)
}

const previewTitle = computed(() =>
  `Check-in every ${props.form.selectedDays.join(' & ')} at ${props.form.deadline}`,
)

const previewSub = computed(() => {
  const n = props.form.questions.length
  return `Reminder at ${props.form.reminder} · ${n} question${n !== 1 ? 's' : ''}`
})
</script>

<template>
  <div class="flex-1 px-10 py-10 overflow-y-auto max-md:px-5">
    <div class="max-w-[560px] mx-auto">
      <StepHeader
        title="Set up check-ins"
        sub="Weekly check-ins keep your clients accountable and your coaching data-driven."
      />

      <div class="space-y-6">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-[12px] font-medium text-(--text-secondary)">Check-in day</label>
            <span class="text-[11px] text-(--text-muted)">when clients submit their weekly update</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in DAYS"
              :key="day"
              type="button"
              class="h-10 w-10 rounded-full border-[1.5px] text-[12px] font-semibold transition-colors"
              :class="form.selectedDays.includes(day)
                ? 'border-(--green-brand) bg-(--green-brand) text-white'
                : 'border-(--border) text-(--text-secondary) hover:bg-(--bg-subtle)'"
              @click="toggleDay(day)"
            >
              {{ day }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <UFormField label="Submission deadline" name="deadline">
            <USelect v-model="form.deadline" :items="DEADLINE_OPTIONS" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Reminder sent" name="reminder">
            <USelect v-model="form.reminder" :items="REMINDER_OPTIONS" size="lg" class="w-full" />
          </UFormField>
        </div>

        <div>
          <label class="block text-[12px] font-medium text-(--text-secondary) mb-2">Check-in questions</label>
          <div class="space-y-1.5">
            <TransitionGroup name="q">
              <div
                v-for="q in form.questions"
                :key="q.id"
                class="flex items-center gap-2.5 rounded-[8px] border border-(--border) bg-(--bg-surface) px-3 py-2.5"
              >
                <UIcon name="i-lucide-grip-vertical" class="size-3.5 text-(--text-muted) shrink-0 cursor-grab" />
                <div class="flex-1 text-[12.5px] text-(--text-primary)">{{ q.text }}</div>
                <UBadge
                  :label="q.required ? 'Required' : 'Optional'"
                  :color="q.required ? 'success' : 'neutral'"
                  variant="soft"
                  size="sm"
                />
                <UButton
                  v-if="q.removable"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-x"
                  :aria-label="`Remove question: ${q.text}`"
                  @click="removeQuestion(q.id)"
                />
              </div>
            </TransitionGroup>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            block
            size="md"
            class="mt-2 border-dashed"
            icon="i-lucide-plus"
            @click="addQuestion"
          >
            Add custom question
          </UButton>
        </div>

        <div class="flex items-center gap-3 rounded-[10px] border-[1.5px] border-(--green-soft) bg-(--green-pale) px-3.5 py-3">
          <div class="h-9 w-9 rounded-md flex items-center justify-center shrink-0 bg-(--green-brand) text-white">
            <UIcon name="i-lucide-bell" class="size-4" />
          </div>
          <div class="flex-1">
            <div class="text-[12.5px] font-semibold text-(--text-primary)">{{ previewTitle }}</div>
            <div class="text-[11px] text-(--text-secondary) mt-0.5">{{ previewSub }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.q-enter-active,
.q-leave-active {
  transition: opacity 0.2s, transform 0.25s;
}
.q-enter-from { opacity: 0; transform: translateX(-12px); }
.q-leave-to   { opacity: 0; transform: translateX(12px); }
</style>
