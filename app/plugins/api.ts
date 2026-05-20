import { $fetch, FetchError } from 'ofetch'
import type { FetchOptions } from 'ofetch'
import type { HandlersAuthResponse } from '~/services/types.gen'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { client as sdkClient } from '~/services/client.gen'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  const apiBase = `${config.public.apiBase}${API_PREFIX}`

  // Used only for the refresh call — no auth interceptors, avoids circular 401 handling
  const rawFetch = $fetch.create({ baseURL: apiBase })

  const authFetch = $fetch.create({
    baseURL: apiBase,
    onRequest({ options }) {
      if (authStore.token) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${authStore.token}`)
        options.headers = headers
      }
    },
  })

  // Deduplicates concurrent refresh attempts — all simultaneous 401s share one refresh call
  let refreshPromise: Promise<void> | null = null

  function refreshAccessToken(): Promise<void> {
    if (refreshPromise) return refreshPromise

    const rt = authStore.refreshToken
    if (!rt) return Promise.reject(new Error('no refresh token'))

    refreshPromise = rawFetch<HandlersAuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: rt },
    })
      .then((res) => {
        authStore.token = res.access_token ?? null
        authStore.refreshToken = res.refresh_token ?? null
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
          authStore.clearAuth()
          await router.push('/auth')
          throw err
        }
      }
      throw err
    }
  }

  // --- Hey-API Global Fetch Override ---
  const customSdkFetch: typeof fetch = async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init)
    const url = request.url
    const method = request.method

    // Convert Headers to standard object for ofetch
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Get body content if method allows it
    let body: BodyInit | Record<string, unknown> | null = null
    if (method !== 'GET' && method !== 'HEAD') {
      const cloned = request.clone()
      const text = await cloned.text().catch(() => '')
      if (text) {
        try {
          body = JSON.parse(text) as Record<string, unknown>
        } catch {
          body = text
        }
      }
    }

    const executeRequest = async (): Promise<Response> => {
      const res = await authFetch.raw(url, {
        method,
        headers,
        body,
      })

      // Convert ofetch raw response back to standard Response for the Hey-API SDK parser
      return new Response(
        typeof res._data === 'object' ? JSON.stringify(res._data) : res._data,
        {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers as HeadersInit,
        }
      )
    }

    try {
      return await executeRequest()
    } catch (err) {
      if (err instanceof FetchError && err.status === 401) {
        try {
          await refreshAccessToken()
          // Retry request with fresh auth token
          return await executeRequest()
        } catch {
          authStore.clearAuth()
          await router.push('/auth')
          throw err
        }
      }
      throw err
    }
  }

  // Hook global Hey-API client instance to use the custom Nuxt ofetch adapter
  sdkClient.setConfig({
    fetch: customSdkFetch,
    responseStyle: 'data',
    throwOnError: true,
  })

  return { provide: { api } }
})
