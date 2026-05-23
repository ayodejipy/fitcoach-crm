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

const TYPE_BADGE: Record<QuestionType, string> = {
  rating: 'bg-[#FEF3C7] text-[#92400E]',
  number: 'bg-[#DBEAFE] text-[#1E40AF]',
  text:   'bg-[#F3F4F6] text-[#374151]',
  yesno:  'bg-[#D1FAE5] text-[#065F46]',
}

const TYPE_LABEL: Record<QuestionType, string> = {
  rating: 'Rating 1–10',
  number: 'Number',
  text:   'Text / Notes',
  yesno:  'Yes / No',
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
const saving  = ref(false)

const moveUp = (idx: number) => {
  if (idx === 0) return
  const arr = [...questions.value];
  [arr[idx - 1], arr[idx]] = [arr[idx]!, arr[idx - 1]!]
  questions.value = arr
}

const moveDown = (idx: number) => {
  const arr = [...questions.value]
  if (idx >= arr.length - 1) return;
  [arr[idx], arr[idx + 1]] = [arr[idx + 1]!, arr[idx]!]
  questions.value = arr
}

const removeQuestion = (id: number) => {
  questions.value = questions.value.filter(q => q.id !== id)
}

const addQuestion = () => {
  const text = newText.value.trim()
  if (!text) return
  questions.value = [...questions.value, { id: nextId++, text, type: newType.value }]
  newText.value = ''
  newType.value = 'rating'
}

async function handleSave() {
  saving.value = true
  await new Promise(r => setTimeout(r, 800))
  emit('saved', [...questions.value])
  emit('update:open', false)
  saving.value = false
}
</script>

<template>
  <UModal
    :open="open"
    title="Customize Check-in Form"
    description="Drag to reorder · changes apply to all future check-ins"
    :ui="{ body: 'overflow-y-auto max-h-[65vh]' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="flex flex-col gap-4">

        <!-- Current questions -->
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.8px] text-[#8FAD97] dark:text-(--text-muted) mb-2">
            Current Questions
          </p>
          <div class="flex flex-col gap-2">
            <div
              v-for="(q, idx) in questions"
              :key="q.id"
              class="flex items-center gap-2.5 bg-[#F7FAF8] dark:bg-white/[.03] border-[1.5px] border-[#E5EDE8] dark:border-(--border) rounded-[10px] px-3 py-2.5 hover:border-[#D1E0D5] dark:hover:border-(--text-muted)/40 transition-colors"
            >
              <!-- Drag handle (visual only) -->
              <div class="flex flex-col gap-[3px] text-[#C8D9CE] dark:text-(--text-muted) shrink-0 cursor-grab select-none">
                <span class="block w-3.5 h-[1.5px] bg-current rounded-sm" />
                <span class="block w-3.5 h-[1.5px] bg-current rounded-sm" />
                <span class="block w-3.5 h-[1.5px] bg-current rounded-sm" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-semibold text-(--text-primary) truncate">{{ q.text }}</div>
                <div class="text-[11px] text-[#6B8F72] dark:text-(--text-muted) mt-0.5">{{ TYPE_LABEL[q.type] }}</div>
              </div>

              <span
                class="text-[10px] font-bold py-[2px] px-[7px] rounded-md shrink-0 tracking-[0.2px]"
                :class="TYPE_BADGE[q.type]"
              >
                {{ q.type === 'yesno' ? 'Yes/No' : q.type.charAt(0).toUpperCase() + q.type.slice(1) }}
              </span>

              <div class="flex gap-0.5 shrink-0">
                <button
                  type="button"
                  class="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[#8FAD97] hover:bg-[#E5EDE8] hover:text-(--text-primary) dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  :disabled="idx === 0"
                  title="Move up"
                  @click="moveUp(idx)"
                >
                  <UIcon name="i-lucide-chevron-up" class="w-3 h-3" />
                </button>
                <button
                  type="button"
                  class="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[#8FAD97] hover:bg-[#E5EDE8] hover:text-(--text-primary) dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  :disabled="idx === questions.length - 1"
                  title="Move down"
                  @click="moveDown(idx)"
                >
                  <UIcon name="i-lucide-chevron-down" class="w-3 h-3" />
                </button>
                <button
                  type="button"
                  class="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[#8FAD97] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors"
                  title="Remove"
                  @click="removeQuestion(q.id)"
                >
                  <UIcon name="i-lucide-x" class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add new question -->
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.8px] text-[#8FAD97] dark:text-(--text-muted) mb-2">
            Add New Question
          </p>
          <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center p-3 bg-[#F0F9F4] dark:bg-(--bg-primary-soft) border-[1.5px] border-dashed border-[#A8D4BC] dark:border-(--green-light)/30 rounded-[10px]">
            <input
              v-model="newText"
              type="text"
              placeholder="Question text…"
              class="border-[1.5px] border-[#D1E0D5] dark:border-(--border) rounded-lg px-3 py-2 text-[13px] text-(--text-primary) bg-(--bg-surface) outline-none focus:border-(--green-brand) dark:focus:border-(--green-light) transition-colors w-full min-w-0"
              @keydown.enter="addQuestion"
            />
            <select
              v-model="newType"
              class="border-[1.5px] border-[#D1E0D5] dark:border-(--border) rounded-lg px-2.5 py-[7px] text-[12px] text-[#3D5A45] dark:text-(--text-secondary) bg-(--bg-surface) cursor-pointer outline-none"
            >
              <option v-for="opt in TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <UButton color="primary" size="sm" class="whitespace-nowrap" @click="addQuestion">Add</UButton>
          </div>
        </div>

        <!-- Tip -->
        <div class="text-[12px] text-[#6B8F72] dark:text-(--text-muted) bg-[#F7FAF8] dark:bg-white/[.03] rounded-lg px-3 py-2.5 border-l-[3px] border-[#A8D4BC] dark:border-(--green-light)/50 leading-[1.5]">
          💡 <strong>Tip:</strong> Keep your form under 8 questions to maximize completion rates. Clients respond best to short, specific check-ins.
        </div>

      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton variant="ghost" color="neutral" size="lg" :disabled="saving" @click="emit('update:open', false)">
          Cancel
        </UButton>
        <UButton color="primary" size="lg" :loading="saving" @click="handleSave">
          <svg v-if="!saving" width="13" height="13" viewBox="0 0 13 13" fill="none" class="shrink-0">
            <path d="M2 7l3 3 6-6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Save Form
        </UButton>
      </div>
    </template>
  </UModal>
</template>
