<script setup lang="ts">
import Avatar from './Avatar.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { useAuthApi } from '~/features/auth/composables/useAuthApi'

const authStore = useAuthStore()
const { logout } = useAuthApi()

const open = ref(false)
const isLoggingOut = ref(false)

const coachInitials = computed(() => {
  const { first_name, last_name } = authStore.coach ?? {}
  return `${first_name?.[0] ?? ''}${last_name?.[0] ?? ''}`.toUpperCase() || '?'
})

const coachName = computed(() => {
  const { first_name, last_name } = authStore.coach ?? {}
  return [first_name, last_name].filter(Boolean).join(' ') || 'Coach'
})

const coachEmail = computed(() => authStore.coach?.email ?? '')

const planBadge = computed(() => {
  const plan = authStore.coach?.plan
  const clients = authStore.appStats?.active_clients
  const parts = [plan ? `${plan} Plan` : null, clients != null ? `${clients} clients` : null]
  return parts.filter(Boolean).join(' · ') || null
})

async function handleLogout() {
  isLoggingOut.value = true
  open.value = false
  await logout()
}

const menuItems = [
  { label: 'My profile', to: '/profile',  icon: 'i-lucide-user' },
  { label: 'Settings',   to: '/settings', icon: 'i-lucide-settings' },
  { label: 'Billing',    to: '/billing',  icon: 'i-lucide-credit-card' },
]
</script>

<template>
  <UPopover v-model:open="open" placement="top" :content="{ side: 'top', align: 'start', sideOffset: 8 }">
    <!-- Trigger: user card -->
    <button
      type="button"
      class="w-full flex items-center gap-2.5 p-4 border-t border-white/7 cursor-pointer hover:bg-white/5 transition-colors duration-150"
    >
      <Avatar :initials="coachInitials" variant="a" :size="36" />
      <div class="flex-1 min-w-0 text-left">
        <div class="text-[13px] font-semibold text-white truncate">{{ coachName }}</div>
        <div class="text-[11px] text-white/40 capitalize truncate">{{ planBadge ?? 'FitCoach CRM' }}</div>
      </div>
      <UIcon
        name="i-lucide-chevron-up"
        class="w-4 h-4 text-white/40 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <!-- Popover content -->
    <template #content>
      <div class="w-56 py-1">
        <!-- User info -->
        <div class="px-4 py-3">
          <div class="text-[14px] font-semibold text-(--ui-text)" >{{ coachName }}</div>
          <div class="text-[12px] text-(--ui-text-muted) mt-0.5">{{ coachEmail }}</div>
          <UBadge
            v-if="planBadge"
            :label="planBadge"
            color="success"
            variant="subtle"
            size="sm"
            class="mt-2"
          />
        </div>

        <USeparator />

        <!-- Navigation items -->
        <div class="py-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2.5 px-4 py-2 text-sm text-(--ui-text) hover:bg-(--ui-bg-elevated) transition-colors duration-100 no-underline"
            @click="open = false"
          >
            <UIcon :name="item.icon" class="w-4 h-4 text-(--ui-text-muted) shrink-0" />
            {{ item.label }}
          </NuxtLink>
        </div>

        <USeparator />

        <!-- Logout -->
        <div class="py-1">
          <button
            type="button"
            :disabled="isLoggingOut"
            class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-(--ui-color-error-500) hover:bg-(--ui-bg-elevated) transition-colors duration-100 disabled:opacity-50"
            @click="handleLogout"
          >
            <UIcon name="i-lucide-log-out" class="w-4 h-4 shrink-0" />
            {{ isLoggingOut ? 'Logging out…' : 'Log out' }}
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>
