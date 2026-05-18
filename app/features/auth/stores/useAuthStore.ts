import { defineStore } from 'pinia'
import type { HandlersAuthResponse, ModelsCoach } from '~/services/types.gen'

export const useAuthStore = defineStore('auth', () => {
  const coach = ref<ModelsCoach | null>(null)

  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  const refreshToken = useCookie<string | null>('refresh_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(response: HandlersAuthResponse) {
    token.value = response.access_token ?? null
    refreshToken.value = response.refresh_token ?? null
    coach.value = response.coach ?? null
  }

  function clearAuth() {
    token.value = null
    refreshToken.value = null
    coach.value = null
  }

  return { coach, token, refreshToken, isAuthenticated, setAuth, clearAuth }
})
