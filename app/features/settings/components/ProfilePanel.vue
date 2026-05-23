<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import SettingsCard from './SettingsCard.vue'
import AvatarUploader from './AvatarUploader.vue'
import DangerZone from './DangerZone.vue'
import { useSettingsApi } from '~/features/settings/composables/useSettingsApi'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import type { HandlersUpdateMeRequest } from '~/services'

const toast = useToast()
const authStore = useAuthStore()
const settingsApi = useSettingsApi()

const SPECIALTY_OPTIONS = [
  { label: 'Personal Training', value: 'personal-training' as const },
  { label: 'Online Coaching',   value: 'online-coaching'   as const },
  { label: 'Nutrition',         value: 'nutrition'          as const },
  { label: 'Studio',            value: 'studio'             as const },
] satisfies { label: string; value: HandlersUpdateMeRequest['specialty'] }[]

const coach = authStore.coach
const form = reactive({
  firstName: coach?.first_name ?? '',
  lastName:  coach?.last_name  ?? '',
  specialty: (coach?.specialty ?? '') as HandlersUpdateMeRequest['specialty'],
  slug:      coach?.slug       ?? '',
})
const isDirty = ref(false)
const saving  = ref(false)

const email     = computed(() => authStore.coach?.email ?? '')
const initials  = computed(() => {
  const f = form.firstName[0]?.toUpperCase() ?? ''
  const l = form.lastName[0]?.toUpperCase()  ?? ''
  return f + l || 'FC'
})
const portalUrl = computed(() => `https://app.fitcoachcrm.com/p/${form.slug || authStore.coach?.slug || ''}`)

const markDirty = () => { isDirty.value = true }

function discard() {
  const c = authStore.coach
  form.firstName = c?.first_name ?? ''
  form.lastName  = c?.last_name  ?? ''
  form.specialty = (c?.specialty ?? '') as HandlersUpdateMeRequest['specialty']
  form.slug      = c?.slug       ?? ''
  isDirty.value  = false
}

async function save() {
  saving.value = true
  try {
    await settingsApi.updateCoach({
      first_name: form.firstName || undefined,
      last_name:  form.lastName  || undefined,
      specialty:  form.specialty || undefined,
      slug:       form.slug      || undefined,
    })
    isDirty.value = false
    toast.add({ title: 'Profile saved', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to save profile', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(portalUrl.value)
    toast.add({ title: 'Link copied to clipboard', color: 'success' })
  } catch {
    toast.add({ title: 'Could not copy link', color: 'error' })
  }
}
</script>

<template>
  <div>
    <div class="mb-7">
      <div class="text-xl font-extrabold text-(--text-primary) tracking-[-0.3px]">Profile</div>
      <div class="text-[13.5px] text-(--text-muted) mt-1">Manage your public coach profile and account details.</div>
    </div>

    <SettingsCard title="Personal Information" subtitle="This appears on your client portal and invoices.">
      <AvatarUploader :initials="initials" />

      <div class="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
        <UFormField label="First Name" name="firstName">
          <UInput v-model="form.firstName" class="w-full" @update:model-value="markDirty" />
        </UFormField>
        <UFormField label="Last Name" name="lastName">
          <UInput v-model="form.lastName" class="w-full" @update:model-value="markDirty" />
        </UFormField>

        <UFormField label="Email" name="email" hint="Contact support to change your email">
          <UInput :model-value="email" readonly class="w-full opacity-70 cursor-default" />
        </UFormField>
        <UFormField label="Coaching Specialty" name="specialty">
          <USelect
            v-model="form.specialty"
            :items="SPECIALTY_OPTIONS"
            value-key="value"
            label-key="label"
            placeholder="Select specialty…"
            class="w-full"
            @update:model-value="markDirty"
          />
        </UFormField>
      </div>

      <template #footer>
        <span class="text-[12.5px] flex-1" :class="isDirty ? 'text-[#D97706]' : 'text-(--text-muted)'">
          {{ isDirty ? 'You have unsaved changes' : '' }}
        </span>
        <UButton
          variant="outline"
          color="neutral"
          size="lg"
          :disabled="saving || !isDirty"
          @click="discard"
        >Discard</UButton>
        <UButton
          color="primary"
          size="lg"
          leading-icon="i-heroicons-check"
          :loading="saving"
          :disabled="!isDirty"
          @click="save"
        >Save Changes</UButton>
      </template>
    </SettingsCard>

    <SettingsCard title="Client Portal URL" subtitle="Share this link with clients to access their portal.">
      <UFormField label="Portal slug" name="slug" hint="Changing your slug updates the public URL">
        <UInput
          v-model="form.slug"
          class="w-full"
          placeholder="your-name"
          @update:model-value="markDirty"
        >
          <template #leading>
            <span class="text-(--text-muted) text-xs font-medium whitespace-nowrap select-none">fitcoachcrm.com/p/</span>
          </template>
        </UInput>
      </UFormField>
      <div class="flex gap-2.5 items-center mt-3">
        <UInput :model-value="portalUrl" readonly class="flex-1 min-w-0" />
        <UButton
          variant="soft"
          color="primary"
          size="lg"
          leading-icon="i-heroicons-clipboard-document"
          @click="copy"
        >Copy Link</UButton>
      </div>
      <p class="text-[11.5px] text-(--text-muted) mt-2">
        Clients who visit this URL will be prompted to log in or sign up to access their coaching portal.
      </p>
    </SettingsCard>

    <DangerZone
      title="Delete Account"
      description="Permanently delete your FitCoach account and all data. This cannot be undone."
      button-label="Delete Account"
    />
  </div>
</template>
