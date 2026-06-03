<script setup lang="ts">
import { format } from 'date-fns'
import OnboardingStepRail, { type RailStep } from './OnboardingStepRail.vue'
import Step1Profile from './steps/Step1Profile.vue'
import Step2Client from './steps/Step2Client.vue'
import Step3CheckIns from './steps/Step3CheckIns.vue'
import Step4Connect from './steps/Step4Connect.vue'
import SuccessOverlay from './SuccessOverlay.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { useOnboardingApi } from '~/features/onboarding/composables/useOnboardingApi'

const authStore = useAuthStore()
const onboardingApi = useOnboardingApi()
const route = useRoute()
const router = useRouter()
const toast = useToast()

function clampStep(raw: unknown): number {
  const n = parseInt(raw as string)
  return n >= 1 && n <= 4 ? n : (authStore.coach?.onboarding_step ?? 1)
}

const currentStep = ref(clampStep(route.query.step))
const finishing = ref(false)
const success = ref(false)

const today = format(new Date(), 'yyyy-MM-dd')

const form = reactive({
  photo: null as string | null,
  photoName: '',
  firstName: (route.query.first_name as string) || authStore.coach?.first_name || '',
  lastName: (route.query.last_name as string) || authStore.coach?.last_name || '',
  slug: '',
  bio: '',
  specialty: (authStore.coach?.specialty as string) ?? null,
  clientFirstName: '',
  clientLastName: '',
  clientEmail: '',
  clientPhone: '',
  clientStartDate: today,
  clientGoal: null as string | null,
  selectedDays: ['Tue'] as string[],
  deadline: '10:00 AM',
  reminder: '2 hours before',
  questions: [
    { id: 1, text: 'How would you rate your week overall? (1–10)', required: true, removable: false },
    { id: 2, text: 'How many workouts did you complete this week?', required: true, removable: false },
    { id: 3, text: 'Current body weight (lbs)', required: true, removable: false },
    { id: 4, text: 'Rate your sleep quality (1–10)', required: false, removable: true },
    { id: 5, text: 'Any wins, struggles, or notes for your coach?', required: false, removable: true },
  ],
  connectedItems: [] as string[],
})

const SPECIALTY_LABELS: Record<string, string> = {
  'personal-training': 'Personal Training',
  'online-coaching': 'Online Coaching',
  'nutrition': 'Nutrition Coaching',
  'studio': 'Studio / Group',
}

const greeting = computed(() => {
  if (success.value) return 'Welcome aboard.'
  if (currentStep.value === 1) return "Let's get you coaching."
  if (currentStep.value === 2) return ''
  if (currentStep.value === 3) return "You're halfway there."
  if (currentStep.value === 4) return 'Almost done.'
  return ''
})

const railSteps = computed<RailStep[]>(() => {
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ').trim()
  const specialtyLabel = form.specialty ? SPECIALTY_LABELS[form.specialty] : null
  const profileSummary = fullName && specialtyLabel
    ? `${fullName} · ${specialtyLabel}`
    : fullName || (specialtyLabel ?? '')

  const clientFullName = [form.clientFirstName, form.clientLastName].filter(Boolean).join(' ').trim()
  const clientSummary = clientFullName ? `${clientFullName} · added` : ''

  const checkinSummary = form.selectedDays.length
    ? `${form.selectedDays.join('/')} at ${form.deadline} · ${form.questions.length} questions`
    : ''

  return [
    { id: 1, label: 'Your coaching profile', hint: 'Name, photo, specialty', summary: profileSummary || undefined },
    { id: 2, label: 'Add your first client', hint: 'Set up someone you coach', summary: clientSummary || undefined },
    { id: 3, label: 'Set up check-ins', hint: 'Weekly accountability', summary: checkinSummary || undefined },
    { id: 4, label: 'Connect payments & tools', hint: 'Paystack, Stripe, Zoom, or skip', summary: form.connectedItems.length ? `${form.connectedItems.length} connected` : undefined },
  ]
})

const progress = computed(() => Math.round((currentStep.value / 4) * 100))

