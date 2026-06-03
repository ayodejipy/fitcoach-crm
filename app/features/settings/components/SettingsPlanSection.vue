<script setup lang="ts">
import SettingsSection from './SettingsSection.vue'
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

const authStore = useAuthStore()
const toast = useToast()

const plan = computed(() => authStore.coach?.plan ?? 'Free')
const clientCount = computed(() => authStore.appStats?.active_clients ?? 0)
const clientLimit = 10

function onUpgrade() {
  toast.add({ title: 'Pro plan launching soon', color: 'info' })
}
</script>

<template>
  <SettingsSection
    id="plan"
    title="Your FitCoach plan"
    description="Billing for FitCoach itself."
    is-last
  >
    <div class="rounded-[10px] border border-(--border) bg-(--bg-surface) p-5">
      <div class="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div class="text-[14px] font-semibold capitalize text-(--text-primary)">{{ plan }}</div>
          <div class="text-[11px] text-(--text-muted)">
            Up to {{ clientLimit }} clients · all core features · no card on file
          </div>
        </div>
        <UButton color="primary" size="sm" @click="onUpgrade">
          Upgrade to Pro
        </UButton>
      </div>
      <div class="mt-3 pt-3 border-t border-(--border-muted) text-[11px] text-(--text-muted) tabular-nums">
        {{ clientCount }} of {{ clientLimit }} clients used · Pro plan ₦5,000/mo unlocks unlimited
      </div>
    </div>
  </SettingsSection>
</template>
