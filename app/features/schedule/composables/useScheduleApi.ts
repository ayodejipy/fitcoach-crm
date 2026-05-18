import type {
  HandlersListSessionsResponse,
  HandlersCreateSessionRequest,
  HandlersUpdateSessionRequest,
  ModelsCoachSession,
} from '~/services/types.gen'

export function useScheduleApi() {
  const { $api } = useNuxtApp()

  // --- reads ---

  const list = (params?: { from?: string; to?: string; session_type?: string }) =>
    $api<HandlersListSessionsResponse>('/api/sessions', { params })

  const get = (id: string) =>
    $api<ModelsCoachSession>(`/api/sessions/${id}`)

  // --- mutations ---

  const create = (body: HandlersCreateSessionRequest) =>
    $api<ModelsCoachSession>('/api/sessions', { method: 'POST', body })

  const update = (id: string, body: HandlersUpdateSessionRequest) =>
    $api<ModelsCoachSession>(`/api/sessions/${id}`, { method: 'PATCH', body })

  const cancel = (id: string) =>
    $api(`/api/sessions/${id}`, { method: 'DELETE' })

  return { list, get, create, update, cancel }
}
