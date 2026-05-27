<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { getApiV1Me } from '~/services/sdk.gen'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import type { ModelsCoach } from '~/services'

definePageMeta({ layout: 'auth' })

const isSSOLogin = useStorage<boolean>(IS_SSO_LOGIN, false)

const route = useRoute()
const authStore = useAuthStore()

const errorMsg = ref<string | null>(null)

onMounted(async () => {
  const accessToken = route.query.access_token as string | undefined
  const refreshToken = route.query.refresh_token as string | undefined

  if (!accessToken || !refreshToken) {
    errorMsg.value = 'Sign-in failed. Please try again.'
    return
  }

  try {
    // Write tokens into the store
    authStore.token = accessToken
    authStore.refreshToken = refreshToken
    
    // Fetch the coach profile — getApiV1Me will now include the Authorization header
    const coach = await getApiV1Me()
    authStore.coach = coach as ModelsCoach
    // set login method to sso
    isSSOLogin.value = true

    await navigateTo(coach?.onboarding_done ? '/dashboard' : '/onboarding')
  } catch {
    authStore.clearAuth()
    errorMsg.value = 'Sign-in failed. Please try again.'
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 py-12">
    <template v-if="errorMsg">
      <p class="text-sm text-(--text-muted) text-center">{{ errorMsg }}</p>
      <UButton color="primary" variant="soft" @click="navigateTo('/auth')">Back to sign in</UButton>
    </template>
    <template v-else>
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-(--text-muted)">Signing you in with Google…</p>
    </template>
  </div>
</template>

