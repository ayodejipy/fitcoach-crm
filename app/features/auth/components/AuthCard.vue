<template>
  <div class="w-full relative">
    <!-- Mobile logo -->
    <div class="hidden max-md:flex items-center gap-[9px] mb-7">
      <div
        class="w-[34px] h-[34px] rounded-[9px] bg-primary flex items-center justify-center shadow-[0_2px_12px_rgba(46,204,113,0.25)] shrink-0">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" stroke="white" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <span class="text-[17px] font-bold text-(--text-primary)">FitCoach CRM</span>
    </div>

    <!-- Toggle -->
    <div class="bg-(--bg-surface-muted) rounded-[11px] p-1 flex relative mb-8 w-fit" ref="toggleContainer">
      <div
        class="absolute top-1 bottom-1 bg-white dark:bg-gray-800 rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/10 transition-all duration-250 ease-in-out"
        :style="{ left: sliderLeft, width: sliderWidth }"></div>
      <button
        class="relative z-1 bg-transparent border-none cursor-pointer font-inherit text-[13.5px] font-semibold px-[22px] py-2 rounded-lg transition-colors whitespace-nowrap"
        :class="currentTab === 'login' ? 'text-(--text-primary)' : 'text-(--text-muted)'" ref="loginBtn"
        @click="switchTab('login')">Sign in</button>
      <button
        class="relative z-1 bg-transparent border-none cursor-pointer font-inherit text-[13.5px] font-semibold px-[22px] py-2 rounded-lg transition-colors whitespace-nowrap"
        :class="currentTab === 'signup' ? 'text-(--text-primary)' : 'text-(--text-muted)'" ref="signupBtn"
        @click="switchTab('signup')">Create account</button>
    </div>

    <!-- Forms -->
    <div class="relative">
      <Transition name="form-in" mode="out-in">
        <component
          :is="currentTab === 'login' ? LoginForm : SignupForm"
          @switch="switchTab"
        />
      </Transition>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import LoginForm from './LoginForm.vue'
import SignupForm from './SignupForm.vue'

const currentTab = ref('login')

// Slider positioning
const toggleContainer = ref<HTMLDivElement | null>(null)
const loginBtn = ref<HTMLButtonElement | null>(null)
const signupBtn = ref<HTMLButtonElement | null>(null)
const sliderLeft = ref('4px') // initial
const sliderWidth = ref('70px') // initial

const positionSlider = async () => {
  await nextTick()
  const activeBtn = currentTab.value === 'login' ? loginBtn.value : signupBtn.value
  if (!activeBtn || !toggleContainer.value) return

  const rect = activeBtn.getBoundingClientRect()
  const parentRect = toggleContainer.value.getBoundingClientRect()
  sliderLeft.value = (rect.left - parentRect.left) + 'px'
  sliderWidth.value = rect.width + 'px'
}

const switchTab = (tab: string) => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  positionSlider()
}

onMounted(() => {
  positionSlider()
  window.addEventListener('resize', positionSlider)
})
</script>

<style scoped>
/* ── Transitions ── */
.form-in-enter-active,
.form-in-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-in-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.form-in-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.form-in-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.form-in-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
