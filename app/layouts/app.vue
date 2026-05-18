<template>
  <div class="min-h-screen flex bg-(--linear-to-br) from-[#F0F4F1] to-(--green-deep2) text-(--text-primary) font-sans">
    <AppSidebar />
    <div class="ml-60 flex-1 flex flex-col min-h-screen">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
</script>
