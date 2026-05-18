import { $fetch } from 'ofetch'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      const token = useCookie<string | null>('auth_token')
      if (token.value) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${token.value}`)
        options.headers = headers
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        await navigateTo('/auth')
      }
    },
  })

  return {
    provide: { api },
  }
})
