import { $fetch, FetchError } from 'ofetch'
import type { FetchOptions } from 'ofetch'
import type { HandlersAuthResponse } from '~/services/types.gen'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authToken = useCookie<string | null>('auth_token')
  const refreshTokenCookie = useCookie<string | null>('refresh_token')

  // Used only for the refresh call — no auth interceptors, avoids circular 401 handling
  const rawFetch = $fetch.create({ baseURL: config.public.apiBase })

  const authFetch = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (authToken.value) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${authToken.value}`)
        options.headers = headers
      }
    },
  })

  // Deduplicates concurrent refresh attempts — all simultaneous 401s share one refresh call
  let refreshPromise: Promise<void> | null = null

  function refreshAccessToken(): Promise<void> {
    if (refreshPromise) return refreshPromise

    const rt = refreshTokenCookie.value
    if (!rt) return Promise.reject(new Error('no refresh token'))

    refreshPromise = rawFetch<HandlersAuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: { refresh_token: rt },
    })
      .then((res) => {
        authToken.value = res.access_token ?? null
        refreshTokenCookie.value = res.refresh_token ?? null
      })
      .finally(() => {
        refreshPromise = null
      })

    return refreshPromise
  }

  async function api<T = unknown>(url: string, options?: FetchOptions<'json'>): Promise<T> {
    try {
      return await authFetch<T>(url, options)
    } catch (err) {
      if (err instanceof FetchError && err.status === 401) {
        try {
          await refreshAccessToken()
          return await authFetch<T>(url, options)
        } catch {
          useAuthStore().clearAuth()
          await navigateTo('/auth')
          throw err
        }
      }
      throw err
    }
  }

  return { provide: { api } }
})
