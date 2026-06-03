<script setup lang="ts">
import { useStorage } from '@vueuse/core'

useSeoMeta({
  title: 'FitCoach CRM',
  description: 'Everything you need to coach professionally, in one place.',
})

const sidebarCollapsed = useStorage('fitcoach.sidebar.collapsed', false)
</script>

<template>
  <div class="min-h-screen bg-(--bg-page) text-(--text-primary) font-sans">
    <AppSidebar />
    <div
      class="flex flex-col min-h-screen transition-[margin-left] duration-200"
      :style="{ marginLeft: sidebarCollapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }"
    >
      <slot />
    </div>
  </div>
</template>
