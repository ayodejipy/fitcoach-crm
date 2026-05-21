import {
  getApiV1CheckIns,
  getApiV1CheckInsById,
  postApiV1CheckInsByIdRead,
  postApiV1CheckInsByIdRespond,
  patchApiV1CheckInsByIdDraft,
} from '~/services'
import type {
  HandlersRespondToCheckInRequest,
  HandlersSaveCheckInDraftRequest,
} from '~/services'

export function useCheckInsApi() {
  const list = (params?: {
    page?: number
    per_page?: number
    status?: string
    week_start?: string
    client_id?: string
    search?: string
  }) => getApiV1CheckIns({ query: params })

  const get = (id: string) =>
    getApiV1CheckInsById({ path: { id } })

  const markRead = (id: string) =>
    postApiV1CheckInsByIdRead({ path: { id } })

  const respond = (id: string, body: HandlersRespondToCheckInRequest) =>
    postApiV1CheckInsByIdRespond({ path: { id }, body })

  const saveDraft = (id: string, body: HandlersSaveCheckInDraftRequest) =>
    patchApiV1CheckInsByIdDraft({ path: { id }, body })

  return { list, get, markRead, respond, saveDraft }
}
