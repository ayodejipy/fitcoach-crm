<script setup lang="ts">
import LoginForm from './LoginForm.vue'
import SignupForm from './SignupForm.vue'

type Tab = 'login' | 'signup'

const route = useRoute()
const router = useRouter()

const currentTab = computed<Tab>({
  get: () => (route.query.mode as Tab) === 'signup' ? 'signup' : 'login',
  set: (val) => router.replace({ query: { ...route.query, mode: val } }),
})

function switchTab(tab: Tab) {
  if (currentTab.value === tab) return
  currentTab.value = tab
}
</script>

<template>
  <div class="flex flex-col flex-1 min-h-screen">
    <div class="flex items-center justify-end px-8 py-5 md:hidden">
      <NuxtLink to="/" class="flex items-center gap-2 no-underline">
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-(--text-primary) text-(--bg-surface) text-[12px] font-bold">F</span>
        <span class="text-[14px] font-semibold text-(--text-primary)">FitCoach</span>
      </NuxtLink>
    </div>

    <div class="flex-1 flex items-center justify-center px-6 py-10 max-md:py-6">
      <div class="w-full max-w-[400px]">
        <div
          role="tablist"
          aria-label="Sign in or create account"
          class="inline-flex rounded-md border border-(--border) p-0.5 mb-8"
        >
          <button
            role="tab"
            type="button"
            :aria-selected="currentTab === 'login'"
            class="rounded-sm px-4 py-1.5 text-[12.5px] font-semibold"
            :class="currentTab === 'login'
              ? 'bg-(--text-primary) text-(--bg-surface)'
              : 'text-(--text-secondary) hover:bg-(--bg-subtle)'"
            @click="switchTab('login')"
          >
            Sign in
          </button>
          <button
            role="tab"
            type="button"
            :aria-selected="currentTab === 'signup'"
            class="rounded-sm px-4 py-1.5 text-[12.5px] font-semibold"
            :class="currentTab === 'signup'
              ? 'bg-(--text-primary) text-(--bg-surface)'
              : 'text-(--text-secondary) hover:bg-(--bg-subtle)'"
            @click="switchTab('signup')"
          >
            Create account
          </button>
        </div>

        <Transition name="auth-form" mode="out-in">
          <LoginForm v-if="currentTab === 'login'" @switch="switchTab" />
          <SignupForm v-else @switch="switchTab" />
        </Transition>
      </div>
    </div>

    <footer class="px-8 py-5 flex items-center justify-between text-[11px] text-(--text-muted) max-md:flex-col max-md:items-start max-md:gap-2">
      <span>© 2026 FitCoach</span>
      <div class="flex gap-4">
        <a href="#" class="hover:text-(--text-secondary) no-underline">Privacy</a>
        <a href="#" class="hover:text-(--text-secondary) no-underline">Terms</a>
        <a href="#" class="hover:text-(--text-secondary) no-underline">Help</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.auth-form-enter-active,
.auth-form-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.auth-form-enter-from { opacity: 0; transform: translateY(6px); }
.auth-form-leave-to   { opacity: 0; transform: translateY(-6px); }
</style>
