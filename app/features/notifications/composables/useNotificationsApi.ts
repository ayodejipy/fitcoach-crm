import {
  getApiV1Notifications,
  getApiV1NotificationsUnreadCount,
  postApiV1NotificationsMarkAllRead,
  postApiV1NotificationsByIdRead,
  deleteApiV1NotificationsById,
} from '~/services/sdk.gen'

export function useNotificationsApi() {
  const list = (params?: { page?: number, per_page?: number, status?: string }) =>
    getApiV1Notifications({ query: params })

  const unreadCount = () => getApiV1NotificationsUnreadCount()

  const markAllRead = () => postApiV1NotificationsMarkAllRead()

  const markRead = (id: string) => postApiV1NotificationsByIdRead({ path: { id } })

  const remove = (id: string) => deleteApiV1NotificationsById({ path: { id } })

  return { list, unreadCount, markAllRead, markRead, remove }
}
