<template>
  <div>
    <StepHeader
      step-label="Step 2 of 4"
      title="Add your first client"
      sub="You can always add more later. Let's start with one to set everything up."
    >
      <template #icon>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-(--text-accent)">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </template>
    </StepHeader>

    <div class="card-body px-9 py-7 min-h-[340px] max-[600px]:px-5 max-[600px]:py-5">
      <!-- Live preview card -->
      <div class="client-card-preview bg-(--green-pale) dark:bg-(--bg-primary-soft) rounded-[14px] p-4 px-[18px] flex items-center gap-3.5 mb-5 border-[1.5px] border-(--green-soft) dark:border-(--border)">
        <div class="w-11 h-11 rounded-full bg-linear-to-br from-primary to-(--green-mid) flex items-center justify-center text-base font-bold text-white shrink-0">{{ initials }}</div>
        <div class="flex-1">
          <div class="text-sm font-semibold text-(--text-primary)">{{ previewName }}</div>
          <div class="text-xs text-(--text-secondary) mt-0.5">{{ previewEmail }}</div>
        </div>
        <div class="text-[11px] font-semibold py-[3px] px-2.5 rounded-[20px] bg-[rgba(26,122,74,0.12)] text-primary dark:bg-(--bg-primary-soft) dark:text-(--green-light)">New client</div>
      </div>

      <!-- Name row -->
      <div class="field-row">
        <div class="field !mb-0">
          <label class="field-label">First name</label>
          <input v-model="form.clientFirstName" type="text" class="field-input" placeholder="Sofia">
        </div>
        <div class="field !mb-0">
          <label class="field-label">Last name <span>— optional</span></label>
          <input v-model="form.clientLastName" type="text" class="field-input" placeholder="Rodriguez">
        </div>
      </div>

      <!-- Email -->
      <div class="field">
        <label class="field-label">Email address</label>
        <input
          v-model="form.clientEmail"
          type="email"
          class="field-input"
          :class="{ invalid: emailInvalid, valid: emailValid }"
          placeholder="sofia@email.com"
          @input="liveValEmail"
          @blur="blurEmail"
        >
        <div class="field-msg err" :class="{ show: emailInvalid }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Enter a valid email address
        </div>
      </div>

      <!-- Phone / Start date -->
      <div class="field-row">
        <div class="field !mb-0">
          <label class="field-label">Phone <span>— optional</span></label>
          <input v-model="form.clientPhone" type="tel" class="field-input" placeholder="+1 (555) 000-0000">
        </div>
        <div class="field !mb-0">
          <label class="field-label">Start date</label>
          <input v-model="form.clientStartDate" type="date" class="field-input">
        </div>
      </div>

      <!-- Goals -->
      <div>
        <label class="field-label">Primary goal <span>— pick one</span></label>
        <div class="goal-pills flex flex-wrap gap-2 mb-5">
          <button
            v-for="g in goalOptions"
            :key="g"
            type="button"
            class="goal-pill px-3.5 py-[7px] rounded-[20px] border-[1.5px] text-[12.5px] cursor-pointer select-none transition-[border-color,background,color] duration-200"
            :class="form.clientGoal === g
              ? 'border-primary bg-(--green-pale) dark:bg-(--bg-primary-soft) text-primary dark:text-(--green-light) font-semibold'
              : 'border-(--border) bg-(--bg-input) text-(--text-secondary) font-medium hover:border-(--green-mid) hover:text-primary'"
            @click="form.clientGoal = g"
          >{{ g }}</button>
        </div>
      </div>
    </div>

    <StepFooter
      show-back
      show-skip
      :progress="50"
      @back="$emit('prev')"
      @skip="$emit('skip')"
      @continue="onContinue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StepHeader from '../StepHeader.vue'
import StepFooter from '../StepFooter.vue'

const props = defineProps<{
  form: {
    clientFirstName: string
    clientLastName: string
    clientEmail: string
    clientPhone: string
    clientStartDate: string
    clientGoal: string | null
  }
}>()

const emit = defineEmits<{
  next: []
  prev: []
  skip: []
}>()

const emailInvalid = ref(false)
const emailValid = ref(false)

const goalOptions = [
  '🏋️ Build Muscle',
  '🔥 Lose Weight',
  '🧘 Improve Fitness',
  '🥗 Nutrition Focus',
  '🏃 Athletic Performance',
  '💪 Strength & Conditioning',
]

const initials = computed(() => {
  const f = props.form.clientFirstName.trim()[0] ?? ''
  const l = props.form.clientLastName.trim()[0] ?? ''
  return (f + l).toUpperCase() || '?'
})

const previewName = computed(() => {
  const name = [props.form.clientFirstName, props.form.clientLastName].map(s => s.trim()).filter(Boolean).join(' ')
  return name || 'Client name'
})

const previewEmail = computed(() => props.form.clientEmail.trim() || 'email@example.com')

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const liveValEmail = () => {
  if (emailInvalid.value && props.form.clientEmail.trim() && isValidEmail(props.form.clientEmail.trim())) {
    emailInvalid.value = false
    emailValid.value = true
  }
}

const blurEmail = () => {
  const v = props.form.clientEmail.trim()
  if (!v) {
    emailInvalid.value = false
    emailValid.value = false
    return
  }
  if (!isValidEmail(v)) {
    emailInvalid.value = true
    emailValid.value = false
  } else {
    emailValid.value = true
    emailInvalid.value = false
  }
}

const onContinue = () => {
  const email = props.form.clientEmail.trim()
  const first = props.form.clientFirstName.trim()
  // If both empty, treat as skip (advance anyway — source behavior)
  if (!first && !email) {
    emit('next')
    return
  }
  if (email && !isValidEmail(email)) {
    emailInvalid.value = true
    return
  }
  emit('next')
}
</script>
