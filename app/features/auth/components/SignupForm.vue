<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-[800] text-(--text-primary) tracking-[-0.4px] mb-1.5">Start coaching smarter</h2>
      <p class="text-sm text-(--text-muted) leading-[1.5]">Free to start — no credit card needed</p>
    </div>

    <!-- Google -->
    <button class="flex items-center justify-center gap-2.5 w-full h-11 bg-(--bg-input) border-[1.5px] border-(--border) rounded-[10px] font-inherit text-sm font-semibold text-(--text-primary) cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none hover:border-(--border-strong) hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:-translate-y-[1px]" @click="$emit('toast', 'Google sign-up coming in Phase 2')">
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Sign up with Google
    </button>

    <div class="flex items-center gap-3 my-5">
      <div class="flex-1 h-px bg-(--border)"></div>
      <span class="text-xs text-(--text-muted) font-medium">or sign up with email</span>
      <div class="flex-1 h-px bg-(--border)"></div>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="handleSignup" novalidate>
      <!-- Name row -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5 relative">
          <label for="s-first" class="text-[13px] font-semibold text-(--text-secondary)">First name <span class="text-primary">*</span></label>
          <UInput
            id="s-first"
            v-model="first"
            size="xl"
            :color="errors.first ? 'red' : (valids.first ? 'green' : 'gray')"
            placeholder="Jordan" autocomplete="given-name"
            @blur="validateField('first', v => v.trim().length > 0)"
            @input="validateLive('first', v => v.trim().length > 0)"
            :ui="{ rounded: 'rounded-[10px]' }"
          />
          <span class="text-[11.5px] text-(--red) mt-px" :class="{ hidden: !errors.first }">Required</span>
        </div>
        <div class="flex flex-col gap-1.5 relative">
          <label for="s-last" class="text-[13px] font-semibold text-(--text-secondary)">Last name <span class="text-primary">*</span></label>
          <UInput
            id="s-last"
            v-model="last"
            size="xl"
            :color="errors.last ? 'red' : (valids.last ? 'green' : 'gray')"
            placeholder="Rivera" autocomplete="family-name"
            @blur="validateField('last', v => v.trim().length > 0)"
            @input="validateLive('last', v => v.trim().length > 0)"
            :ui="{ rounded: 'rounded-[10px]' }"
          />
          <span class="text-[11.5px] text-(--red) mt-px" :class="{ hidden: !errors.last }">Required</span>
        </div>
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-1.5 relative">
        <label for="s-email" class="text-[13px] font-semibold text-(--text-secondary)">Email address <span class="text-primary">*</span></label>
        <UInput
          id="s-email"
          v-model="email"
          type="email"
          icon="i-heroicons-envelope"
          size="xl"
          :color="errors.email ? 'red' : (valids.email ? 'green' : 'gray')"
          placeholder="you@example.com" autocomplete="email"
          @blur="validateField('email', checkEmail)"
          @input="validateLive('email', checkEmail)"
          :ui="{ rounded: 'rounded-[10px]' }"
        />
        <span class="text-[11.5px] text-(--red) mt-px" :class="{ hidden: !errors.email }">Please enter a valid email address</span>
      </div>

      <!-- Password -->
      <div class="flex flex-col gap-1.5 relative">
        <label for="s-pass" class="text-[13px] font-semibold text-(--text-secondary)">Password <span class="text-primary">*</span></label>
        <UInput
          id="s-pass"
          v-model="password"
          :type="showPass ? 'text' : 'password'"
          size="xl"
          :color="errors.pass ? 'red' : (valids.pass ? 'green' : 'gray')"
          placeholder="At least 8 characters" autocomplete="new-password"
          @blur="validateField('pass', v => v.length >= 8)"
          @input="validateLive('pass', v => v.length >= 8); calcStrength()"
          :ui="{ icon: { trailing: { pointer: '' } }, rounded: 'rounded-[10px]' }"
        >
          <template #trailing>
            <UButton
              :icon="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              color="gray" variant="link" :padded="false"
              @click="showPass = !showPass"
            />
          </template>
        </UInput>

        <div class="flex gap-[3px] mt-[7px]">
          <div class="flex-1 h-[3px] rounded-sm transition-colors duration-200" :class="[pwdScore >= 1 ? pwdColorClass() : 'bg-(--border)']"></div>
          <div class="flex-1 h-[3px] rounded-sm transition-colors duration-200" :class="[pwdScore >= 2 ? pwdColorClass() : 'bg-(--border)']"></div>
          <div class="flex-1 h-[3px] rounded-sm transition-colors duration-200" :class="[pwdScore >= 3 ? pwdColorClass() : 'bg-(--border)']"></div>
          <div class="flex-1 h-[3px] rounded-sm transition-colors duration-200" :class="[pwdScore >= 4 ? pwdColorClass() : 'bg-(--border)']"></div>
        </div>
        <div class="text-[11px] font-semibold mt-1" :class="[{ hidden: pwdScore === 0 }, pwdTextColorClass()]">{{ pwdLevels[pwdScore] }}</div>

        <span class="text-[11.5px] text-(--red) mt-px" :class="{ hidden: !errors.pass }">Password must be at least 8 characters</span>
      </div>

      <!-- Coaching specialty -->
      <div>
        <div class="text-[13px] font-semibold text-(--text-secondary) mb-2.5">What best describes your coaching? <span class="text-primary">*</span></div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center gap-[9px] border-[1.5px] border-(--border) rounded-[11px] px-[13px] py-2.5 cursor-pointer bg-(--bg-input) select-none transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-primary-soft)"
               :class="specialty === 'personal-training' ? 'border-primary bg-(--bg-primary-soft) shadow-[0_0_0_3px_rgba(26,122,74,0.08)] dark:shadow-none' : ''"
               @click="selectSpec('personal-training')">
            <span class="text-base shrink-0">🏋️</span>
            <span class="text-[13px] font-semibold text-(--text-primary) leading-[1.2]">Personal Training</span>
            <div class="w-4 h-4 rounded-full border-[1.5px] border-(--border-strong) ml-auto shrink-0 flex items-center justify-center transition-all duration-150"
                 :class="specialty === 'personal-training' ? 'bg-primary border-primary' : ''">
              <svg v-if="specialty === 'personal-training'" width="8" height="8" fill="none" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div class="flex items-center gap-[9px] border-[1.5px] border-(--border) rounded-[11px] px-[13px] py-2.5 cursor-pointer bg-(--bg-input) select-none transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-primary-soft)"
               :class="specialty === 'online-coaching' ? 'border-primary bg-(--bg-primary-soft) shadow-[0_0_0_3px_rgba(26,122,74,0.08)] dark:shadow-none' : ''"
               @click="selectSpec('online-coaching')">
            <span class="text-base shrink-0">🌐</span>
            <span class="text-[13px] font-semibold text-(--text-primary) leading-[1.2]">Online Coaching</span>
            <div class="w-4 h-4 rounded-full border-[1.5px] border-(--border-strong) ml-auto shrink-0 flex items-center justify-center transition-all duration-150"
                 :class="specialty === 'online-coaching' ? 'bg-primary border-primary' : ''">
              <svg v-if="specialty === 'online-coaching'" width="8" height="8" fill="none" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div class="flex items-center gap-[9px] border-[1.5px] border-(--border) rounded-[11px] px-[13px] py-2.5 cursor-pointer bg-(--bg-input) select-none transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-primary-soft)"
               :class="specialty === 'nutrition' ? 'border-primary bg-(--bg-primary-soft) shadow-[0_0_0_3px_rgba(26,122,74,0.08)] dark:shadow-none' : ''"
               @click="selectSpec('nutrition')">
            <span class="text-base shrink-0">🥗</span>
            <span class="text-[13px] font-semibold text-(--text-primary) leading-[1.2]">Nutrition Coaching</span>
            <div class="w-4 h-4 rounded-full border-[1.5px] border-(--border-strong) ml-auto shrink-0 flex items-center justify-center transition-all duration-150"
                 :class="specialty === 'nutrition' ? 'bg-primary border-primary' : ''">
              <svg v-if="specialty === 'nutrition'" width="8" height="8" fill="none" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div class="flex items-center gap-[9px] border-[1.5px] border-(--border) rounded-[11px] px-[13px] py-2.5 cursor-pointer bg-(--bg-input) select-none transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-primary-soft)"
               :class="specialty === 'studio' ? 'border-primary bg-(--bg-primary-soft) shadow-[0_0_0_3px_rgba(26,122,74,0.08)] dark:shadow-none' : ''"
               @click="selectSpec('studio')">
            <span class="text-base shrink-0">🏢</span>
            <span class="text-[13px] font-semibold text-(--text-primary) leading-[1.2]">Studio / Group</span>
            <div class="w-4 h-4 rounded-full border-[1.5px] border-(--border-strong) ml-auto shrink-0 flex items-center justify-center transition-all duration-150"
                 :class="specialty === 'studio' ? 'bg-primary border-primary' : ''">
              <svg v-if="specialty === 'studio'" width="8" height="8" fill="none" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
        </div>
        <span class="text-[11.5px] text-(--red) mt-1.5 block" :class="{ hidden: !errors.spec }">Please select a coaching type</span>
      </div>

      <!-- Terms -->
      <div>
        <UCheckbox
          v-model="terms"
          name="s-terms"
          color="primary"
          @change="errors.terms = false"
          :ui="{ wrapper: 'items-start mt-1', label: 'text-[13px] text-(--text-secondary) leading-[1.5]' }"
        >
          <template #label>
            I agree to the <a href="#" @click.prevent class="text-primary font-semibold no-underline hover:underline">Terms of Service</a> and <a href="#" @click.prevent class="text-primary font-semibold no-underline hover:underline">Privacy Policy</a>
          </template>
        </UCheckbox>
        <span class="text-[11.5px] text-(--red) mt-1 block" :class="{ hidden: !errors.terms }">You must agree to continue</span>
      </div>

      <UButton
        type="submit"
        size="xl"
        block
        color="primary"
        class="h-[46px] rounded-[11px] font-[700] text-[15px] tracking-[-0.1px] shadow-(--shadow-button) hover:shadow-(--shadow-button-hover)"
        :loading="isSubmitting"
        trailing-icon="i-heroicons-arrow-right-20-solid"
      >
        {{ isSubmitting ? 'Creating your account…' : 'Create my free account' }}
      </UButton>

    </form>

    <div class="mt-5 text-center text-[13px] text-(--text-muted)">
      Already have an account? <a href="#" @click.prevent="$emit('switch', 'login')" class="text-(--text-accent) font-semibold no-underline">Sign in →</a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['switch', 'toast'])

