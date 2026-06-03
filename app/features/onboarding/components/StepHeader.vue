<script setup lang="ts">
defineProps<{
  title: string
  sub: string
}>()
</script>

<template>
  <header class="mb-7">
    <h2 class="text-[26px] font-semibold tracking-[-0.02em] text-(--text-primary)">{{ title }}</h2>
    <p class="mt-1.5 text-[13.5px] text-(--text-secondary)">{{ sub }}</p>
  </header>
</template>