const continueLabel = computed(() => {
  if (currentStep.value === 1) return 'Continue to Add your first client'
  if (currentStep.value === 2) return 'Continue to Set up check-ins'
  if (currentStep.value === 3) return 'Continue to Connect payments & tools'
  return 'Launch my dashboard'
})

async function goNext() {
  if (currentStep.value >= 4) return finish()
  currentStep.value++
  try {
    const updated = await onboardingApi.advance({ step: currentStep.value })
    if (authStore.coach) authStore.coach.onboarding_step = updated.onboarding_step
  } catch {
    /* non-blocking */
  }
}

function goPrev() {
  if (currentStep.value <= 1) return
  currentStep.value--
}

async function finish() {
  finishing.value = true
  try {
    const updated = await onboardingApi.advance({ step: 4 })
    if (authStore.coach) {
      authStore.coach.onboarding_done = updated.onboarding_done
      authStore.coach.onboarding_step = updated.onboarding_step
    }
    success.value = true
  } catch {
    toast.add({ title: 'Could not save onboarding', description: 'Please try again.', color: 'error' })
  } finally {
    finishing.value = false
  }
}

function goToDashboard() {
  navigateTo('/')
}

function onExit() {
  toast.add({ title: 'Progress saved', description: "We'll be here when you come back.", color: 'info' })
}

const stepComponent = computed(() => ({
  1: Step1Profile,
  2: Step2Client,
  3: Step3CheckIns,
  4: Step4Connect,
}[currentStep.value]))

watch(currentStep, (step) => {
  router.replace({ query: { ...route.query, step: String(step) } })
}, { immediate: true })

const syncNamesToUrl = useDebounceFn(() => {
  const query: Record<string, string> = { step: String(currentStep.value) }
  if (form.firstName) query.first_name = form.firstName
  if (form.lastName) query.last_name = form.lastName
  router.replace({ query })
}, 400)

watch([() => form.firstName, () => form.lastName], syncNamesToUrl)
</script>

<template>
  <OnboardingStepRail
    :steps="railSteps"
    :current-step="currentStep"
    :greeting="success ? 'Welcome aboard.' : greeting"
    @exit="onExit"
  />

  <main id="main-content" class="flex-1 min-w-0 flex flex-col bg-(--bg-surface)">
    <template v-if="success">
      <SuccessOverlay
        :coach-first-name="form.firstName"
        :client-name="[form.clientFirstName, form.clientLastName].filter(Boolean).join(' ').trim()"
        :clients-count="form.clientFirstName.trim() ? 1 : 0"
        :questions-count="form.questions.length"
        :connected-count="form.connectedItems.length"
        @dashboard="goToDashboard"
      />
    </template>

    <template v-else>
      <div class="flex items-center justify-between px-10 py-3.5 border-b border-(--border) max-md:px-5">
        <div class="flex items-center gap-3 text-[11.5px] text-(--text-muted)">
          <span class="font-medium">Step {{ currentStep }} of 4</span>
          <div class="w-40 h-1 rounded-full bg-(--bg-subtle)">
            <div class="h-1 rounded-full bg-(--green-brand) transition-[width]" :style="{ width: `${progress}%` }" />
          </div>
          <span class="tabular-nums">{{ progress }}%</span>
        </div>
        <button
          v-if="currentStep > 1 && currentStep < 4"
          type="button"
          class="text-[12px] text-(--text-muted) hover:text-(--text-primary) hover:underline"
          @click="goNext"
        >
          Skip for now
        </button>
        <button
          v-else-if="currentStep === 4"
          type="button"
          class="text-[12px] text-(--text-muted) hover:text-(--text-primary) hover:underline"
          @click="finish"
        >
          Skip — connect later
        </button>
      </div>

      <Transition name="step-fade" mode="out-in">
        <component
          :is="stepComponent"
          :key="currentStep"
          :form="form"
        />
      </Transition>

      <StepFooter
        :show-back="currentStep > 1"
        :continue-label="continueLabel"
        :loading="finishing"
        @back="goPrev"
        @continue="goNext"
      />
    </template>
  </main>
</template>

<style scoped>
.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.step-fade-enter-from { opacity: 0; transform: translateX(12px); }
.step-fade-leave-to   { opacity: 0; transform: translateX(-12px); }
</style>
