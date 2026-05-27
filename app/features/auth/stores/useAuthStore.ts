import { defineStore } from 'pinia'
import type { HandlersAuthResponse, ModelsCoach, ModelsDashboardStats } from '~/services/types.gen'

export const useAuthStore = defineStore('auth', () => {
  const coach = ref<ModelsCoach | null>(null)
  const appStats = ref<ModelsDashboardStats | null>(null)

  // secure: only over HTTPS in prod (localhost dev is http). sameSite 'strict'
  // is safe here since the API auths via Authorization header, not the cookie.
  // NOTE: interim hardening only — these remain JS-readable. Proper fix is
  // httpOnly server-set cookies (tracked separately).
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'strict',
    secure: !import.meta.dev,
  })

  const refreshToken = useCookie<string | null>('refresh_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'strict',
    secure: !import.meta.dev,
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

  return { coach, appStats, token, refreshToken, isAuthenticated, setAuth, clearAuth }
})
