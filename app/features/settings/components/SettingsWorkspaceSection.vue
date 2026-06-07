<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import { useSettingsApi } from '../composables/useSettingsApi'
import type { HandlersUpdateMySettingsRequest, ModelsCoachSettings } from '~/services'

type Currency = NonNullable<HandlersUpdateMySettingsRequest['currency']>
type WeightUnit = NonNullable<HandlersUpdateMySettingsRequest['weight_unit']>

const CURRENCY_OPTIONS: Array<{ value: Currency; label: string }> = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'NGN', label: 'Nigerian Naira (₦)' },
]

const WEIGHT_UNIT_OPTIONS: Array<{ value: WeightUnit; label: string }> = [
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'kg',  label: 'Kilograms (kg)' },
]

const settingsApi = useSettingsApi()
const toast = useToast()
const { unit: weightUnit, setUnit: setWeightUnit } = useWeightUnit()

const currency = ref<Currency>('USD')
const loading = ref(true)
const savingCurrency = ref(false)
const savingWeightUnit = ref(false)

onMounted(async () => {
  try {
    const settings = (await settingsApi.getSettings()) as ModelsCoachSettings | undefined
    const cur = settings?.currency
    if (cur && CURRENCY_OPTIONS.some(option => option.value === cur)) {
      currency.value = cur as Currency
    }
    const wu = settings?.weight_unit
    if (wu === 'kg' || wu === 'lbs') {
      setWeightUnit(wu)
    }
  } finally {
    loading.value = false
  }
})

async function onCurrencyChange(next: Currency) {
  const previous = currency.value
  if (next === previous) return
  currency.value = next
  savingCurrency.value = true
  try {
    await settingsApi.updateSettings({ currency: next })
    toast.add({ title: 'Currency updated', color: 'success' })
  } catch {
    currency.value = previous
    toast.add({ title: 'Could not update currency', color: 'error' })
  } finally {
    savingCurrency.value = false
  }
}

async function onWeightUnitChange(next: WeightUnit) {
  const previous = weightUnit.value
  if (next === previous) return
  setWeightUnit(next)
  savingWeightUnit.value = true
  try {
    await settingsApi.updateSettings({ weight_unit: next })
    toast.add({ title: 'Weight unit updated', color: 'success' })
  } catch {
    setWeightUnit(previous)
    toast.add({ title: 'Could not update weight unit', color: 'error' })
  } finally {
    savingWeightUnit.value = false
  }
}
</script>

<template>
  <SettingsSection
    id="workspace"
    title="Workspace"
    description="How money and measurements are displayed across your workspace."
  >
    <UFormField label="Currency">
      <USkeleton v-if="loading" class="h-9 w-full max-w-[280px] rounded-md" />
      <USelect
        v-else
        :model-value="currency"
        :items="CURRENCY_OPTIONS"
        value-key="value"
        label-key="label"
        :disabled="savingCurrency"
        size="md"
        class="w-full max-w-[280px]"
        @update:model-value="onCurrencyChange"
      />
      <template #help>
        <p class="text-[10.5px] text-(--text-muted) mt-1">
          Used on dashboards, invoices, and payment displays · per-transaction currency stays on each payment record.
        </p>
      </template>
    </UFormField>

    <UFormField label="Weight unit" class="mt-5">
      <USkeleton v-if="loading" class="h-9 w-full max-w-[280px] rounded-md" />
      <USelect
        v-else
        :model-value="weightUnit"
        :items="WEIGHT_UNIT_OPTIONS"
        value-key="value"
        label-key="label"
        :disabled="savingWeightUnit"
        size="md"
        class="w-full max-w-[280px]"
        @update:model-value="onWeightUnitChange"
      />
      <template #help>
        <p class="text-[10.5px] text-(--text-muted) mt-1">
          Applies to client check-ins, progress charts, and the portal form your clients fill in · existing values are not converted.
        </p>
      </template>
    </UFormField>
  </SettingsSection>
</template>
