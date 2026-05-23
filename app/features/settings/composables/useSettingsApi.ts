import {
  getApiV1Me,
  patchApiV1Me,
  getApiV1MeSettings,
  patchApiV1MeSettings,
} from '~/services'
import type {
  HandlersUpdateMeRequest,
  HandlersUpdateMySettingsRequest,
} from '~/services'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

export function useSettingsApi() {
  const authStore = useAuthStore()

  async function getCoach() {
    return getApiV1Me()
  }

  async function updateCoach(body: HandlersUpdateMeRequest) {
    const coach = await patchApiV1Me({ body })
    authStore.coach = coach
    return coach
  }

  async function getSettings() {
    return getApiV1MeSettings()
  }

  async function updateSettings(body: HandlersUpdateMySettingsRequest) {
    return patchApiV1MeSettings({ body })
  }

  return { getCoach, updateCoach, getSettings, updateSettings }
}
