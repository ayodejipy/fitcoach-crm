<template>
  <div>
    <StepHeader
      step-label="Step 1 of 4"
      title="Your coaching profile"
      sub="This is how your clients will see you. Takes about 2 minutes."
    >
      <template #icon>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-(--text-accent)">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </template>
    </StepHeader>

    <div class="px-9 py-7 min-h-[340px] max-[600px]:px-5 max-[600px]:py-5">
      <!-- Photo upload -->
      <label class="flex items-center gap-5 p-[18px] rounded-xl border-[1.5px] border-dashed border-(--border) bg-(--bg-input) cursor-pointer mb-[22px] transition-[border-color,background] duration-200 hover:border-(--green-mid) hover:bg-(--green-pale) dark:hover:bg-(--bg-primary-soft)">
        <div class="w-16 h-16 rounded-full bg-(--green-pale) dark:bg-(--bg-primary-soft) flex items-center justify-center overflow-hidden shrink-0 border-2 border-(--border)">
          <img v-if="form.photo" :src="form.photo" alt="" class="w-full h-full object-cover">
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-(--text-accent)">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-[13.5px] font-semibold text-(--text-primary)">{{ form.photoName || 'Add a profile photo' }}</div>
          <div class="text-xs text-(--text-muted) mt-0.5">{{ form.photo ? 'Photo ready · click to change' : 'PNG, JPG up to 5MB — shown on your client portal' }}</div>
        </div>
        <span class="h-[34px] px-3.5 rounded-lg border-[1.5px] border-(--border) bg-(--bg-surface) text-(--text-secondary) text-[12.5px] font-semibold cursor-pointer transition-colors duration-200 whitespace-nowrap flex items-center hover:border-(--green-mid) hover:text-primary">Upload</span>
        <input type="file" accept="image/*" class="hidden" @change="onPhotoChange">
      </label>

      <!-- Name row -->
      <div class="field-row">
        <div class="field mb-0!">
          <label class="field-label">First name</label>
          <input
            v-model="form.firstName"
            type="text"
            class="field-input"
            :class="{ valid: firstNameValid, invalid: firstNameInvalid }"
            placeholder="Jordan"
            @input="liveValFirst"
            @blur="blurFirst"
          >
          <div class="field-msg err" :class="{ show: firstNameInvalid }">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Required
          </div>
        </div>
        <div class="field mb-0!">
          <label class="field-label">Last name</label>
          <input v-model="form.lastName" type="text" class="field-input" placeholder="Cole">
        </div>
      </div>

      <!-- Portal URL slug -->
      <div class="field">
        <label class="field-label">Your client portal URL <span>— how clients find you</span></label>
        <div class="prefix-input-wrap">
          <span class="prefix-label-text">fitcoach.io/</span>
          <input
            v-model="form.slug"
            type="text"
            class="prefix-input"
            placeholder="jordan-cole"
            @input="handleSlug"
            @blur="blurSlug"
          >
        </div>
        <div class="field-msg ok" :class="{ show: slugOk }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          fitcoach.io/{{ form.slug }} is available
        </div>
        <div class="field-msg err" :class="{ show: slugErr }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Only letters, numbers, and hyphens
        </div>
      </div>

      <!-- Bio -->
      <div class="field">
        <label class="field-label">Short bio <span>— optional</span></label>
        <textarea
          v-model="form.bio"
          class="field-textarea"
          rows="3"
          placeholder="I help busy professionals build sustainable fitness habits through personalized programming and weekly accountability…"
          maxlength="240"
        ></textarea>
        <div class="field-hint">{{ form.bio.length }} / 240 characters</div>
      </div>

      <!-- Specialty -->
      <div>
        <label class="field-label">Primary coaching type</label>
        <div
          class="grid grid-cols-2 gap-2.5 mb-5 max-[600px]:grid-cols-1 rounded-xl transition-[outline] duration-300"
          :class="{ 'outline-2 outline-(--red)': specErr }"
        >
          <button
            v-for="opt in specialtyOptions"
            :key="opt.id"
            type="button"
            class="flex items-center gap-2.5 px-3.5 py-3 rounded-[12px] border-[1.5px] cursor-pointer select-none transition-[border-color,background,box-shadow] duration-200 text-left w-full"
            :class="form.specialty === opt.id
              ? 'border-primary bg-(--green-pale) dark:bg-(--bg-primary-soft) shadow-[0_0_0_3px_rgba(26,122,74,0.1)] dark:shadow-none'
              : 'border-(--border) bg-(--bg-input) hover:border-(--green-mid) hover:bg-(--bg-surface)'"
            @click="selectSpec(opt.id)"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-[17px] shrink-0 transition-[background] duration-200"
              :class="form.specialty === opt.id
                ? 'bg-[rgba(26,122,74,0.16)] dark:bg-[rgba(46,204,113,0.22)]'
                : 'bg-[rgba(26,122,74,0.08)] dark:bg-[rgba(46,204,113,0.12)]'"
            >{{ opt.emoji }}</div>
            <div class="flex-1">
              <div class="text-[13px] font-semibold text-(--text-primary)">{{ opt.name }}</div>
              <div class="text-[11px] text-(--text-muted) leading-[1.3]">{{ opt.desc }}</div>
            </div>
            <div
              v-if="form.specialty === opt.id"
              class="w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center ml-auto shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </button>
        </div>
        <div class="field-msg err" :class="{ show: specErr }">Select a coaching type</div>
      </div>
    </div>

    <StepFooter
      info-text="Takes 2 minutes · Save draft anytime"
      :progress="progress"
      @continue="onContinue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepHeader from '../StepHeader.vue'
