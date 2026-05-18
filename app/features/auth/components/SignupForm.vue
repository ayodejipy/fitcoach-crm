<script setup lang="ts">
import { z } from 'zod'
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import { FetchError } from 'ofetch'
import type { ModelsAppError, HandlersSignupRequest } from '~/services/types.gen'
import { useAuthApi } from '~/features/auth/composables/useAuthApi'
import { usePasswordStrength } from '~/features/auth/composables/usePasswordStrength'
import { signupSchema, type SignupSchema } from '../schemas/auth.schema'

defineEmits(['switch'])
const toast = useToast()



const state = reactive<SignupSchema>({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  specialty: '' as HandlersSignupRequest['specialty'],
  terms: false,
})

const formRef = ref<Form<SignupSchema> | null>(null)
const showPass = ref(false)
const isSubmitting = ref(false)

const {
  strength: pwdStrength,
  score: pwdScore,
  color: pwdColor,
  label: pwdLabel } = usePasswordStrength(toRef(state, 'password'))

const specialtyOptions: { value: HandlersSignupRequest['specialty'], icon: string, label: string }[] = [
  { value: 'personal-training', icon: '🏋️', label: 'Personal Training' },
  { value: 'online-coaching', icon: '🌐', label: 'Online Coaching' },
  { value: 'nutrition', icon: '🥗', label: 'Nutrition Coaching' },
  { value: 'studio', icon: '🏢', label: 'Studio / Group' },
]

const config = useRuntimeConfig()
const authApi = useAuthApi()

const handleGoogleSignIn = () => {
  window.location.href = `${config.public.apiBase}/api/auth/google`
}

