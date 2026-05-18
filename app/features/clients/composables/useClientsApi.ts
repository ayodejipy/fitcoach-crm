import type {
  HandlersListClientsResponse,
  HandlersCreateClientRequest,
  HandlersUpdateClientRequest,
  ModelsClient,
} from '~/services/types.gen'

export function useClientsApi() {
  const { $api } = useNuxtApp()

  // --- reads ---

  const list = (params?: { page?: number; per_page?: number; status?: string; search?: string }) =>
    $api<HandlersListClientsResponse>('/clients', { params })

  const get = (id: string) =>
    $api<ModelsClient>(`/clients/${id}`)

  const invite = (id: string) =>
    $api(`/clients/${id}/invite-portal`, { method: 'POST' })

  // --- mutations ---

  const create = (body: HandlersCreateClientRequest) =>
    $api<ModelsClient>('/clients', { method: 'POST', body })

  const update = (id: string, body: HandlersUpdateClientRequest) =>
    $api<ModelsClient>(`/clients/${id}`, { method: 'PATCH', body })

  const remove = (id: string) =>
    $api(`/clients/${id}`, { method: 'DELETE' })

  return { list, get, invite, create, update, remove }
}
