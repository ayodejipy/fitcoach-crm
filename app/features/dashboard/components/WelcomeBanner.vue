<template>
  <div class="bg-linear-to-br from-(--green-deep) to-primary rounded-[14px] py-6 px-7 mb-6 flex items-center justify-between text-white max-md:flex-col max-md:items-start max-md:gap-4">
    <div>
      <h2 class="text-lg font-bold mb-1">{{ title }}</h2>
      <p class="text-[13px] text-white/65">{{ subtitle }}</p>
    </div>
    <div class="flex gap-1">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="text-center px-5"
        :class="i > 0 ? 'border-l border-white/15' : ''"
      >
        <div class="text-[28px] font-extrabold text-[#6EE7A0]">{{ stat.value }}</div>
        <div class="text-[11px] font-semibold text-white/55 mt-0.5">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  stats: Array<{ value: string; label: string }>
}>()
</script>