import StepFooter from '../StepFooter.vue'

const props = defineProps<{
  form: {
    photo: string | null
    photoName: string
    firstName: string
    lastName: string
    slug: string
    bio: string
    specialty: string | null
  }
}>()

const emit = defineEmits<{
  next: []
}>()

const firstNameValid = ref(false)
const firstNameInvalid = ref(false)
const slugOk = ref(false)
const slugErr = ref(false)
const specErr = ref(false)
const progress = ref(0)

const specialtyOptions = [
  { id: 'personal-training', emoji: '🏋️', name: 'Personal Training', desc: '1-on-1 in-person sessions' },
  { id: 'online-coaching',   emoji: '🌐', name: 'Online Coaching', desc: 'Remote program delivery' },
  { id: 'nutrition',         emoji: '🥗', name: 'Nutrition Coaching', desc: 'Diet, macros & habits' },
  { id: 'studio',            emoji: '🏢', name: 'Studio / Group', desc: 'Classes & group formats' },
]

const selectSpec = (id: string) => {
  props.form.specialty = id
  specErr.value = false
}

const liveValFirst = () => {
  if (firstNameInvalid.value && props.form.firstName.trim()) {
    firstNameInvalid.value = false
    firstNameValid.value = true
  }
}
const blurFirst = () => {
  if (!props.form.firstName.trim()) {
    firstNameInvalid.value = true
    firstNameValid.value = false
  } else {
    firstNameValid.value = true
    firstNameInvalid.value = false
  }
}

let slugTimer: ReturnType<typeof setTimeout> | null = null
const handleSlug = () => {
  slugOk.value = false
  slugErr.value = false
  if (slugTimer) clearTimeout(slugTimer)
  const val = props.form.slug.trim()
  if (!val) return
  if (!/^[a-zA-Z0-9-]+$/.test(val)) {
    slugErr.value = true
    return
  }
  slugTimer = setTimeout(() => { slugOk.value = true }, 500)
}
const blurSlug = () => {
  if (!props.form.slug.trim()) {
    slugOk.value = false
    slugErr.value = false
  }
}

const onPhotoChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    props.form.photo = ev.target?.result as string
    props.form.photoName = file.name
  }
  reader.readAsDataURL(file)
}

const onContinue = () => {
  if (!props.form.firstName.trim()) {
    firstNameInvalid.value = true
    return
  }
  if (!props.form.specialty) {
    specErr.value = true
    setTimeout(() => { specErr.value = false }, 1400)
    return
  }
  emit('next')
}

onMounted(() => {
  setTimeout(() => { progress.value = 25 }, 120)
})
</script>
