import { ref, computed, type ComputedRef } from 'vue'
import type { ModelsClient, ModelsCoachCheckIn } from '~/services'
import { clientName, clientInitials, hashVariant } from '~/utils/client'
import { fmtRelative } from '~/utils/format'
import type { ReminderClient } from '../components/SendReminderModal.vue'

export function useCheckInModals(
  checkIns: ComputedRef<ModelsCoachCheckIn[]>,
  clientMap: ComputedRef<Map<string, ModelsClient>>,
) {
  const toast = useToast()

  const customizeOpen = ref(false)
  const reminderOpen  = ref(false)

  // Clients who haven't submitted a check-in in the currently visible list
  const reminderClients = computed<ReminderClient[]>(() => {
    const submittedIds = new Set(checkIns.value.map(ci => ci.client_id).filter(Boolean))
    return [...clientMap.value.values()]
      .filter(c => c.id && (c.status === 'active' || c.status === 'new') && !submittedIds.has(c.id))
      .map(c => ({
        id:          c.id!,
        name:        clientName(c),
        initials:    clientInitials(c),
        variant:     hashVariant(c.id ?? '') as ReminderClient['variant'],
        lastCheckIn: c.last_check_in
          ? `Last check-in: ${fmtRelative(c.last_check_in)}`
          : undefined,
      }))
  })

  const onReminderSent = (clientIds: string[], _msg: string) => {
    toast.add({
      title: `Reminder sent to ${clientIds.length} client${clientIds.length !== 1 ? 's' : ''}`,
      color: 'success',
    })
  }

  return { customizeOpen, reminderOpen, reminderClients, onReminderSent }
}
