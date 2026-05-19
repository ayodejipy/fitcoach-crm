import type { HandlersAdvanceOnboardingRequest, HandlersSlugCheckResponse, ModelsCoach } from '~/services/types.gen'

export function useOnboardingApi() {
  const { $api } = useNuxtApp()

  const advance = (body: HandlersAdvanceOnboardingRequest) =>
    $api<ModelsCoach>('/me/onboarding', { method: 'PATCH', body })

  const checkSlugAvailability = async (slug: string) => $api<HandlersSlugCheckResponse>(`/me/slug-check?slug=${slug}`, { method: 'GET' })

  return { advance, checkSlugAvailability }
}
