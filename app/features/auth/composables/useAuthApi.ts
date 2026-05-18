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
    const response = await $api<HandlersAuthResponse>('/auth/login', { method: 'POST', body })
    authStore.setAuth(response)
    return response
  }

  async function register(body: HandlersSignupRequest) {
    const response = await $api<HandlersAuthResponse>('/auth/signup', { method: 'POST', body })
    authStore.setAuth(response)
    return response
  }

  async function logout() {
    await $api('/auth/logout', {
      method: 'POST',
      body: { refresh_token: authStore.refreshToken ?? '' },
    }).catch(() => { })
    authStore.clearAuth()
    await navigateTo('/auth')
  }

  return { login, register, logout }
}
