import type { ModelsNotification } from '~/services'

export interface NotificationDisplay {
  id: string
  title: string
  description: string
  icon: string
  tone: 'success' | 'info' | 'warning' | 'neutral'
  href: string | null
  createdAt: string
  isRead: boolean
}

interface DataShape {
  [key: string]: unknown
  client_name?: string
  client_id?: string
  session_title?: string
  session_id?: string
  invoice_id?: string
  invoice_number?: string
  amount_cents?: number
  check_in_id?: string
  week_number?: number
  message?: string
}

function clientLink(clientId?: unknown): string | null {
  return typeof clientId === 'string' && clientId ? `/clients/${clientId}` : null
}

export function presentNotification(notification: ModelsNotification): NotificationDisplay {
  const data = (notification.data ?? {}) as DataShape
  const clientName = typeof data.client_name === 'string' ? data.client_name : 'A client'

  switch (notification.type) {
    case 'checkin_submitted':
      return {
        id:          notification.id ?? '',
        title:       `${clientName} submitted a check-in`,
        description: typeof data.week_number === 'number' ? `Week ${data.week_number}` : 'Tap to respond',
        icon:        'i-hugeicons-clipboard',
        tone:        'success',
        href:        typeof data.check_in_id === 'string' ? `/check-ins/${data.check_in_id}` : '/check-ins',
        createdAt:   notification.created_at ?? '',
        isRead:      !!notification.read_at,
      }
    case 'session_booked':
    case 'session_reminder':
      return {
        id:          notification.id ?? '',
        title:       notification.type === 'session_reminder' ? `Upcoming session with ${clientName}` : `${clientName} booked a session`,
        description: typeof data.session_title === 'string' ? data.session_title : 'View on your calendar',
        icon:        'i-hugeicons-calendar-03',
        tone:        'info',
        href:        '/schedule',
        createdAt:   notification.created_at ?? '',
        isRead:      !!notification.read_at,
      }
    case 'payment_received':
    case 'invoice_paid':
      return {
        id:          notification.id ?? '',
        title:       `${clientName} paid an invoice`,
        description: typeof data.invoice_number === 'string' ? `Invoice ${data.invoice_number}` : 'View payment',
        icon:        'i-hugeicons-money-bag-02',
        tone:        'success',
        href:        '/payments',
        createdAt:   notification.created_at ?? '',
        isRead:      !!notification.read_at,
      }
    case 'invoice_overdue':
      return {
        id:          notification.id ?? '',
        title:       `${clientName}'s invoice is overdue`,
        description: typeof data.invoice_number === 'string' ? `Invoice ${data.invoice_number}` : 'Send a reminder',
        icon:        'i-hugeicons-alert-02',
        tone:        'warning',
        href:        '/payments/invoices?filter=overdue',
        createdAt:   notification.created_at ?? '',
        isRead:      !!notification.read_at,
      }
    case 'client_joined':
      return {
        id:          notification.id ?? '',
        title:       `${clientName} joined the program`,
        description: 'Send a welcome message',
        icon:        'i-hugeicons-user-add-02',
        tone:        'info',
        href:        clientLink(data.client_id) ?? '/clients',
        createdAt:   notification.created_at ?? '',
        isRead:      !!notification.read_at,
      }
    default:
      return {
        id:          notification.id ?? '',
        title:       typeof data.message === 'string' ? data.message : (notification.type ?? 'New notification'),
        description: '',
        icon:        'i-hugeicons-notification-02',
        tone:        'neutral',
        href:        null,
        createdAt:   notification.created_at ?? '',
        isRead:      !!notification.read_at,
      }
  }
}

export function groupByRecency(items: NotificationDisplay[], now: Date = new Date()): Array<{ label: string, items: NotificationDisplay[] }> {
  const today: NotificationDisplay[] = []
  const week: NotificationDisplay[] = []
  const older: NotificationDisplay[] = []

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const weekAgo = new Date(startOfToday)
  weekAgo.setDate(weekAgo.getDate() - 7)

  for (const item of items) {
    if (!item.createdAt) { older.push(item); continue }
    const created = new Date(item.createdAt)
    if (created >= startOfToday) today.push(item)
    else if (created >= weekAgo) week.push(item)
    else older.push(item)
  }

  const groups: Array<{ label: string, items: NotificationDisplay[] }> = []
  if (today.length) groups.push({ label: 'Today',         items: today })
  if (week.length)  groups.push({ label: 'Earlier',       items: week })
  if (older.length) groups.push({ label: 'Older',         items: older })
  return groups
}
