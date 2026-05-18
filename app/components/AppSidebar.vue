<template>
  <aside class="fixed top-0 left-0 bottom-0 w-60 min-h-screen bg-(--green-deep) flex flex-col shrink-0">
    <!-- Logo -->
    <div class="pt-7 px-6 pb-6 border-b border-white/7">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-md flex items-center justify-center bg-linear-to-br from-(--green-light) to-primary">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h2M14 10h2M10 4v2M10 14v2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            <circle cx="10" cy="10" r="3" stroke="#fff" stroke-width="2"/>
            <path d="M6.5 6.5l1.5 1.5M12 12l1.5 1.5M13.5 6.5L12 8M8 12l-1.5 1.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <div class="text-[17px] font-bold text-white tracking-[-0.3px] leading-tight">FitCoach</div>
          <div class="text-[11px] font-medium text-[#6EE7A0] mt-px">CRM</div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="py-4 px-3 flex-1">
      <div class="text-[10px] font-semibold uppercase tracking-[1px] text-white/30 py-3 px-3">Main</div>
      <NuxtLink
        v-for="item in mainNav"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 py-2.5 px-3 rounded-lg cursor-pointer transition-colors duration-150 mb-0.5 no-underline hover:bg-white/7"
        :class="{ 'bg-primary shadow-[0_2px_8px_rgba(26,122,74,0.35)]': isActive(item.to) }"
      >
        <component :is="item.icon" class="w-[18px] h-[18px] opacity-75 shrink-0" :class="{ 'opacity-100!': isActive(item.to) }" />
        <span class="text-sm font-medium text-white/70" :class="{ 'text-white! font-semibold!': isActive(item.to) }">{{ item.label }}</span>
        <span v-if="item.badge" class="ml-auto bg-[#E74C3C] text-white text-[11px] font-bold px-1.5 py-px rounded-md">{{ item.badge }}</span>
      </NuxtLink>

      <div class="text-[10px] font-semibold uppercase tracking-[1px] text-white/30 py-3 px-3 mt-3">Account</div>
      <NuxtLink
        v-for="item in accountNav"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 py-2.5 px-3 rounded-lg cursor-pointer transition-colors duration-150 mb-0.5 no-underline hover:bg-white/7"
        :class="{ 'bg-primary shadow-[0_2px_8px_rgba(26,122,74,0.35)]': isActive(item.to) }"
      >
        <component :is="item.icon" class="w-[18px] h-[18px] opacity-75 shrink-0" :class="{ 'opacity-100!': isActive(item.to) }" />
        <span class="text-sm font-medium text-white/70" :class="{ 'text-white! font-semibold!': isActive(item.to) }">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- User card -->
    <div class="p-4 border-t border-white/7 flex items-center gap-2.5">
      <Avatar initials="JR" variant="a" :size="36" />
      <div>
        <div class="text-[13px] font-semibold text-white">Jordan Rivera</div>
        <div class="text-[11px] text-white/40">Pro Plan · 18 clients</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useRoute } from 'vue-router'
import Avatar from './Avatar.vue'

const route = useRoute()
const isActive = (to: string) => route.path === to || (to !== '/' && route.path.startsWith(to))

// Icon components — rendered inline
const DashIcon = () => h('svg', { viewBox: '0 0 18 18', fill: 'none' }, [
  h('rect', { x: 1, y: 1, width: 6, height: 6, rx: 1.5, fill: 'white' }),
  h('rect', { x: 11, y: 1, width: 6, height: 6, rx: 1.5, fill: 'white', opacity: 0.6 }),
  h('rect', { x: 1, y: 11, width: 6, height: 6, rx: 1.5, fill: 'white', opacity: 0.6 }),
  h('rect', { x: 11, y: 11, width: 6, height: 6, rx: 1.5, fill: 'white', opacity: 0.6 }),
])
const ClientsIcon = () => h('svg', { viewBox: '0 0 18 18', fill: 'none' }, [
  h('circle', { cx: 9, cy: 6, r: 3.5, stroke: 'white', 'stroke-width': 1.5 }),
  h('path', { d: 'M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6', stroke: 'white', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
])
const ScheduleIcon = () => h('svg', { viewBox: '0 0 18 18', fill: 'none' }, [
  h('rect', { x: 2, y: 3, width: 14, height: 13, rx: 2, stroke: 'white', 'stroke-width': 1.5 }),
  h('path', { d: 'M6 1v3M12 1v3M2 7h14', stroke: 'white', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
])
const CheckinsIcon = () => h('svg', { viewBox: '0 0 18 18', fill: 'none' }, [
  h('path', { d: 'M2 4h14M2 9h10M2 14h7', stroke: 'white', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
  h('circle', { cx: 15, cy: 14, r: 2.5, fill: '#E74C3C' }),
])
const PaymentsIcon = () => h('svg', { viewBox: '0 0 18 18', fill: 'none' }, [
  h('rect', { x: 2, y: 4, width: 14, height: 11, rx: 2, stroke: 'white', 'stroke-width': 1.5 }),
  h('path', { d: 'M6 4V3a1 1 0 012 0v1M10 4V3a1 1 0 012 0v1', stroke: 'white', 'stroke-width': 1.5 }),
  h('path', { d: 'M6 10h2M10 10h2', stroke: 'white', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
])
const SettingsIcon = () => h('svg', { viewBox: '0 0 18 18', fill: 'none' }, [
  h('circle', { cx: 9, cy: 9, r: 7, stroke: 'white', 'stroke-width': 1.5 }),
  h('circle', { cx: 9, cy: 9, r: 2.5, stroke: 'white', 'stroke-width': 1.5 }),
  h('path', { d: 'M9 2v2M9 14v2M2 9h2M14 9h2', stroke: 'white', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
])
const AnalyticsIcon = () => h('svg', { viewBox: '0 0 18 18', fill: 'none' }, [
  h('circle', { cx: 9, cy: 9, r: 7, stroke: 'white', 'stroke-width': 1.5 }),
  h('path', { d: 'M9 5v5l3 2', stroke: 'white', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
])

const mainNav = [
  { label: 'Dashboard', to: '/dashboard', icon: DashIcon },
  { label: 'Clients',   to: '/clients',   icon: ClientsIcon,  badge: 2 },
  { label: 'Schedule',  to: '/schedule',  icon: ScheduleIcon },
  { label: 'Check-ins', to: '/check-ins', icon: CheckinsIcon, badge: 4 },
  { label: 'Payments',  to: '/payments',  icon: PaymentsIcon },
]

const accountNav = [
  { label: 'Settings',  to: '/settings',  icon: SettingsIcon },
  // { label: 'Analytics', to: '/analytics', icon: AnalyticsIcon },
]
</script>
