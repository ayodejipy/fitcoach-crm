<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { useSettingsApi } from '../composables/useSettingsApi'
import { clientInitials } from '~/utils/client'

const authStore = useAuthStore()
const settingsApi = useSettingsApi()
const toast = useToast()

const form = reactive({
  first_name: authStore.coach?.first_name ?? '',
  last_name: authStore.coach?.last_name ?? '',
  business_name: authStore.coach?.business_name ?? '',
  specialty: (authStore.coach?.specialty as 'personal-training' | 'online-coaching' | 'nutrition' | 'studio' | undefined) ?? 'personal-training',
})

const initials = computed(() =>
  clientInitials({ first_name: form.first_name, last_name: form.last_name }),
)

const saving = ref(false)

const SPECIALTY_OPTIONS = [
  { value: 'personal-training', label: 'Personal Training' },
  { value: 'online-coaching',   label: 'Online Coaching' },
  { value: 'nutrition',         label: 'Nutrition Coaching' },
  { value: 'studio',            label: 'Studio / Group' },
] as const

async function onSave() {
  saving.value = true
  try {
    await settingsApi.updateCoach({
      first_name: form.first_name || undefined,
      last_name: form.last_name || undefined,
      business_name: form.business_name || undefined,
      specialty: form.specialty,
    })
    toast.add({ title: 'Profile saved', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to save profile', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <SettingsSection
    id="profile"
    title="Profile"
    description="Your public coach identity, shown to clients on invoices and the portal."
    is-first
  >
    <div class="flex items-center gap-4">
      <span class="inline-flex h-14 w-14 items-center justify-center rounded-full text-[16px] font-semibold text-white bg-(--green-brand)">
        {{ initials }}
      </span>
      <div>
        <UButton color="neutral" variant="outline" size="sm" disabled>
          Change photo
        </UButton>
        <p class="mt-1 text-[10.5px] text-(--text-muted)">JPG, PNG or WebP · max 5MB · coming soon</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
      <UFormField label="First name" name="firstName">
        <UInput v-model="form.first_name" class="w-full" />
      </UFormField>
      <UFormField label="Last name" name="lastName">
        <UInput v-model="form.last_name" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="Business name" name="businessName" hint="optional">
      <UInput v-model="form.business_name" placeholder="e.g. FitCoach Lagos" class="w-full" />
    </UFormField>

    <UFormField label="Coaching specialty" name="specialty">
      <USelect
        v-model="form.specialty"
        :items="SPECIALTY_OPTIONS"
        value-key="value"
        label-key="label"
        class="w-full"
      />
    </UFormField>

    <div class="flex justify-end pt-2">
      <UButton color="primary" :loading="saving" @click="onSave">
        Save profile
      </UButton>
    </div>
  </SettingsSection>
</template>
