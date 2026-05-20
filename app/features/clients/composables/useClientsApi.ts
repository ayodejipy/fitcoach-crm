import {
  getApiV1Clients,
  getApiV1ClientsById,
  postApiV1ClientsByIdInvitePortal,
  postApiV1Clients,
  patchApiV1ClientsById,
  deleteApiV1ClientsById,
} from '~/services/sdk.gen'
import type {
  HandlersCreateClientRequest,
  HandlersUpdateClientRequest,
} from '~/services/types.gen'

export function useClientsApi() {
  // --- reads ---

  const list = (params?: { page?: number; per_page?: number; status?: string; search?: string }) =>
    getApiV1Clients({ query: params })

  const get = (id: string) =>
    getApiV1ClientsById({ path: { id } })

  const invite = (id: string) =>
    postApiV1ClientsByIdInvitePortal({ path: { id } })

  // --- mutations ---

  const create = (body: HandlersCreateClientRequest) =>
    postApiV1Clients({ body })

  const update = (id: string, body: HandlersUpdateClientRequest) =>
    patchApiV1ClientsById({ path: { id }, body })

  const remove = (id: string) =>
    deleteApiV1ClientsById({ path: { id } })

  return { list, get, invite, create, update, remove }
}
