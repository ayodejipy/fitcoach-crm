<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

const route = useRoute()
const authStore = useAuthStore()

const collapsed = useStorage('fitcoach.sidebar.collapsed', false)

const isActive = (path: string) =>
  route.path === path || (path !== '/' && route.path.startsWith(path))

const unreadCheckIns = computed(() => authStore.appStats?.unread_checkins ?? 0)

const navigateGroup = computed(() => [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-grid' },
  { label: 'Clients',   to: '/clients',   icon: 'i-lucide-users' },
  { label: 'Schedule',  to: '/schedule',  icon: 'i-lucide-calendar' },
  { label: 'Check-ins', to: '/check-ins', icon: 'i-lucide-check-square', badge: unreadCheckIns.value || undefined },
  { label: 'Payments',  to: '/payments',  icon: 'i-lucide-credit-card' },
])

const workspaceGroup = [
  { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' },
]
</script>

<template>
  <aside
    class="fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-(--bg-surface) border-r border-(--border) transition-[width] duration-200"
    :style="{ width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }"
  >
    <div
      class="flex items-center px-3 border-b border-(--border) shrink-0"
      :style="{ height: 'var(--topbar-h)' }"
    >
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-2.5 rounded-md px-2 py-1 flex-1 min-w-0 hover:bg-(--bg-subtle) no-underline"
      >
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-(--text-primary) text-(--bg-surface) text-[11px] font-bold shrink-0">F</span>
        <span v-if="!collapsed" class="text-[13.5px] font-semibold text-(--text-primary) tracking-[-0.01em] truncate">FitCoach</span>
      </NuxtLink>
      <button
        type="button"
        class="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-(--text-muted) hover:bg-(--bg-subtle) hover:text-(--text-primary)"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="collapsed = !collapsed"
      >
        <UIcon :name="collapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'" class="size-3.5" />
      </button>
    </div>

    <div v-if="!collapsed" class="px-3 pt-3 pb-2">
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-md border border-(--border) px-2.5 py-1.5 text-left text-[12.5px] text-(--text-muted) hover:bg-(--bg-subtle)"
      >
        <UIcon name="i-lucide-search" class="size-3.5" />
        <span class="flex-1">Search…</span>
        <span class="rounded border border-(--border) px-1 text-[10px] font-mono text-(--text-muted)">⌘K</span>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto px-2 pt-2">
      <div v-if="!collapsed" class="px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-(--text-muted)">Navigate</div>
      <NuxtLink
        v-for="item in navigateGroup"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 rounded-md px-2 py-1.5 mb-px text-[13px] no-underline hover:bg-(--bg-subtle)"
        :class="isActive(item.to) ? 'bg-(--bg-subtle) text-(--text-primary) font-medium' : 'text-(--text-secondary)'"
        :title="collapsed ? item.label : undefined"
      >
        <UIcon :name="item.icon" class="size-3.5 shrink-0" />
        <template v-if="!collapsed">
          <span class="flex-1 truncate">{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="rounded-full bg-(--green-brand) px-1.5 text-[10px] font-semibold tabular-nums text-white"
          >{{ item.badge }}</span>
        </template>
      </NuxtLink>

      <div v-if="!collapsed" class="px-2 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-(--text-muted)">Workspace</div>
      <NuxtLink
        v-for="item in workspaceGroup"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 rounded-md px-2 py-1.5 mb-px text-[13px] no-underline hover:bg-(--bg-subtle)"
        :class="isActive(item.to) ? 'bg-(--bg-subtle) text-(--text-primary) font-medium' : 'text-(--text-secondary)'"
        :title="collapsed ? item.label : undefined"
      >
        <UIcon :name="item.icon" class="size-3.5 shrink-0" />
        <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <SidebarUserMenu :collapsed="collapsed" />
  </aside>
</template>
