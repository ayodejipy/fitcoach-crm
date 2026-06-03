<script setup lang="ts">
import StepHeader from '../StepHeader.vue'
import { useOnboardingApi } from '../../composables/useOnboardingApi'

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

const api = useOnboardingApi()

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error'
const slugStatus = ref<SlugStatus>('idle')

const SPECIALTY_OPTIONS = [
  { id: 'personal-training', emoji: '🏋️', name: 'Personal Training', desc: '1-on-1 in-person sessions' },
  { id: 'online-coaching',   emoji: '🌐', name: 'Online Coaching',   desc: 'Remote program delivery' },
  { id: 'nutrition',         emoji: '🥗', name: 'Nutrition Coaching', desc: 'Diet, macros & habits' },
  { id: 'studio',            emoji: '🏢', name: 'Studio / Group',     desc: 'Classes & group formats' },
] as const

function selectSpecialty(id: string) {
  props.form.specialty = id
}

const checkSlug = useDebounceFn(async () => {
  const value = props.form.slug.trim()
  if (!value) { slugStatus.value = 'idle'; return }
  slugStatus.value = 'checking'
  try {
    const res = await api.checkSlugAvailability(value)
    slugStatus.value = res.available ? 'available' : 'taken'
  } catch {
    slugStatus.value = 'error'
  }
}, 600)

function onSlugInput() {
  if (!props.form.slug.trim()) { slugStatus.value = 'idle'; return }
  slugStatus.value = 'checking'
  checkSlug()
}

function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    props.form.photo = ev.target?.result as string
    props.form.photoName = file.name
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="flex-1 px-10 py-10 overflow-y-auto max-md:px-5">
    <div class="max-w-[520px] mx-auto">
      <StepHeader
        title="Your coaching profile"
        sub="This is how your clients will see you. Takes about 2 minutes."
      />

      <div class="space-y-5">
        <label class="flex items-center gap-4 p-4 rounded-[10px] border-[1.5px] border-dashed border-(--border) cursor-pointer hover:bg-(--brand-subtle, var(--green-pale))">
          <span class="h-14 w-14 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-(--green-pale)">
            <img v-if="form.photo" :src="form.photo" alt="" class="w-full h-full object-cover">
            <UIcon v-else name="i-lucide-user" class="size-6 text-(--green-brand)" />
          </span>
          <div class="flex-1">
            <div class="text-[13px] font-semibold text-(--text-primary)">{{ form.photoName || 'Add a profile photo' }}</div>
            <div class="text-[11.5px] text-(--text-muted) mt-0.5">PNG, JPG up to 5MB — shown on your client portal</div>
          </div>
          <span class="rounded-md border border-(--border) px-3 py-1.5 text-[12px] font-semibold bg-(--bg-surface)">Upload</span>
          <input type="file" accept="image/*" class="hidden" @change="onPhotoChange">
        </label>

        <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <UFormField label="First name" name="firstName" required>
            <UInput v-model="form.firstName" placeholder="Jordan" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Last name" name="lastName">
            <UInput v-model="form.lastName" placeholder="Cole" size="lg" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Your client portal URL" name="slug" hint="how clients find you">
          <UInput
            v-model="form.slug"
            placeholder="jordan-cole"
            size="lg"
            class="w-full"
            @input="onSlugInput"
          >
            <template #leading>
              <span class="text-(--text-muted) text-[12.5px] font-mono">fitcoach.io/</span>
            </template>
            <template #trailing>
              <UIcon v-if="slugStatus === 'checking'" name="i-lucide-loader-circle" class="size-3.5 animate-spin text-(--text-muted)" />
              <UIcon v-else-if="slugStatus === 'available'" name="i-lucide-circle-check" class="size-3.5 text-(--green-brand)" />
              <UIcon v-else-if="slugStatus === 'taken' || slugStatus === 'error'" name="i-lucide-circle-x" class="size-3.5 text-(--red)" />
            </template>
          </UInput>
          <template #help>
            <p v-if="slugStatus === 'available' && form.slug" class="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-(--green-brand)">
              <UIcon name="i-lucide-check" class="size-3" />
              fitcoach.io/{{ form.slug }} is available
            </p>
            <p v-else-if="slugStatus === 'taken'" class="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-(--red)">
              <UIcon name="i-lucide-circle-alert" class="size-3" />
              fitcoach.io/{{ form.slug }} is already taken
            </p>
          </template>
        </UFormField>

        <UFormField label="Short bio" name="bio" hint="optional">
          <UTextarea
            v-model="form.bio"
            :rows="3"
            placeholder="I help busy professionals build sustainable fitness habits…"
            maxlength="240"
            class="w-full resize-y"
          />
          <template #help>
            <p class="text-[10.5px] text-(--text-muted) mt-1 tabular-nums">{{ form.bio.length }} / 240 characters</p>
          </template>
        </UFormField>

        <div>
          <label class="block text-[12px] font-medium text-(--text-secondary) mb-2">Primary coaching type</label>
          <div class="grid grid-cols-2 gap-2.5 max-md:grid-cols-1">
            <button
              v-for="opt in SPECIALTY_OPTIONS"
              :key="opt.id"
              type="button"
              class="flex items-center gap-2.5 rounded-[10px] border-[1.5px] px-3 py-2.5 text-left transition-colors"
              :class="form.specialty === opt.id
                ? 'border-(--green-brand) bg-(--green-pale)'
                : 'border-(--border) hover:bg-(--bg-subtle)'"
              @click="selectSpecialty(opt.id)"
            >
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-md text-[15px] bg-(--green-pale)">
                {{ opt.emoji }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-[12.5px] font-semibold text-(--text-primary)">{{ opt.name }}</div>
                <div class="text-[10.5px] text-(--text-muted)">{{ opt.desc }}</div>
              </div>
              <span
                v-if="form.specialty === opt.id"
                aria-hidden="true"
                class="inline-flex h-4 w-4 items-center justify-center rounded-full text-white bg-(--green-brand) shrink-0"
              >
                <UIcon name="i-lucide-check" class="size-2.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
