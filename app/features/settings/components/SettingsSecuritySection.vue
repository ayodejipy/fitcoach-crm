<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

const authStore = useAuthStore()
const toast = useToast()

const email = computed(() => authStore.coach?.email ?? '—')

function onChangePassword() {
  toast.add({ title: 'Password change coming soon', color: 'info' })
}

function onEnable2FA() {
  toast.add({ title: 'Two-factor auth coming soon', color: 'info' })
}
</script>

<template>
  <SettingsSection
    id="security"
    title="Login & security"
    description="How you access your account."
  >
    <UFormField label="Email">
      <div class="flex items-center gap-2">
        <UInput :model-value="email" readonly class="flex-1" />
        <UButton color="neutral" variant="outline" size="sm" disabled>
          Contact support to change
        </UButton>
      </div>
    </UFormField>

    <div class="flex items-center justify-between rounded-md border border-(--border) px-4 py-3 gap-3 flex-wrap">
      <div>
        <div class="text-[12.5px] font-medium text-(--text-primary)">Password</div>
        <div class="text-[10.5px] text-(--text-muted)">Set when you signed up</div>
      </div>
      <UButton color="neutral" variant="outline" size="sm" @click="onChangePassword">
        Change
      </UButton>
    </div>

    <div class="flex items-center justify-between rounded-md border border-(--border) px-4 py-3 gap-3 flex-wrap">
      <div class="min-w-0">
        <div class="text-[12.5px] font-medium text-(--text-primary) flex items-center gap-2">
          Two-factor auth
          <UBadge label="Off" color="warning" variant="soft" size="sm" />
        </div>
        <div class="text-[10.5px] text-(--text-muted) mt-0.5">
          Extra protection at login with a code from your phone
        </div>
      </div>
      <UButton color="primary" size="sm" @click="onEnable2FA">
        Enable
      </UButton>
    </div>
  </SettingsSection>
</template>
