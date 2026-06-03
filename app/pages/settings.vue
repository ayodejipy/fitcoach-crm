<script setup lang="ts">
import AppTopbar from '~/components/AppTopbar.vue'
import SettingsProfileSection from '~/features/settings/components/SettingsProfileSection.vue'
import SettingsSecuritySection from '~/features/settings/components/SettingsSecuritySection.vue'
import SettingsPaymentMethodsSection from '~/features/settings/components/SettingsPaymentMethodsSection.vue'
import SettingsClientPortalSection from '~/features/settings/components/SettingsClientPortalSection.vue'
import SettingsIntegrationsSection from '~/features/settings/components/SettingsIntegrationsSection.vue'
import SettingsNotificationsSection from '~/features/settings/components/SettingsNotificationsSection.vue'
import SettingsPlanSection from '~/features/settings/components/SettingsPlanSection.vue'

definePageMeta({ layout: 'app' })

useSeoMeta({ title: 'Settings | FitCoach CRM' })

const SECTIONS = [
  { id: 'profile',          label: 'Profile' },
  { id: 'security',         label: 'Login & security' },
  { id: 'payment-methods',  label: 'Payment methods' },
  { id: 'client-portal',    label: 'Client portal' },
  { id: 'integrations',     label: 'Integrations' },
  { id: 'notifications',    label: 'Notifications' },
  { id: 'plan',             label: 'Your FitCoach plan' },
]

const activeSection = ref('profile')

onMounted(() => {
  if (!import.meta.client) return
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(e => e.isIntersecting)
      if (visible.length === 0) return
      const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (top?.target.id) activeSection.value = top.target.id
    },
    { rootMargin: '-72px 0px -50% 0px', threshold: 0 },
  )
  for (const section of SECTIONS) {
    const el = document.getElementById(section.id)
    if (el) observer.observe(el)
  }
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <AppTopbar title="Settings" />

  <main id="main-content" class="flex-1 px-8 py-8 grid grid-cols-[1fr_200px] gap-10 max-lg:grid-cols-1 max-md:px-5 max-md:py-5">
    <div class="min-w-0 max-w-[820px]">
      <SettingsProfileSection />
      <SettingsSecuritySection />
      <SettingsPaymentMethodsSection />
      <SettingsClientPortalSection />
      <SettingsIntegrationsSection />
      <SettingsNotificationsSection />
      <SettingsPlanSection />
    </div>

    <aside class="sticky top-[72px] self-start max-lg:hidden">
      <div class="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-(--text-muted) mb-3">
        On this page
      </div>
      <nav class="flex flex-col gap-px text-[12px]" aria-label="Settings sections">
        <a
          v-for="section in SECTIONS"
          :key="section.id"
          :href="`#${section.id}`"
          class="rounded-md px-2 py-1 no-underline"
          :class="activeSection === section.id
            ? 'bg-(--bg-subtle) text-(--text-primary) font-medium'
            : 'text-(--text-secondary) hover:bg-(--bg-subtle)'"
          :aria-current="activeSection === section.id ? 'location' : undefined"
        >
          {{ section.label }}
        </a>
      </nav>
    </aside>
  </main>
</template>
