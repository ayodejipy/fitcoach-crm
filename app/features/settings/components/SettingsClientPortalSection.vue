<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

const authStore = useAuthStore()
const toast = useToast()

const slug = ref(authStore.coach?.slug ?? '')
const portalBase = 'portal.fitcoachcrm.com/'

const portalUrl = computed(() => `https://${portalBase}${slug.value}`)

function onCopy() {
  if (!import.meta.client) return
  navigator.clipboard?.writeText(portalUrl.value).then(
    () => toast.add({ title: 'Copied to clipboard', color: 'success' }),
    () => toast.add({ title: 'Could not copy', color: 'error' }),
  )
}
</script>

<template>
  <SettingsSection
    id="client-portal"
    title="Client portal"
    description="The branded portal where your clients submit check-ins."
  >
    <UFormField label="Portal URL">
      <div class="flex items-stretch rounded-md border border-(--border) overflow-hidden bg-(--bg-surface)">
        <span class="px-3 py-2 text-[12.5px] text-(--text-muted) font-mono bg-(--bg-subtle)">{{ portalBase }}</span>
        <input
          v-model="slug"
          type="text"
          class="flex-1 px-3 py-2 text-[12.5px] font-mono text-(--text-primary) bg-transparent focus:outline-none"
          :aria-label="`Portal slug · ${portalBase}<slug>`"
        />
        <button
          type="button"
          class="px-3 text-[11.5px] text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-subtle) border-l border-(--border)"
          @click="onCopy"
        >
          Copy
        </button>
      </div>
      <template #help>
        <p class="text-[10.5px] text-(--text-muted) mt-1">
          Clients receive this link in their invite email · changing the slug will break old links.
        </p>
      </template>
    </UFormField>
  </SettingsSection>
</template>
