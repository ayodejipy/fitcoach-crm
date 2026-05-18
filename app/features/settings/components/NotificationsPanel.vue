<template>
  <div>
    <div class="mb-7">
      <div class="text-xl font-extrabold text-(--text-primary) tracking-[-0.3px]">Notifications</div>
      <div class="text-[13.5px] text-(--text-muted) mt-1">Choose what you're notified about and how.</div>
    </div>

    <SettingsCard title="Check-in Alerts">
      <NotificationRow
        v-for="row in checkInRows"
        :key="row.key"
        :name="row.name"
        :description="row.description"
        v-model="prefs[row.key]"
      />
    </SettingsCard>

    <SettingsCard title="Payments">
      <NotificationRow
        v-for="row in paymentRows"
        :key="row.key"
        :name="row.name"
        :description="row.description"
        v-model="prefs[row.key]"
      />
    </SettingsCard>

    <SettingsCard title="Schedule">
      <NotificationRow
        v-for="row in scheduleRows"
        :key="row.key"
        :name="row.name"
        :description="row.description"
        v-model="prefs[row.key]"
      />

      <template #footer>
        <button type="button" class="btn-primary" @click="save">Save Preferences</button>
      </template>
    </SettingsCard>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import SettingsCard from './SettingsCard.vue'
import NotificationRow from './NotificationRow.vue'

type PrefKey =
  | 'checkinNew' | 'checkinOverdue' | 'checkinStreak'
  | 'paymentReceived' | 'paymentFailed'
  | 'scheduleChange' | 'scheduleDigest'

const prefs = reactive<Record<PrefKey, boolean>>({
  checkinNew: true,
  checkinOverdue: true,
  checkinStreak: false,
  paymentReceived: true,
  paymentFailed: true,
  scheduleChange: true,
  scheduleDigest: false,
})

const checkInRows: { key: PrefKey; name: string; description: string }[] = [
  { key: 'checkinNew',     name: 'New check-in submitted', description: "Get notified when a client submits their weekly check-in." },
  { key: 'checkinOverdue', name: 'Check-in overdue',       description: "Alert when a client hasn't checked in by their scheduled day." },
  { key: 'checkinStreak',  name: 'Check-in streak milestone', description: 'Notify when a client hits a 4-, 8- or 12-week streak.' },
]

const paymentRows: { key: PrefKey; name: string; description: string }[] = [
  { key: 'paymentReceived', name: 'Payment received',         description: 'Confirm each successful subscription charge or invoice payment.' },
  { key: 'paymentFailed',   name: 'Payment failed or overdue', description: "Alert when a client's payment fails or an invoice goes past due." },
]

const scheduleRows: { key: PrefKey; name: string; description: string }[] = [
  { key: 'scheduleChange', name: 'Session booked or cancelled', description: 'Get an alert any time a client books or cancels a session.' },
  { key: 'scheduleDigest', name: 'Daily schedule summary',      description: "Receive a morning digest of today's sessions at 7:00 AM." },
]

const save = () => { /* TODO: persist preferences */ }
</script>

<style scoped>
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: var(--green-brand);
  color: #fff;
  transition: background .15s, box-shadow .12s;
}
.btn-primary:hover { background: var(--green-hover); box-shadow: 0 4px 14px rgba(26,122,74,.3); }
.btn-primary:active { transform: scale(.98); }
</style>