async function handleSubmit(event: FormSubmitEvent<SignupSchema>) {
  isSubmitting.value = true
  try {
    await authApi.register({
      email: event.data.email,
      first_name: event.data.first_name,
      last_name: event.data.last_name,
      password: event.data.password,
      specialty: event.data.specialty as HandlersSignupRequest['specialty'],
    })
    await navigateTo('/onboarding')
  } catch (err) {
    if (err instanceof FetchError && err.status === 409) {
      formRef.value?.setErrors([{ name: 'email', message: 'Email already registered' }])
    } else {
      const msg = err instanceof FetchError
        ? ((err.data as ModelsAppError | undefined)?.error ?? 'Something went wrong. Please try again.')
        : 'Something went wrong. Please try again.'
      toast.add({ title: 'Sign up failed', description: msg, color: 'error' })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-extrabold text-(--text-primary) mb-1.5">Start coaching smarter</h2>
      <p class="text-sm text-(--text-muted) leading-[1.5]">Free to start — no credit card needed</p>
    </div>

    <!-- Google -->
    <button
      class="flex items-center justify-center gap-2.5 w-full h-11 bg-(--bg-input) border-[1.5px] border-(--border) rounded-[10px] font-inherit text-sm font-semibold text-(--text-primary) cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none hover:border-(--border-strong) hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:-translate-y-px"
      @click="handleGoogleSignIn">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4" />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853" />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05" />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335" />
      </svg>
      Sign up with Google
    </button>

    <div class="flex items-center gap-3 my-5">
      <div class="flex-1 h-px bg-(--border)"></div>
      <span class="text-xs text-(--text-muted) font-medium">or sign up with email</span>
      <div class="flex-1 h-px bg-(--border)"></div>
    </div>

    <UForm ref="formRef" :schema="signupSchema" :state="state" class="flex flex-col gap-4" @submit="handleSubmit">
      <!-- Name row -->
      <div class="grid grid-cols-2 gap-3">
        <UFormField name="first_name">
          <template #label>
            <span class="text-[13px] font-semibold text-(--text-secondary)">First name <span
                class="text-primary">*</span></span>
          </template>
          <UInput v-model="state.first_name" size="xl" placeholder="Jordan" autocomplete="given-name"
            :ui="{ base: 'rounded-[10px]' }" />
        </UFormField>
        <UFormField name="last_name">
          <template #label>
            <span class="text-[13px] font-semibold text-(--text-secondary)">Last name <span
                class="text-primary">*</span></span>
          </template>
          <UInput v-model="state.last_name" size="xl" placeholder="Rivera" autocomplete="family-name"
            :ui="{ base: 'rounded-[10px]' }" />
        </UFormField>
      </div>

      <!-- Email -->
      <UFormField name="email">
        <template #label>
          <span class="text-[13px] font-semibold text-(--text-secondary)">Email address <span
              class="text-primary">*</span></span>
        </template>
        <UInput v-model="state.email" type="email" size="xl" icon="i-heroicons-envelope" placeholder="you@example.com"
          autocomplete="email" class="w-full" :ui="{ base: 'rounded-[10px]' }" />
      </UFormField>

      <!-- Password -->
      <UFormField name="password">
        <template #label>
          <span class="text-[13px] font-semibold text-(--text-secondary)">Password <span
              class="text-primary">*</span></span>
        </template>

        <UInput v-model="state.password" :type="showPass ? 'text' : 'password'" size="xl"
          placeholder="At least 8 characters" autocomplete="new-password" class="w-full"
          :color="state.password ? pwdColor : undefined"
          :ui="{ trailing: 'pointer-events-auto', base: 'rounded-[10px]' }">
          <template #trailing>
            <UButton :icon="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" color="neutral" variant="link"
              :padded="false" @click="showPass = !showPass" />
          </template>
        </UInput>

        <div v-if="state.password" class="mt-2 space-y-2">
          <UProgress :color="pwdColor" :indicator="pwdLabel" :model-value="pwdScore" :max="4" size="sm" />
          <ul class="space-y-1">
            <li v-for="(req, i) in pwdStrength" :key="i"
              class="flex items-center gap-1.5 transition-colors duration-150"
              :class="req.met ? 'text-success' : 'text-(--text-muted)'">
              <UIcon :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'" class="size-3.5 shrink-0" />
              <span class="text-xs">{{ req.text }}</span>
            </li>
          </ul>
        </div>
      </UFormField>

      <!-- Coaching specialty -->
      <UFormField name="specialty">
        <template #label>
          <span class="text-[13px] font-semibold text-(--text-secondary)">What best describes your coaching? <span
              class="text-primary">*</span></span>
        </template>
        <div class="grid grid-cols-2 gap-2 mt-0.5">
          <div v-for="{ value, icon, label } in specialtyOptions" :key="value"
            class="flex items-center gap-[9px] border-[1.5px] border-(--border) rounded-[11px] px-[13px] py-2.5 cursor-pointer bg-(--bg-input) select-none transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-primary-soft)"
            :class="state.specialty === value ? 'border-primary bg-(--bg-primary-soft) shadow-[0_0_0_3px_rgba(26,122,74,0.08)] dark:shadow-none' : ''"
            @click="state.specialty = value">
            <span class="text-base shrink-0">{{ icon }}</span>
            <span class="text-[13px] font-semibold text-(--text-primary) leading-[1.2]">{{ label }}</span>
            <div
              class="w-4 h-4 rounded-full border-[1.5px] border-(--border-strong) ml-auto shrink-0 flex items-center justify-center transition-all duration-150"
              :class="state.specialty === value ? 'bg-primary border-primary' : ''">
              <svg v-if="state.specialty === value" width="8" height="8" fill="none" viewBox="0 0 10 10">
                <path d="M2 5l2.5 2.5 3.5-4" stroke="white" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </UFormField>

      <!-- Terms -->
      <UFormField name="terms">
        <UCheckbox v-model="state.terms" color="primary"
          :ui="{ wrapper: 'items-start mt-1', label: 'text-[13px] text-(--text-secondary) leading-[1.5]' }">
          <template #label>
            I agree to the
            <a href="#" class="text-primary font-semibold no-underline hover:underline" @click.prevent>Terms of
              Service</a>
            and
            <a href="#" class="text-primary font-semibold no-underline hover:underline" @click.prevent>Privacy
              Policy</a>
          </template>
        </UCheckbox>
      </UFormField>

      <UButton type="submit" size="xl" block color="primary"
        class="h-[46px] rounded-[11px] font-[700] text-[15px] tracking-[-0.1px] shadow-(--shadow-button) hover:shadow-(--shadow-button-hover)"
        :loading="isSubmitting" trailing-icon="i-heroicons-arrow-right-20-solid">
        {{ isSubmitting ? 'Creating your account…' : 'Create my free account' }}
      </UButton>
    </UForm>

    <div class="mt-5 text-center text-[13px] text-(--text-muted)">
      Already have an account?
      <a href="#" class="text-(--text-accent) font-semibold no-underline" @click.prevent="$emit('switch', 'login')">Sign
        in
        →</a>
    </div>
  </div>
</template>
