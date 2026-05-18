<template>
  <div>
    <div class="mb-7">
      <div class="text-xl font-extrabold text-(--text-primary) tracking-[-0.3px]">Integrations</div>
      <div class="text-[13.5px] text-(--text-muted) mt-1">Connect your favourite tools to supercharge your coaching workflow.</div>
    </div>

    <div class="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
      <IntegrationCard
        name="Google Calendar"
        description="Sync sessions and availability. New bookings appear automatically."
        meta="Last synced 4 minutes ago · marcus@gmail.com"
        status-text="Active — syncing both ways"
        :connected="true"
        logo-variant="white"
        v-model="toggles.gcal"
      >
        <template #logo>
          <svg viewBox="0 0 48 48" width="28" height="28">
            <rect width="48" height="48" rx="6" fill="#fff"/>
            <path d="M34 14H14a4 4 0 00-4 4v16a4 4 0 004 4h20a4 4 0 004-4V18a4 4 0 00-4-4z" fill="#4285F4"/>
            <rect x="10" y="14" width="28" height="8" rx="0" fill="#fff"/>
            <text x="24" y="36" text-anchor="middle" fill="#4285F4" font-size="13" font-weight="800" font-family="Arial">17</text>
            <rect x="18" y="10" width="3" height="8" rx="1.5" fill="#4285F4"/>
            <rect x="27" y="10" width="3" height="8" rx="1.5" fill="#4285F4"/>
          </svg>
        </template>
      </IntegrationCard>

      <IntegrationCard
        name="Zoom"
        description="Auto-generate meeting links for virtual sessions on booking."
        meta="Connected as marcus.johnson@zoom.us"
        status-text="Auto-creating meeting links"
        :connected="true"
        logo-variant="zoom"
        v-model="toggles.zoom"
      >
        <template #logo>
          <svg viewBox="0 0 48 48" width="28" height="28">
            <text x="7" y="34" font-size="30" font-weight="900" fill="#fff" font-family="Arial">Z</text>
          </svg>
        </template>
      </IntegrationCard>

      <IntegrationCard
        name="Stripe"
        description="Accept card payments, manage subscriptions, and process payouts."
        meta="Payouts to Chase ···· 7294 · Next: Apr 22"
        status-text="Payments live"
        :connected="true"
        logo-variant="stripe"
        v-model="toggles.stripe"
      >
        <template #logo>
          <svg viewBox="0 0 48 48" width="28" height="28">
            <text x="8" y="35" font-size="32" font-weight="900" fill="#fff" font-family="Arial">S</text>
          </svg>
        </template>
      </IntegrationCard>

      <IntegrationCard
        name="MyFitnessPal"
        description="Pull clients' nutrition logs and calorie data directly into check-ins."
        meta="See nutrition data alongside check-in metrics"
        status-text="Not active"
        :connected="false"
        logo-variant="mfp"
        @connect="onConnectMfp"
      >
        <template #logo>
          <svg viewBox="0 0 48 48" width="28" height="28">
            <circle cx="24" cy="24" r="16" fill="#fff" opacity=".25"/>
            <text x="10" y="31" font-size="18" font-weight="900" fill="#fff" font-family="Arial">MFP</text>
          </svg>
        </template>
      </IntegrationCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import IntegrationCard from './IntegrationCard.vue'

const toggles = reactive({
  gcal: true,
  zoom: true,
  stripe: true,
})

const onConnectMfp = () => { /* TODO: start MFP OAuth */ }
</script>
