<template>
  <div class="onboarding-layout min-h-screen bg-(--green-deep) dark:bg-(--green-deep2) flex items-center justify-center py-6 px-4 max-[600px]:py-4 max-[600px]:px-3 relative overflow-x-hidden">
    <slot />
  </div>
</template>

<style scoped>
/* Dot grid */
.onboarding-layout::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: radial-gradient(circle, rgba(255, 255, 255, .045) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

/* Ambient glow */
.onboarding-layout::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 80%, rgba(26, 122, 74, .18) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 80% 20%, rgba(61, 170, 106, .1) 0%, transparent 60%);
  pointer-events: none;
}
</style>