const first = ref('')
const last = ref('')
const email = ref('')
const password = ref('')
const specialty = ref(null)
const terms = ref(false)

const showPass = ref(false)
const isSubmitting = ref(false)

const errors = reactive({ first: false, last: false, email: false, pass: false, spec: false, terms: false })
const valids = reactive({ first: false, last: false, email: false, pass: false })

const checkEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

const validateField = (key, checker) => {
  const vars = { first, last, email, password }
  const val = vars[key === 'pass' ? 'password' : key].value
  if (!checker(val)) {
    errors[key] = true
    valids[key] = false
  } else {
    errors[key] = false
    valids[key] = true
  }
}

const validateLive = (key, checker) => {
  const vars = { first, last, email, password }
  const val = vars[key === 'pass' ? 'password' : key].value
  if (errors[key] && checker(val)) {
    errors[key] = false
    valids[key] = true
  }
}

// Password strength
const pwdScore = ref(0)
const pwdLevels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const pwdColorClass = () => ['', 'bg-[#EF4444]', 'bg-[#F59E0B]', 'bg-[#3B82F6]', 'bg-[#22C55E]'][pwdScore.value] || ''
const pwdTextColorClass = () => ['', 'text-[#EF4444]', 'text-[#F59E0B]', 'text-[#3B82F6]', 'text-[#22C55E]'][pwdScore.value] || ''

const calcStrength = () => {
  const val = password.value
  if (!val) { pwdScore.value = 0; return; }
  let score = 0
  if (val.length >= 8)  score++
  if (val.length >= 12) score++
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++
  if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++
  pwdScore.value = Math.max(score, 1)
}

const selectSpec = (val) => {
  specialty.value = val
  errors.spec = false
}

const handleSignup = () => {
  let ok = true

  if (!first.value.trim()) { errors.first = true; ok = false }
  if (!last.value.trim()) { errors.last = true; ok = false }
  if (!checkEmail(email.value)) { errors.email = true; ok = false }
  if (password.value.length < 8) { errors.pass = true; ok = false }

  if (!specialty.value) { errors.spec = true; ok = false }
  if (!terms.value) { errors.terms = true; ok = false }

  if (!ok) return

  isSubmitting.value = true
  setTimeout(() => {
    emit('toast', 'Account created! Taking you to onboarding →')
    isSubmitting.value = false
  }, 1400)
}
</script>
