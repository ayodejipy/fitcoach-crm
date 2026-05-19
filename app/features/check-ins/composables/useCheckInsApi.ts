import type {
  HandlersListCheckInsResponse,
  HandlersRespondToCheckInRequest,
  HandlersSaveCheckInDraftRequest,
  ModelsCoachCheckIn,
} from '~/services/types.gen'

export function useCheckInsApi() {
  const { $api } = useNuxtApp()

  // --- reads ---

  const list = (params?: { page?: number; per_page?: number; status?: string; week_start?: string; client_id?: string; search?: string }) =>
    $api<HandlersListCheckInsResponse>('/check-ins', { params })

  const get = (id: string) =>
    $api<ModelsCoachCheckIn>(`/check-ins/${id}`)

  // --- mutations ---

  const markRead = (id: string) =>
    $api(`/check-ins/${id}/read`, { method: 'POST' })

  const respond = (id: string, body: HandlersRespondToCheckInRequest) =>
    $api<ModelsCoachCheckIn>(`/check-ins/${id}/respond`, { method: 'POST', body })

  const saveDraft = (id: string, body: HandlersSaveCheckInDraftRequest) =>
    $api<ModelsCoachCheckIn>(`/check-ins/${id}/draft`, { method: 'PATCH', body })

  return { list, get, markRead, respond, saveDraft }
}
