import {
  getApiV1Sessions,
  getApiV1SessionsById,
  postApiV1Sessions,
  patchApiV1SessionsById,
  deleteApiV1SessionsById,
} from '~/services/sdk.gen'
import type {
  HandlersCreateSessionRequest,
  HandlersUpdateSessionRequest,
} from '~/services/types.gen'

export function useScheduleApi() {
  // reads
  const list = (params?: {
    from?: string
    to?: string
    session_type?: string
    client_id?: string
    page?: number
    per_page?: number
  }) => getApiV1Sessions({ query: params })

  const get = (id: string) =>
    getApiV1SessionsById({ path: { id } })

  // mutations
  const create = (body: HandlersCreateSessionRequest) =>
    postApiV1Sessions({ body })

  const update = (id: string, body: HandlersUpdateSessionRequest) =>
    patchApiV1SessionsById({ path: { id }, body })

  const cancel = (id: string) =>
    deleteApiV1SessionsById({ path: { id } })

  return { list, get, create, update, cancel }
}
