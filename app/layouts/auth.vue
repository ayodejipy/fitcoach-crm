<script setup lang="ts">
import AuthLeftPanel from '~/features/auth/components/AuthLeftPanel.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden">
    <AuthLeftPanel />

    <div
      class="flex-1 bg-linear-to-br from-[#F8FAF9] to-[#EFF4F1] dark:from-(--green-deep2) dark:to-(--green-deep) flex items-center justify-center overflow-y-auto px-6 py-8 max-md:bg-(--green-deep) dark:max-md:bg-(--green-deep)">
      <div
        class="w-full max-w-[420px] max-md:bg-white dark:max-md:bg-[rgba(255,255,255,0.03)] max-md:rounded-[20px] max-md:p-7 max-md:shadow-[0_24px_60px_rgba(0,0,0,0.35)] dark:max-md:shadow-none dark:max-md:border dark:max-md:border-white/10">
        <slot />
      </div>
    </div>
  </div>
</template>
