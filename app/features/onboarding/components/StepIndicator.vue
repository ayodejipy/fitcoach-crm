<template>
  <div class="step-indicator flex items-center mb-7">
    <template v-for="(step, i) in steps" :key="step.label">
      <!-- Step dot + label -->
      <div class="step-dot-wrap flex flex-col items-center gap-1.5 relative">
        <div
          class="step-dot h-2 rounded"
          :class="[
            i + 1 < currentStep ? 'w-2 bg-(--green-mid)' : '',
            i + 1 === currentStep ? 'w-[22px] bg-(--green-light)' : '',
            i + 1 > currentStep ? 'w-2 bg-white/18' : '',
          ]"
        ></div>
        <span
          class="step-label absolute top-[18px] text-[10px] font-medium whitespace-nowrap tracking-[0.2px] transition-colors duration-300"
          :class="[
            i + 1 < currentStep ? 'text-(--green-mid)' : '',
            i + 1 === currentStep ? 'text-white/80' : '',
            i + 1 > currentStep ? 'text-white/35' : '',
          ]"
        >{{ step.label }}</span>
      </div>

      <!-- Connector (not after last step) -->
      <div
        v-if="i < steps.length - 1"
        class="step-connector w-12 h-0.5 mx-1.5 rounded-sm overflow-hidden shrink-0 bg-white/12 relative max-[600px]:w-7"
      >
        <div
          class="absolute left-0 top-0 h-full rounded-sm bg-(--green-mid) transition-[width] duration-500"
          :style="{ width: i + 1 < currentStep ? '100%' : '0%' }"
        ></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentStep: number
}>()

const steps = [
  { label: 'Profile' },
  { label: 'Client' },
  { label: 'Check-ins' },
  { label: 'Tools' },
]
</script>

<style scoped>
.step-dot {
  transition: width .4s cubic-bezier(.4, 0, .2, 1), background .3s ease;
}
</style>
