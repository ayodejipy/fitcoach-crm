<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { useAuthApi } from '~/features/auth/composables/useAuthApi'

defineProps<{
  collapsed?: boolean
}>()

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
    <button
      type="button"
      class="w-full flex items-center gap-2 border-t border-(--border) p-2 hover:bg-(--bg-subtle) transition-colors"
    >
      <Avatar :initials="coachInitials" variant="a" :size="28" />
      <template v-if="!collapsed">
        <div class="flex-1 min-w-0 text-left">
          <div class="text-[12.5px] font-medium text-(--text-primary) truncate">{{ coachName }}</div>
          <div class="text-[11px] text-(--text-muted) truncate">{{ coachEmail || planBadge || 'FitCoach CRM' }}</div>
        </div>
        <UIcon
          name="i-lucide-chevron-up"
          class="size-3.5 text-(--text-muted) shrink-0 transition-transform"
          :class="{ 'rotate-180': open }"
        />
      </template>
    </button>

    <template #content>
      <div class="w-56 py-1">
        <div class="px-4 py-3">
          <div class="text-[13px] font-semibold text-(--text-primary)">{{ coachName }}</div>
          <div class="text-[11.5px] text-(--text-muted) mt-0.5 truncate">{{ coachEmail }}</div>
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

        <div class="py-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2.5 px-4 py-2 text-[13px] text-(--text-secondary) hover:bg-(--bg-subtle) no-underline"
            @click="open = false"
          >
            <UIcon :name="item.icon" class="size-3.5 text-(--text-muted) shrink-0" />
            {{ item.label }}
          </NuxtLink>
        </div>

        <USeparator />

        <div class="py-1">
          <button
            type="button"
            :disabled="isLoggingOut"
            class="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-(--red) hover:bg-(--bg-subtle) disabled:opacity-50"
            @click="handleLogout"
          >
            <UIcon name="i-lucide-log-out" class="size-3.5 shrink-0" />
            {{ isLoggingOut ? 'Logging out…' : 'Log out' }}
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>
