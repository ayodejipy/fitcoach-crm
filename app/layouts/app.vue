<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { getApiV1Me, getApiV1MeDashboard } from '~/services/sdk.gen'

const authStore = useAuthStore()

await callOnce('app-global', async () => {
  if (!authStore.isAuthenticated) return
  const [coach, stats] = await Promise.all([
    getApiV1Me(),
    getApiV1MeDashboard(),
  ]).catch(() => [null, null])
  if (coach) authStore.coach = coach?.data || null
  if (stats) authStore.appStats = stats?.data || null
})

useSeoMeta({
  title: 'FitCoach CRM',
  description: 'Everything you need to coach professionally, in one place.',
})
</script>

<template>
  <div class="min-h-screen flex bg-linear-to-br from-[#F0F4F1] to-(--green-deep2) text-(--text-primary) font-sans">
    <AppSidebar />
    <div class="ml-60 flex-1 flex flex-col min-h-screen">
      <slot />
    </div>
  </div>
</template>
