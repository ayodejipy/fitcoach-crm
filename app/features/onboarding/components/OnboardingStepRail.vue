<script setup lang="ts">
export interface RailStep {
  id: number
  label: string
  hint: string
  summary?: string
}

defineProps<{
  steps: RailStep[]
  currentStep: number
  greeting: string
}>()

defineEmits<{
  exit: []
}>()
</script>

<template>
  <aside
    aria-label="Onboarding progress"
    class="hidden md:flex w-[320px] shrink-0 flex-col px-7 py-8 text-white brand-panel relative overflow-hidden"
  >
    <NuxtLink to="/" class="flex items-center gap-2.5 no-underline">
      <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-(--green-deep) text-[12px] font-bold">F</span>
      <span class="text-[15px] font-semibold text-white tracking-[-0.01em]">FitCoach</span>
    </NuxtLink>

    <div class="mt-10">
      <div class="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/55">Set up your workspace</div>
      <h1 class="mt-2 text-[22px] font-semibold leading-[1.15] tracking-[-0.01em]">{{ greeting }}</h1>
      <p class="mt-2 text-[12.5px] text-white/65 leading-[1.5]">4 quick steps, about 5 minutes total. You can save and come back.</p>
    </div>

    <ol class="mt-10 space-y-1" aria-label="Steps">
      <li
        v-for="step in steps"
        :key="step.id"
        class="flex items-center gap-3 rounded-md px-2.5 py-2.5"
        :class="step.id === currentStep ? 'bg-white/[0.06]' : ''"
      >
        <span
          v-if="step.id < currentStep"
          aria-label="Complete"
          class="inline-flex h-7 w-7 items-center justify-center rounded-full text-white bg-(--green-brand)"
        >
          <UIcon name="i-lucide-check" class="size-3.5" />
        </span>
        <span
          v-else-if="step.id === currentStep"
          aria-current="step"
          class="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-semibold text-white bg-(--green-brand) ring-2 ring-white/30 tabular-nums"
        >
          {{ step.id }}
        </span>
        <span
          v-else
          class="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-semibold text-white/50 border border-white/15 tabular-nums"
        >
          {{ step.id }}
        </span>

        <div class="flex-1 min-w-0">
          <div
            class="text-[12.5px] truncate"
            :class="step.id === currentStep ? 'font-semibold text-white' : step.id < currentStep ? 'font-medium text-white/65' : 'font-medium text-white/55'"
          >
            {{ step.label }}
          </div>
          <div
            class="text-[10.5px] truncate"
            :class="step.id === currentStep ? 'text-white/55' : step.id < currentStep ? 'text-white/35' : 'text-white/35'"
          >
            {{ step.summary || step.hint }}
          </div>
        </div>
      </li>
    </ol>

    <div class="mt-auto pt-8">
      <button
        type="button"
        class="text-[11.5px] text-white/55 hover:text-white/85 hover:underline"
        @click="$emit('exit')"
      >
        Save &amp; exit · Resume anytime
      </button>
      <div class="mt-4 text-[10.5px] text-white/35">
        © 2026 FitCoach · Need help?
        <a href="mailto:support@fitcoach.io" class="underline">support@fitcoach.io</a>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.brand-panel {
  background: radial-gradient(ellipse at top left, #1A6B3D 0%, #0D3D22 60%, #0A2818 100%);
}
</style>
