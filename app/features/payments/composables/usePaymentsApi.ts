import {
  getApiV1Payments,
  postApiV1Payments,
  patchApiV1PaymentsById,
  postApiV1PaymentsByIdMarkPaid,
} from '~/services/sdk.gen'
import type {
  HandlersCreateInvoiceRequest,
  HandlersUpdatePaymentRequest,
} from '~/services/types.gen'

export function usePaymentsApi() {
  const list = (params?: {
    page?: number
    per_page?: number
    status?: string
    payment_type?: string
    from?: string
    to?: string
    client_id?: string
  }) => getApiV1Payments({ query: params })

  const create = (body: HandlersCreateInvoiceRequest) =>
    postApiV1Payments({ body })

  const update = (id: string, body: HandlersUpdatePaymentRequest) =>
    patchApiV1PaymentsById({ path: { id }, body })

  const markPaid = (id: string) =>
    postApiV1PaymentsByIdMarkPaid({ path: { id } })

  return { list, create, update, markPaid }
}
