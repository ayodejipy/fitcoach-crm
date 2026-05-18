import type { ModelsDashboardStats } from '~/services/types.gen'

export function useDashboardApi() {
  const { $api } = useNuxtApp()

  const getStats = () =>
    $api<ModelsDashboardStats>('/me/dashboard')

  return { getStats }
}
