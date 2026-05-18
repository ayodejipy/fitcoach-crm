<template>
  <AppTopbar title="Settings" />

  <div class="flex-1 flex overflow-hidden">
    <SettingsSideNav v-model="activePanel" :sections="navSections" />

    <div class="flex-1 overflow-y-auto py-8 px-9 min-w-0">
      <ProfilePanel       v-if="activePanel === 'profile'" />
      <NotificationsPanel v-else-if="activePanel === 'notifications'" />
      <IntegrationsPanel  v-else-if="activePanel === 'integrations'" />
      <BillingPanel       v-else-if="activePanel === 'billing'" />
      <TeamPanel          v-else-if="activePanel === 'team'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppTopbar from '~/components/AppTopbar.vue'
import SettingsSideNav, { type SettingsNavSection } from '~/features/settings/components/SettingsSideNav.vue'
import ProfilePanel from '~/features/settings/components/ProfilePanel.vue'
import NotificationsPanel from '~/features/settings/components/NotificationsPanel.vue'
import IntegrationsPanel from '~/features/settings/components/IntegrationsPanel.vue'
import BillingPanel from '~/features/settings/components/BillingPanel.vue'
import TeamPanel from '~/features/settings/components/TeamPanel.vue'

definePageMeta({ layout: 'app' })

const activePanel = ref<'profile' | 'notifications' | 'integrations' | 'billing' | 'team'>('profile')

const profileIcon = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>`
const bellIcon = `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z"/></svg>`
const linkIcon = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/></svg>`
const cardIcon = `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM2 9v7a2 2 0 002 2h12a2 2 0 002-2V9H2zm4 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"/></svg>`
const usersIcon = `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM2 8a2 2 0 114 0A2 2 0 012 8zM16.19 16H19a1 1 0 000-2h-2.05a4.005 4.005 0 00-3.735-2.646A4.005 4.005 0 009.5 13.854c-.22.04-.435.093-.641.16H7A1 1 0 007 16h9.19z"/></svg>`

const navSections: SettingsNavSection[] = [
  {
    label: 'Account',
    items: [
      { id: 'profile',       label: 'Profile',       iconSvg: profileIcon },
      { id: 'notifications', label: 'Notifications', iconSvg: bellIcon, badge: 3 },
    ],
  },
  {
    label: 'Workspace',
    marginTop: true,
    items: [
      { id: 'integrations', label: 'Integrations', iconSvg: linkIcon },
      { id: 'billing',      label: 'Billing',      iconSvg: cardIcon },
      { id: 'team',         label: 'Team',         iconSvg: usersIcon },
    ],
  },
]
</script>
