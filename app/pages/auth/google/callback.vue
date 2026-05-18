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

<script setup lang="ts">
import type { ModelsCoach } from '~/services/types.gen'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const authStore = useAuthStore()
const { $api } = useNuxtApp()

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

    // Fetch the coach profile — $api will now include the Authorization header
    const coach = await $api<ModelsCoach>('/api/me')
    authStore.coach = coach

    await navigateTo(coach.onboarding_done ? '/' : '/onboarding')
  } catch {
    authStore.clearAuth()
    errorMsg.value = 'Sign-in failed. Please try again.'
  }
})
</script>
