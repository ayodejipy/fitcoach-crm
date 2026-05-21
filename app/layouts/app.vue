<script setup lang="ts">
useSeoMeta({
  title: 'FitCoach CRM',
  description: 'Everything you need to coach professionally, in one place.',
})
</script>

<template>
  <div class="min-h-screen flex bg-linear-to-br from-[#F0F4F1] to-(--green-deep2) dark:from-(--bg-page) dark:to-(--bg-page) text-(--text-primary) font-sans">
    <AppSidebar />
    <div class="ml-60 flex-1 flex flex-col min-h-screen">
      <slot />
    </div>
  </div>
</template>
