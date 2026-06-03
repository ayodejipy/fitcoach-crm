<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'

const toast = useToast()

const INTEGRATIONS = [
  {
    id: 'gcal',
    name: 'Google Calendar',
    initials: 'G',
    bg: '#4285F4',
    description: 'Sync sessions to your calendar',
    available: true,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    initials: 'Z',
    bg: '#2D8CFF',
    description: 'Auto-generate meeting links for virtual sessions',
    available: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    initials: 'W',
    bg: '#25D366',
    description: 'Sync check-in nudges + invoice links to client WhatsApp',
    available: false,
  },
] as const

function onConnect(integration: typeof INTEGRATIONS[number]) {
  if (integration.available) {
    toast.add({ title: `${integration.name} integration coming soon`, color: 'info' })
  } else {
    toast.add({ title: `We'll notify you when ${integration.name} is ready`, color: 'success' })
  }
}
</script>

<template>
  <SettingsSection
    id="integrations"
    title="Integrations"
    description="Connect tools you already use."
  >
    <div
      v-for="integration in INTEGRATIONS"
      :key="integration.id"
      class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-3 flex items-center gap-3"
      :class="integration.available ? '' : 'opacity-70'"
    >
      <div
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-white font-bold text-[10px] shrink-0"
        :style="{ background: integration.bg }"
      >
        {{ integration.initials }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-[12.5px] font-semibold text-(--text-primary) flex items-center gap-2">
          {{ integration.name }}
          <UBadge
            v-if="!integration.available"
            label="Soon"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
        <div class="text-[10.5px] text-(--text-muted) mt-0.5">{{ integration.description }}</div>
      </div>
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        :disabled="!integration.available"
        @click="onConnect(integration)"
      >
        {{ integration.available ? 'Connect' : 'Notify me' }}
      </UButton>
    </div>
  </SettingsSection>
</template>
