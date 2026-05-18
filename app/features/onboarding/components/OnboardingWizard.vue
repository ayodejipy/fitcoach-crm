<template>
  <div class="wizard-wrap relative z-1 w-full max-w-[680px] flex flex-col items-center mx-auto">
    <!-- Logo -->
    <div class="wiz-logo flex items-center gap-2.5 mb-7 max-[600px]:mb-[18px]">
      <div class="w-[34px] h-[34px] rounded-[9px] bg-primary flex items-center justify-center shadow-[0_2px_12px_rgba(46,204,113,0.3)] shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span class="text-[17px] font-bold text-white/92 tracking-[-0.2px]">FitCoach</span>
    </div>

    <StepIndicator :current-step="currentStep" />

    <!-- Wizard card -->
    <div class="wiz-card bg-(--bg-surface) w-full rounded-[20px] overflow-hidden relative shadow-[0_24px_80px_rgba(0,0,0,0.35),0_4px_20px_rgba(0,0,0,0.2)] dark:border dark:border-white/10">
      <Transition :name="direction === 'forward' ? 'step-forward' : 'step-back'" mode="out-in">
        <component
          :is="stepComponent"
          :key="currentStep"
          :form="form"
          :loading="finishing"
          @next="goNext"
          @prev="goPrev"
          @skip="goNext"
          @finish="finish"
        />
      </Transition>

      <SuccessOverlay
        v-if="success"
        :clients="form.clientFirstName.trim() ? 1 : 0"
        :questions="form.questions.length"
        :tools="form.connectedTools.length"
        @dashboard="goToDashboard"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import StepIndicator from './StepIndicator.vue'
import SuccessOverlay from './SuccessOverlay.vue'
import Step1Profile from './steps/Step1Profile.vue'
import Step2Client from './steps/Step2Client.vue'
import Step3CheckIns from './steps/Step3CheckIns.vue'
import Step4Tools from './steps/Step4Tools.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { useOnboardingApi } from '~/features/onboarding/composables/useOnboardingApi'

const authStore = useAuthStore()
const onboardingApi = useOnboardingApi()

const currentStep = ref(authStore.coach?.onboarding_step ?? 1)
const direction = ref<'forward' | 'back'>('forward')
const success = ref(false)
const finishing = ref(false)

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  // Step 1 — Profile
  photo: null as string | null,
  photoName: '',
  firstName: authStore.coach?.first_name ?? '',
  lastName: authStore.coach?.last_name ?? '',
  slug: '',
  bio: '',
  specialty: authStore.coach?.specialty ?? null as string | null,
  // Step 2 — Client
  clientFirstName: '',
  clientLastName: '',
  clientEmail: '',
  clientPhone: '',
  clientStartDate: today ?? '',
  clientGoal: null as string | null,
  // Step 3 — Check-ins
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
  // Step 4 — Tools
  connectedTools: [] as string[],
})

const stepComponent = computed(() => {
  switch (currentStep.value) {
    case 1: return Step1Profile
    case 2: return Step2Client
    case 3: return Step3CheckIns
    case 4: return Step4Tools
    default: return Step1Profile
  }
})

const goNext = async () => {
  if (currentStep.value >= 4) return
  direction.value = 'forward'
  currentStep.value++
  // Persist progress; errors are non-blocking
  try {
    const updated = await onboardingApi.advance({ step: currentStep.value })
    if (authStore.coach) authStore.coach.onboarding_step = updated.onboarding_step
  } catch { /* progress save failed — user can still continue */ }
}

const goPrev = () => {
  if (currentStep.value <= 1) return
  direction.value = 'back'
  currentStep.value--
}

const finish = async () => {
  finishing.value = true
  try {
    const updated = await onboardingApi.advance({ step: 4 })
    if (authStore.coach) {
      authStore.coach.onboarding_done = updated.onboarding_done
      authStore.coach.onboarding_step = updated.onboarding_step
    }
    success.value = true
  } catch {
    useToast().add({ title: 'Could not save onboarding', description: 'Please try again.', color: 'error' })
  } finally {
    finishing.value = false
  }
}

const goToDashboard = () => navigateTo('/')
</script>

<style>
/* Step transition animations (non-scoped so they apply to slotted step components) */
.step-forward-enter-active,
.step-forward-leave-active,
.step-back-enter-active,
.step-back-leave-active {
  transition: opacity .3s cubic-bezier(.4, 0, .2, 1), transform .3s cubic-bezier(.4, 0, .2, 1);
}
.step-forward-enter-from { opacity: 0; transform: translateX(24px); }
.step-forward-leave-to   { opacity: 0; transform: translateX(-24px); }
.step-back-enter-from    { opacity: 0; transform: translateX(-24px); }
.step-back-leave-to      { opacity: 0; transform: translateX(24px); }
</style>
