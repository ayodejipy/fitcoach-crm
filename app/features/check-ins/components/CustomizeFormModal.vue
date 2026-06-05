<script setup lang="ts">
type QuestionType = 'rating' | 'number' | 'text' | 'yesno'

export interface FormQuestion {
  id: number
  text: string
  type: QuestionType
}

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  saved: [questions: FormQuestion[]]
}>()

const TYPE_OPTIONS = [
  { label: 'Rating (1–10)', value: 'rating' as QuestionType },
  { label: 'Number',        value: 'number' as QuestionType },
  { label: 'Text / Notes',  value: 'text'   as QuestionType },
  { label: 'Yes / No',      value: 'yesno'  as QuestionType },
]

const TYPE_BADGE_COLOR: Record<QuestionType, 'warning' | 'info' | 'neutral' | 'success'> = {
  rating: 'warning',
  number: 'info',
  text:   'neutral',
  yesno:  'success',
}

const TYPE_LABEL: Record<QuestionType, string> = {
  rating: 'Rating 1–10',
  number: 'Number',
  text:   'Text / Notes',
  yesno:  'Yes / No',
}

const TYPE_BADGE_LABEL: Record<QuestionType, string> = {
  rating: 'Rating',
  number: 'Number',
  text:   'Text',
  yesno:  'Yes/No',
}

const questions = ref<FormQuestion[]>([
  { id: 1, text: 'How is your energy level this week?',       type: 'rating' },
  { id: 2, text: 'How would you rate your sleep quality?',    type: 'rating' },
  { id: 3, text: 'How many workouts did you complete?',       type: 'number' },
  { id: 4, text: 'Current body weight (lbs)',                 type: 'number' },
  { id: 5, text: "Any notes or wins you'd like to share?",    type: 'text'   },
  { id: 6, text: 'Did you stay within your nutrition plan?',  type: 'yesno'  },
])
let nextId = 7

const newText = ref('')
const newType = ref<QuestionType>('rating')
const saving = ref(false)

function moveUp(idx: number) {
  if (idx === 0) return
  const arr = [...questions.value];
  [arr[idx - 1], arr[idx]] = [arr[idx]!, arr[idx - 1]!]
  questions.value = arr
}

function moveDown(idx: number) {
  if (idx >= questions.value.length - 1) return
  const arr = [...questions.value];
  [arr[idx], arr[idx + 1]] = [arr[idx + 1]!, arr[idx]!]
  questions.value = arr
}

function removeQuestion(id: number) {
  questions.value = questions.value.filter(question => question.id !== id)
}

function addQuestion() {
  const text = newText.value.trim()
  if (!text) return
  questions.value = [...questions.value, { id: nextId++, text, type: newType.value }]
  newText.value = ''
  newType.value = 'rating'
}

async function handleSave() {
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  emit('saved', [...questions.value])
  emit('update:open', false)
  saving.value = false
}
</script>

<template>
  <UModal
    :open="open"
    title="Customize check-in form"
    description="Reorder, remove, or add questions. Changes apply to all future check-ins."
    :ui="{ body: 'p-5 space-y-4', footer: 'p-4' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <section aria-labelledby="current-questions-heading">
        <h3 id="current-questions-heading" class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-2">
          Current questions
        </h3>
        <ul class="space-y-1.5">
          <li
            v-for="(question, idx) in questions"
            :key="question.id"
            class="flex items-center gap-2.5 rounded-md border border-(--border) bg-(--bg-surface) px-3 py-2.5"
          >
            <UIcon
              name="i-hugeicons-drag-04"
              class="size-3.5 text-(--text-muted) shrink-0 cursor-grab"
              aria-hidden="true"
            />

            <div class="flex-1 min-w-0">
              <div class="text-[12.5px] font-semibold text-(--text-primary) truncate">{{ question.text }}</div>
              <div class="text-[11px] text-(--text-muted) mt-0.5">{{ TYPE_LABEL[question.type] }}</div>
            </div>

            <UBadge
              :label="TYPE_BADGE_LABEL[question.type]"
              :color="TYPE_BADGE_COLOR[question.type]"
              variant="soft"
              size="sm"
            />

            <div class="flex gap-0.5 shrink-0">
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                icon="i-lucide-chevron-up"
                :disabled="idx === 0"
                :aria-label="`Move question up: ${question.text}`"
                @click="moveUp(idx)"
              />
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                icon="i-lucide-chevron-down"
                :disabled="idx === questions.length - 1"
                :aria-label="`Move question down: ${question.text}`"
                @click="moveDown(idx)"
              />
              <UButton
                variant="ghost"
                color="error"
                size="xs"
                icon="i-lucide-x"
                :aria-label="`Remove question: ${question.text}`"
                @click="removeQuestion(question.id)"
              />
            </div>
          </li>
        </ul>
      </section>

      <section aria-labelledby="add-question-heading">
        <h3 id="add-question-heading" class="text-[10.5px] font-semibold uppercase tracking-wide text-(--text-muted) mb-2">
          Add new question
        </h3>
        <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center p-3 rounded-md border border-dashed border-(--green-soft) bg-(--green-pale)/60">
          <UInput
            v-model="newText"
            placeholder="Question text…"
            size="sm"
            class="w-full"
            @keydown.enter="addQuestion"
          />
          <USelect
            v-model="newType"
            :items="TYPE_OPTIONS"
            value-key="value"
            label-key="label"
            size="sm"
          />
          <UButton color="primary" size="sm" :disabled="!newText.trim()" @click="addQuestion">
            Add
          </UButton>
        </div>
      </section>

      <UAlert
        color="success"
        variant="soft"
        icon="i-hugeicons-bulb"
        title="Keep it short"
        description="Forms under 8 questions get the best completion rates. Clients respond best to short, specific check-ins."
      />
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton variant="ghost" color="neutral" :disabled="saving" @click="emit('update:open', false)">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :loading="saving"
          :trailing-icon="saving ? undefined : 'i-lucide-check'"
          @click="handleSave"
        >
          Save form
        </UButton>
      </div>
    </template>
  </UModal>
</template>
