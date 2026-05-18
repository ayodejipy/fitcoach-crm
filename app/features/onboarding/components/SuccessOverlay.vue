<template>
  <div class="success-overlay absolute inset-0 z-10 bg-(--bg-surface) rounded-[20px] flex flex-col items-center justify-center p-10 text-center">
    <div class="success-check-ring w-20 h-20 rounded-full bg-(--bg-primary-soft) flex items-center justify-center mb-[22px]">
      <svg viewBox="0 0 52 52" width="40" height="40">
        <circle cx="26" cy="26" r="23"/>
        <path d="M14 27l8 8 16-16"/>
      </svg>
    </div>

    <h2 class="success-title text-2xl font-extrabold text-(--text-primary) tracking-[-0.4px]">You're all set! 🎉</h2>
    <p class="success-sub text-[15px] text-(--text-secondary) mt-2.5 leading-normal max-w-[360px]">Your FitCoach workspace is ready. Time to start transforming your coaching business.</p>

    <div class="success-stats flex gap-6 mt-7 mb-8">
      <div class="text-center">
        <div class="text-[22px] font-extrabold text-primary dark:text-(--green-light)">{{ clients }}</div>
        <div class="text-xs text-(--text-muted) mt-0.5">Client added</div>
      </div>
      <div class="text-center">
        <div class="text-[22px] font-extrabold text-primary dark:text-(--green-light)">{{ questions }}</div>
        <div class="text-xs text-(--text-muted) mt-0.5">Check-in questions</div>
      </div>
      <div class="text-center">
        <div class="text-[22px] font-extrabold text-primary dark:text-(--green-light)">{{ tools }}</div>
        <div class="text-xs text-(--text-muted) mt-0.5">Tools connected</div>
      </div>
    </div>

    <button
      type="button"
      class="success-cta h-12 px-8 rounded-xl border-none bg-primary text-white text-[15px] font-bold cursor-pointer flex items-center gap-2.5 shadow-[0_4px_20px_rgba(26,122,74,0.35)] dark:shadow-[0_0_0_1px_rgba(46,204,113,0.4)] transition-[background,transform] duration-200 hover:bg-(--green-hover)"
      @click="$emit('dashboard')"
    >
      Open my dashboard
      <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  clients?: number
  questions?: number
  tools?: number
}>(), {
  clients: 0,
  questions: 5,
  tools: 0,
})

defineEmits<{
  dashboard: []
}>()
</script>

<style scoped>
.success-overlay {
  animation: success-fade .4s ease forwards;
}
@keyframes success-fade {
  from { opacity: 0; transform: scale(.97); }
  to   { opacity: 1; transform: scale(1); }
}

.success-check-ring svg circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  fill: none;
  stroke: var(--green-brand);
  animation: circle-draw .6s ease .1s forwards;
}
.success-check-ring svg path {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  stroke: var(--green-brand);
  animation: check-draw .3s ease .7s forwards;
}
@keyframes circle-draw { to { stroke-dashoffset: 0; } }
@keyframes check-draw { to { stroke-dashoffset: 0; } }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .success-check-ring svg circle,
.dark .success-check-ring svg path {
  stroke: var(--green-light);
}
</style>
