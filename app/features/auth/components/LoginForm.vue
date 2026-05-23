<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { FormSubmitEvent } from '@nuxt/ui'
import { FetchError } from 'ofetch'
import type { ModelsAppError } from '~/services/types.gen'
import { useAuthApi } from '~/features/auth/composables/useAuthApi'
import { loginSchema, type LoginSchema } from '~/features/auth/schemas/auth.schema'
import { IS_SSO_LOGIN } from '~/utils/constants'

defineEmits(['switch'])
const toast = useToast()

const isSSOLogin = useStorage<boolean>(IS_SSO_LOGIN, false)
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const state = reactive({ email: '', password: '' })
const rememberMe = ref(false)
const showPass = ref(false)
const isSubmitting = ref(false)

const config = useRuntimeConfig()
const authApi = useAuthApi()

const handleGoogleSignIn = () => {
  window.location.href = `${config.public.apiBase}/api/v1/auth/google`
}

async function handleSubmit(event: FormSubmitEvent<LoginSchema>) {
  isSubmitting.value = true
  isSSOLogin.value = false
  try {
    const login = await authApi.login({ email: event.data.email, password: event.data.password })
    if (login.coach?.onboarding_done) {
      await navigateTo('/dashboard')
    } else {
      await navigateTo('/onboarding')
    }
  } catch (err) {
    const msg = err instanceof FetchError
      ? ((err.data as ModelsAppError | undefined)?.error ?? 'Something went wrong. Please try again.')
      : 'Something went wrong. Please try again.'
    toast.add({ title: 'Sign in failed', description: msg, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-extrabold text-(--text-primary) tracking-[-0.4px] mb-1.5">Welcome back 👋</h2>
      <p class="text-sm text-(--text-muted) leading-normal">Sign in to your FitCoach dashboard</p>
    </div>

    <!-- Google -->
    <div class="relative">
      <UBadge v-if="mounted && isSSOLogin === true" icon="i-lucide-check" color="primary"
        class="z-20 absolute -top-2.5 right-3 border border-primary-300 bg-primary-300/80 rounded-full">
        Used last
      </UBadge>
      <UButton
        variant="outline"
        color="neutral"
        block
        class="h-11 gap-2.5 bg-(--bg-input) border-[1.5px] text-sm font-semibold text-(--text-primary) shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-150 hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:-translate-y-px"
        :class="mounted && isSSOLogin === true ? 'border-(--green-mid)' : 'border-(--border) hover:border-(--border-strong)'"
        @click="handleGoogleSignIn"
      >
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
        Continue with Google
      </UButton>
    </div>

    <div class="flex items-center gap-3 my-5">
      <div class="flex-1 h-px bg-(--border)"></div>
      <span class="text-xs text-(--text-muted) font-medium flex items-center gap-1.5">
        or sign in with email
        <UBadge v-if="mounted && isSSOLogin === false" icon="i-lucide-check" class="border border-primary-300 bg-primary-300/80 rounded-full">
          Used last
        </UBadge>
      </span>
      <div class="flex-1 h-px bg-(--border)"></div>
    </div>

    <UForm :schema="loginSchema" :state="state" class="flex flex-col gap-4" @submit="handleSubmit">
      <UFormField name="email">
        <template #label>
          <span class="text-[13px] font-semibold text-(--text-secondary)">Email address</span>
        </template>
        <UInput v-model="state.email" type="email" size="xl" placeholder="you@example.com" autocomplete="email"
          icon="i-heroicons-envelope" class="w-full" :ui="{ base: 'rounded-[10px]' }" />
      </UFormField>

      <UFormField name="password" :ui="{ label: 'flex w-full items-center justify-between' }">
        <template #label>
          <span class="text-[13px] font-semibold text-(--text-secondary)">Password</span>
          <UButton
            variant="link"
            color="neutral"
            class="p-0 h-auto text-[12px] font-medium text-(--text-accent) hover:underline"
            @click.prevent="toast.add({ title: 'Coming soon', description: 'Password reset is not available yet.', color: 'neutral' })"
          >Forgot password?</UButton>
        </template>

        <UInput v-model="state.password" :type="showPass ? 'text' : 'password'" size="xl"
          placeholder="Enter your password" autocomplete="current-password" class="w-full"
          :ui="{ trailing: 'pointer-events-auto', base: 'rounded-[10px]' }">
          <template #trailing>
            <UButton :icon="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" color="neutral" variant="link"
              :padded="false" @click="showPass = !showPass" />
          </template>
        </UInput>
      </UFormField>

      <UCheckbox v-model="rememberMe" label="Remember me" color="primary"
        :ui="{ wrapper: 'items-center', label: 'text-[13px] text-(--text-secondary)' }" />

      <UButton type="submit" size="xl" block color="primary"
        class="h-[46px] rounded-[11px] font-bold text-[15px] tracking-[-0.1px] hover:shadow-(--shadow-button-hover)"
        :loading="isSubmitting" trailing-icon="i-heroicons-arrow-right-20-solid">
        {{ isSubmitting ? 'Signing in…' : 'Sign in to dashboard' }}
      </UButton>
    </UForm>

    <div class="mt-5 text-center text-[13px] text-(--text-muted)">
      Don't have an account?
      <ULink 
        as="button" 
        class="text-(--text-accent) font-semibold no-underline"
        :disabled="isSubmitting"
        @click.prevent="$emit('switch', 'signup')"
      >
        Create one free →
      </ULink>
    </div>
  </div>
</template>
