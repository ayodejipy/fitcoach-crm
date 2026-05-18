<template>
  <div>
    <div class="mb-7">
      <div class="text-xl font-extrabold text-(--text-primary) tracking-[-0.3px]">Team</div>
      <div class="text-[13.5px] text-(--text-muted) mt-1">Manage who has access to your FitCoach workspace.</div>
    </div>

    <SettingsCard body-padding="py-0 px-6">
      <template #head>
        <div class="flex-1">
          <div class="text-sm font-bold text-(--text-primary)">Team Members</div>
          <div class="text-[12.5px] text-(--text-muted) mt-0.5">2 of 5 seats used on your Growth Plan.</div>
        </div>
        <button type="button" class="btn-primary-sm" @click="invite">
          <svg class="w-[13px] h-[13px]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
          </svg>
          Invite Member
        </button>
      </template>

      <TeamMemberRow
        v-for="m in members"
        :key="m.email"
        :initials="m.initials"
        :variant="m.variant"
        :name="m.name"
        :email="m.email"
        :role="m.role"
        :is-owner="m.isOwner"
        :disabled="m.isOwner"
      />
    </SettingsCard>

    <SettingsCard title="Pending Invitations">
      <div class="flex items-center gap-3 py-3">
        <div class="w-9 h-9 rounded-full bg-[#F0F2F0] dark:bg-white/5 flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="#9CA3AF" width="18" height="18">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
        </div>
        <div class="min-w-0">
          <div class="text-[13.5px] font-semibold text-[#374141] dark:text-(--text-primary) truncate">coach.partner@email.com</div>
          <div class="text-xs text-(--text-muted)">Invited 2 days ago · expires Apr 24</div>
        </div>
        <button type="button" class="btn-ghost-sm ml-auto" @click="resend">Resend</button>
        <button
          type="button"
          class="text-xs py-1.5 px-3 rounded-[7px] font-bold bg-(--bg-surface) text-[#DC2626] dark:text-[#F87171] border-[1.5px] border-[#FECACA] dark:border-[#F87171]/40 cursor-pointer hover:bg-[#FEE2E2] dark:hover:bg-[#F87171]/15 transition-colors"
          @click="revoke"
        >Revoke</button>
      </div>
    </SettingsCard>
  </div>
</template>

<script setup lang="ts">
import SettingsCard from './SettingsCard.vue'
import TeamMemberRow from './TeamMemberRow.vue'

const members = [
  { initials: 'MJ', variant: 'a' as const, name: 'Marcus Johnson', email: 'marcus@johnsonelite.com', role: 'Owner', isOwner: true },
  { initials: 'AK', variant: 'f' as const, name: 'Ashley Kim',     email: 'ashley@johnsonelite.com', role: 'Admin', isOwner: false },
]

const invite = () => { /* TODO: open invite modal */ }
const resend = () => { /* TODO: resend invite */ }
const revoke = () => { /* TODO: revoke invite */ }
</script>

<style scoped>
.btn-primary-sm {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  font-size: 12.5px;
  border-radius: 7px;
  font-weight: 600;
  background: var(--green-brand);
  color: #fff;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s, box-shadow .12s;
}
.btn-primary-sm:hover { background: var(--green-hover); box-shadow: 0 4px 14px rgba(26,122,74,.3); }

.btn-ghost-sm {
  padding: 7px 13px;
  font-size: 12.5px;
  border-radius: 7px;
  font-weight: 600;
  color: #374141;
  background: #fff;
  border: 1.5px solid #D8DFD9;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s;
}
.btn-ghost-sm:hover { background: #F5F7F5; border-color: #B8C4BB; }
</style>

<style>
.dark .btn-ghost-sm { background: var(--bg-surface); color: var(--text-secondary); border-color: var(--border); }
.dark .btn-ghost-sm:hover { background: rgba(255,255,255,.04); border-color: var(--border-strong); }
</style>
