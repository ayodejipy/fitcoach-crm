<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import { useSettingsApi } from '../composables/useSettingsApi'
import type { HandlersUpdateMySettingsRequest, ModelsCoachSettings } from '~/services'

type Currency = NonNullable<HandlersUpdateMySettingsRequest['currency']>

const CURRENCY_OPTIONS: Array<{ value: Currency; label: string }> = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'NGN', label: 'Nigerian Naira (₦)' },
]

const settingsApi = useSettingsApi()
const toast = useToast()

const currency = ref<Currency>('USD')
const loading = ref(true)
const saving = ref(false)

onMounted(async () => {
  try {
    const settings = (await settingsApi.getSettings()) as ModelsCoachSettings | undefined
    const value = settings?.currency
    if (value && CURRENCY_OPTIONS.some(option => option.value === value)) {
      currency.value = value as Currency
    }
  } finally {
    loading.value = false
  }
})

async function onCurrencyChange(next: Currency) {
  const previous = currency.value
  if (next === previous) return
  currency.value = next
  saving.value = true
  try {
    await settingsApi.updateSettings({ currency: next })
    toast.add({ title: 'Currency updated', color: 'success' })
  } catch {
    currency.value = previous
    toast.add({ title: 'Could not update currency', color: 'error' })
  } finally {
    saving.value = false
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
        :disabled="saving"
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
  </SettingsSection>
</template>
