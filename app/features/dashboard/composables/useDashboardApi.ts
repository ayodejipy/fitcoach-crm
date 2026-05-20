import { getApiV1MeDashboard } from '~/services/sdk.gen'

export function useDashboardApi() {
  const getStats = () => getApiV1MeDashboard()

  return { getStats }
}
