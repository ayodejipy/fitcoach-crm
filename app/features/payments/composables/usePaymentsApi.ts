import type {
  HandlersListPaymentsResponse,
  HandlersCreateInvoiceRequest,
  HandlersUpdatePaymentRequest,
  ModelsCoachPayment,
} from '~/services/types.gen'

export function usePaymentsApi() {
  const { $api } = useNuxtApp()

  // --- reads ---

  const list = (params?: { page?: number; per_page?: number; status?: string; search?: string }) =>
    $api<HandlersListPaymentsResponse>('/api/payments', { params })

  const get = (id: string) =>
    $api<ModelsCoachPayment>(`/api/payments/${id}`)

  // --- mutations ---

  const create = (body: HandlersCreateInvoiceRequest) =>
    $api<ModelsCoachPayment>('/api/payments', { method: 'POST', body })

  const update = (id: string, body: HandlersUpdatePaymentRequest) =>
    $api<ModelsCoachPayment>(`/api/payments/${id}`, { method: 'PATCH', body })

  const markPaid = (id: string) =>
    $api<ModelsCoachPayment>(`/api/payments/${id}/mark-paid`, { method: 'POST' })

  return { list, get, create, update, markPaid }
}
