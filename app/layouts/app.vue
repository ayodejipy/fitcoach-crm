<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import type { ModelsCoach, ModelsDashboardStats } from '~/services/types.gen'

const { $api } = useNuxtApp()
const authStore = useAuthStore()

await callOnce('app-global', async () => {
  if (!authStore.isAuthenticated) return
  const [coach, stats] = await Promise.all([
    $api<ModelsCoach>('/me'),
    $api<ModelsDashboardStats>('/me/dashboard'),
  ]).catch(() => [null, null] as [null, null])
  if (coach) authStore.coach = coach
  if (stats) authStore.appStats = stats
})
</script>

<template>
  <div class="min-h-screen flex bg-(--linear-to-br) from-[#F0F4F1] to-(--green-deep2) text-(--text-primary) font-sans">
    <AppSidebar />
    <div class="ml-60 flex-1 flex flex-col min-h-screen">
      <slot />
    </div>
  </div>
</template>
