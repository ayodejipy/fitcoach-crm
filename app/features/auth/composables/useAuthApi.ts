import type {
  HandlersAuthResponse,
  HandlersLoginRequest,
  HandlersSignupRequest,
} from '~/services/types.gen'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

export function useAuthApi() {
  const { $api } = useNuxtApp()
  const authStore = useAuthStore()

  async function login(body: HandlersLoginRequest) {
    const response = await $api<HandlersAuthResponse>('/api/auth/login', { method: 'POST', body })
    authStore.setAuth(response)
    return response
  }

  async function register(body: HandlersSignupRequest) {
    const response = await $api<HandlersAuthResponse>('/api/auth/signup', { method: 'POST', body })
    authStore.setAuth(response)
    return response
  }

  async function logout() {
    await $api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    authStore.clearAuth()
    await navigateTo('/auth')
  }

  async function refreshToken() {
    const response = await $api<HandlersAuthResponse>('/api/auth/refresh', { method: 'POST' })
    authStore.setAuth(response)
    return response
  }

  return { login, register, logout, refreshToken }
}
