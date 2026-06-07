import type { ModelsCoachSettings } from '~/services'
import { getApiV1MeSettings } from '~/services'

type WeightUnit = 'kg' | 'lbs'

// Shared reactive weight unit, fetched once per session from the coach's
// settings and surfaced to every component that displays a weight value.
// Updates pushed by SettingsWorkspaceSection on save propagate
// automatically — every consumer of useWeightUnit() reactively re-renders
// with the new label.
//
// Default 'lbs' matches the migration default; the API value overrides
// once it arrives. We keep a `loaded` flag so the fetch is single-flight
// across all callers in a session.
export function useWeightUnit() {
  const unit = useState<WeightUnit>('coach-weight-unit', () => 'lbs')
  const loaded = useState<boolean>('coach-weight-unit-loaded', () => false)

  if (import.meta.client && !loaded.value) {
    loaded.value = true
    getApiV1MeSettings()
      .then((settings: ModelsCoachSettings) => {
        if (settings.weight_unit === 'kg' || settings.weight_unit === 'lbs') {
          unit.value = settings.weight_unit
        }
      })
      .catch(() => {
        // Network/auth failure — keep default. The Settings page will
        // re-fetch on mount and correct any drift.
      })
  }

  function setUnit(next: WeightUnit) {
    unit.value = next
  }

  return { unit, setUnit }
}
