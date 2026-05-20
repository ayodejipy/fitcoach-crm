import {
  postApiV1AuthLogin,
  postApiV1AuthLogout,
  postApiV1AuthSignup,
} from '~/services'
import type { HandlersLoginRequest, HandlersSignupRequest } from '~/services'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

export function useAuthApi() {
  const authStore = useAuthStore()

  async function login(body: HandlersLoginRequest) {
    const response = await postApiV1AuthLogin({ body })
    authStore.setAuth(response)
    return response
  }

  async function register(body: HandlersSignupRequest) {
    const response = await postApiV1AuthSignup({ body })
    authStore.setAuth(response)
    return response
  }

  async function logout() {
    await postApiV1AuthLogout({
      body: { refresh_token: authStore.refreshToken ?? '' },
    }).catch(() => {})
    authStore.clearAuth()
    await navigateTo('/auth')
  }

  return { login, register, logout }
}
