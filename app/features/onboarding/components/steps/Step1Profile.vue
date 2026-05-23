<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StepHeader from '../StepHeader.vue'
import StepFooter from '../StepFooter.vue'
import { useOnboardingApi } from '../../composables/useOnboardingApi';

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

const api = useOnboardingApi();

const firstNameInvalid = ref(false)
const slugStatus = ref<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle')
const specErr = ref(false)
const progress = ref(0)

const specialtyOptions = [
  { id: 'personal-training', emoji: '🏋️', name: 'Personal Training', desc: '1-on-1 in-person sessions' },
  { id: 'online-coaching', emoji: '🌐', name: 'Online Coaching', desc: 'Remote program delivery' },
  { id: 'nutrition', emoji: '🥗', name: 'Nutrition Coaching', desc: 'Diet, macros & habits' },
  { id: 'studio', emoji: '🏢', name: 'Studio / Group', desc: 'Classes & group formats' },
]

const selectSpec = (id: string) => {
  props.form.specialty = id
  specErr.value = false
}

const liveValFirst = () => {
  if (firstNameInvalid.value && props.form.firstName.trim()) {
    firstNameInvalid.value = false
  }
}
const blurFirst = () => {
  firstNameInvalid.value = !props.form.firstName.trim()
}

const checkSlug = useDebounceFn(async () => {
  const val = props.form.slug.trim()
  if (!val) { slugStatus.value = 'idle'; return }
  slugStatus.value = 'checking'
  try {
    const res = await api.checkSlugAvailability(val)
    slugStatus.value = res.available ? 'available' : 'taken'
  } catch {
    slugStatus.value = 'error'
  }
}, 600)

const onSlugInput = () => {
  if (!props.form.slug.trim()) { slugStatus.value = 'idle'; return }
  slugStatus.value = 'checking'
  checkSlug()
}

const onSlugBlur = () => {
  if (!props.form.slug.trim()) slugStatus.value = 'idle'
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

<template>
  <div>
    <StepHeader
      step-label="Step 1 of 4"
      title="Your coaching profile"
      sub="This is how your clients will see you. Takes about 2 minutes."
    >
      <template #icon>
        <UIcon name="i-lucide-user" class="size-6 text-(--text-accent)" />
      </template>
    </StepHeader>

    <div class="px-9 py-7 min-h-[340px] max-[600px]:px-5 max-[600px]:py-5">
      <!-- Photo upload — <label> wraps the hidden file input; keep native -->
      <label class="flex items-center gap-5 p-[18px] rounded-xl border-[1.5px] border-dashed border-(--border) bg-(--bg-input) cursor-pointer mb-[22px] transition-[border-color,background] duration-200 hover:border-(--green-mid) hover:bg-(--green-pale) dark:hover:bg-(--bg-primary-soft)">
        <div class="w-16 h-16 rounded-full bg-(--green-pale) dark:bg-(--bg-primary-soft) flex items-center justify-center overflow-hidden shrink-0 border-2 border-(--border)">
          <img v-if="form.photo" :src="form.photo" alt="" class="w-full h-full object-cover">
          <UIcon v-else name="i-lucide-user" class="size-7 text-(--text-accent)" />
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
        <UFormField
          label="First name"
          name="firstName"
          :error="firstNameInvalid ? 'Required' : undefined"
          class="field mb-0!"
        >
          <UInput
            v-model="form.firstName"
            placeholder="Jordan"
            class="w-full"
            @input="liveValFirst"
            @blur="blurFirst"
          />
        </UFormField>
        <UFormField label="Last name" name="lastName" class="field mb-0!">
          <UInput v-model="form.lastName" placeholder="Cole" class="w-full" />
        </UFormField>
      </div>

      <!-- Portal URL slug -->
      <UFormField label="Your client portal URL" name="slug" hint="how clients find you" class="field">
        <UInput
          v-model="form.slug"
          placeholder="jordan-cole"
          class="w-full"
          @input="onSlugInput"
          @blur="onSlugBlur"
        >
          <template #leading>
            <span class="text-(--text-muted) text-xs font-medium select-none">fitcoach.io/</span>
          </template>
          <template #trailing>
            <UIcon v-if="slugStatus === 'checking'" name="i-lucide-loader-circle" class="size-3.5 animate-spin text-(--text-muted)" />
            <UIcon v-else-if="slugStatus === 'available'" name="i-lucide-circle-check" class="size-3.5 text-primary" />
            <UIcon v-else-if="slugStatus === 'taken' || slugStatus === 'error'" name="i-lucide-circle-x" class="size-3.5 text-[var(--red)]" />
          </template>
        </UInput>
        <div class="field-msg ok mt-1.5" :class="{ show: slugStatus === 'available' }">
          <UIcon name="i-lucide-circle-check" class="size-3 shrink-0" />
          fitcoach.io/{{ form.slug }} is available
        </div>
        <div class="field-msg err mt-1.5" :class="{ show: slugStatus === 'taken' }">
          <UIcon name="i-lucide-circle-alert" class="size-3 shrink-0" />
          fitcoach.io/{{ form.slug }} is already taken
        </div>
        <div class="field-msg err mt-1.5" :class="{ show: slugStatus === 'error' }">
          <UIcon name="i-lucide-circle-alert" class="size-3 shrink-0" />
          Could not check availability — please try again
        </div>
      </UFormField>

      <!-- Bio -->
      <UFormField label="Short bio" name="bio" hint="optional" class="field">
        <UTextarea
          v-model="form.bio"
          :rows="3"
          class="w-full resize-y"
          placeholder="I help busy professionals build sustainable fitness habits through personalized programming and weekly accountability…"
          maxlength="240"
        />
        <div class="field-hint mt-1">{{ form.bio.length }} / 240 characters</div>
      </UFormField>

      <!-- Specialty — custom selection cards, keep as native buttons -->
      <div>
        <div class="field-label mb-2">Primary coaching type</div>
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
              <UIcon name="i-lucide-check" class="size-2.5 text-white" />
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
