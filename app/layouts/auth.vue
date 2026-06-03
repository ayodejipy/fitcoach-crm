<script setup lang="ts">
import AuthLeftPanel from '~/features/auth/components/AuthLeftPanel.vue'
</script>

<template>
  <div class="min-h-screen flex bg-(--bg-page) text-(--text-primary) font-sans">
    <AuthLeftPanel />
    <main
      id="main-content"
      class="flex-1 bg-(--bg-surface) flex flex-col overflow-y-auto"
    >
      <slot />
    </main>
  </div>
</template>
