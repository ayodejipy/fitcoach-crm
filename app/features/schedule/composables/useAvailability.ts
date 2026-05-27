import { computed } from 'vue'
import type {
  ModelsCoachAvailabilitySlot,
  HandlersUpdateAvailabilitySlot,
} from '~/services/types.gen'
import { useScheduleApi } from '~/features/schedule/composables/useScheduleApi'

/**
 * Shared source of truth for the coach's weekly availability (working hours).
 *
 * Uses a stable `useAsyncData` key so every caller — the calendar grid and the
 * Set Availability drawer — reads and writes the same cached slots. Saving from
 * the drawer therefore updates the calendar reactively, no manual refresh needed.
 */
export function useAvailability() {
  const { getAvailability, updateAvailability } = useScheduleApi()

  const { data, pending, refresh } = useAsyncData<ModelsCoachAvailabilitySlot[]>(
    'me-availability',
    async () => (await getAvailability()) ?? [],
  )

  const slots = computed<ModelsCoachAvailabilitySlot[]>(() => data.value ?? [])

  async function save(next: HandlersUpdateAvailabilitySlot[]) {
    const result = await updateAvailability({ slots: next })
    data.value = result ?? []
    return data.value
  }

  return { slots, pending, refresh, save }
}
