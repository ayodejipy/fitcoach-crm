import type {
  HandlersListSessionsResponse,
  HandlersCreateSessionRequest,
  HandlersUpdateSessionRequest,
  ModelsCoachSession,
} from '~/services/types.gen'

export function useScheduleApi() {
  const { $api } = useNuxtApp()

  // --- reads ---

  const list = (params?: { from?: string; to?: string; session_type?: string; client_id?: string; page?: number; per_page?: number }) =>
    $api<HandlersListSessionsResponse>('/sessions', { params })

  const get = (id: string) =>
    $api<ModelsCoachSession>(`/sessions/${id}`)

  // --- mutations ---

  const create = (body: HandlersCreateSessionRequest) =>
    $api<ModelsCoachSession>('/sessions', { method: 'POST', body })

  const update = (id: string, body: HandlersUpdateSessionRequest) =>
    $api<ModelsCoachSession>(`/sessions/${id}`, { method: 'PATCH', body })

  const cancel = (id: string) =>
    $api(`/sessions/${id}`, { method: 'DELETE' })

  return { list, get, create, update, cancel }
}
