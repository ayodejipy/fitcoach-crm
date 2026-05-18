import type { HandlersAdvanceOnboardingRequest, ModelsCoach } from '~/services/types.gen'

export function useOnboardingApi() {
  const { $api } = useNuxtApp()

  const advance = (body: HandlersAdvanceOnboardingRequest) =>
    $api<ModelsCoach>('/me/onboarding', { method: 'PATCH', body })

  return { advance }
}
