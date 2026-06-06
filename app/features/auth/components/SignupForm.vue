<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import { FetchError } from 'ofetch'
import type { ModelsAppError } from '~/services/types.gen'
import { useAuthApi } from '~/features/auth/composables/useAuthApi'
import { usePasswordStrength } from '~/features/auth/composables/usePasswordStrength'
import { signupSchema, type SignupSchema } from '../schemas/auth.schema'

defineEmits<{
  switch: [tab: 'login' | 'signup']
}>()

const toast = useToast()
const config = useRuntimeConfig()
const authApi = useAuthApi()

const state = reactive<SignupSchema>({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  terms: false,
})

const formRef = ref<Form<SignupSchema> | null>(null)
const showPassword = ref(false)
const submitting = ref(false)

const {
  strength: passwordChecks,
  score: passwordScore,
  color: passwordColor,
  label: passwordLabel,
} = usePasswordStrength(toRef(state, 'password'))

function handleGoogleSignIn() {
  window.location.href = `${config.public.apiBase}/api/v1/auth/google`
}

async function handleSubmit(event: FormSubmitEvent<SignupSchema>) {
  submitting.value = true
  try {
    await authApi.register({
      email: event.data.email,
      first_name: event.data.first_name,
      last_name: event.data.last_name,
      password: event.data.password,
    })
    await navigateTo('/onboarding')
  } catch (err) {
    if (err instanceof FetchError && err.status === 409) {
      formRef.value?.setErrors([{ name: 'email', message: 'Email already registered' }])
    } else {
      const message = err instanceof FetchError
        ? ((err.data as ModelsAppError | undefined)?.error ?? 'Something went wrong. Please try again.')
        : 'Something went wrong. Please try again.'
      toast.add({ title: 'Sign up failed', description: message, color: 'error' })
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="w-full">
    <h2 class="text-[26px] font-semibold tracking-[-0.02em] text-(--text-primary)">Get started</h2>
    <p class="mt-1.5 text-[13.5px] text-(--text-secondary)">
      Free to start · no credit card needed.
    </p>

    <UButton
      color="neutral"
      variant="outline"
      block
      size="lg"
      class="mt-7 h-11 gap-2.5"
      @click="handleGoogleSignIn"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.997 10.997 0 0 0 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.997 10.997 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Sign up with Google
    </UButton>

    <div class="my-6 flex items-center gap-3" aria-hidden="true">
      <div class="flex-1 h-px bg-(--border)" />
      <span class="text-[10.5px] uppercase tracking-[0.1em] text-(--text-muted)">or with email</span>
      <div class="flex-1 h-px bg-(--border)" />
    </div>

    <UForm ref="formRef" :schema="signupSchema" :state="state" class="flex flex-col gap-4" @submit="handleSubmit">
      <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <UFormField label="First name" name="first_name" required>
          <UInput
            v-model="state.first_name"
            placeholder="Jordan"
            autocomplete="given-name"
            size="lg"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Last name" name="last_name" required>
          <UInput
            v-model="state.last_name"
            placeholder="Cole"
            autocomplete="family-name"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField label="Email address" name="email" required>
        <UInput
          v-model="state.email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          icon="i-lucide-mail"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="At least 8 characters"
          autocomplete="new-password"
          size="lg"
          :color="state.password ? passwordColor : undefined"
          class="w-full"
          :ui="{ trailing: 'pointer-events-auto' }"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :padded="false"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>

        <div v-if="state.password" class="mt-2 space-y-2">
          <UProgress :color="passwordColor" :indicator="passwordLabel" :model-value="passwordScore" :max="4" size="sm" />
          <ul class="space-y-1">
            <li
              v-for="(req, i) in passwordChecks"
              :key="i"
              class="flex items-center gap-1.5"
              :class="req.met ? 'text-(--green-brand)' : 'text-(--text-muted)'"
            >
              <UIcon :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle'" class="size-3.5 shrink-0" />
              <span class="text-[11.5px]">{{ req.text }}</span>
            </li>
          </ul>
        </div>
      </UFormField>

      <UFormField name="terms">
        <UCheckbox v-model="state.terms" color="primary">
          <template #label>
            <span class="text-[12.5px] text-(--text-secondary)">
              I agree to the
              <a href="#" class="font-semibold text-(--green-brand) hover:underline" @click.prevent>Terms</a>
              and
              <a href="#" class="font-semibold text-(--green-brand) hover:underline" @click.prevent>Privacy Policy</a>
            </span>
          </template>
        </UCheckbox>
      </UFormField>

      <UButton
        type="submit"
        color="primary"
        block
        size="lg"
        :loading="submitting"
        trailing-icon="i-lucide-arrow-right"
        class="mt-3"
      >
        {{ submitting ? 'Creating your account…' : 'Create my account' }}
      </UButton>
    </UForm>

    <p class="mt-6 text-center text-[12.5px] text-(--text-secondary)">
      Already have an account?
      <button
        type="button"
        class="font-semibold text-(--green-brand) hover:underline"
        @click="$emit('switch', 'login')"
      >
        Sign in
      </button>
    </p>
  </div>
</template>
