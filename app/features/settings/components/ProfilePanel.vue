<template>
  <div>
    <div class="mb-7">
      <div class="text-xl font-extrabold text-(--text-primary) tracking-[-0.3px]">Profile</div>
      <div class="text-[13.5px] text-(--text-muted) mt-1">Manage your public coach profile and account details.</div>
    </div>

    <SettingsCard title="Personal Information" subtitle="This appears on your client portal and invoices.">
      <AvatarUploader initials="MJ" @change="onAvatarChange" />

      <div class="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
        <div class="flex flex-col gap-1.5">
          <label class="settings-label">First Name</label>
          <input v-model="form.firstName" type="text" class="settings-input" @input="markDirty">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="settings-label">Last Name</label>
          <input v-model="form.lastName" type="text" class="settings-input" @input="markDirty">
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="settings-label">Business Name <span class="settings-label-hint">(optional)</span></label>
          <input v-model="form.businessName" type="text" class="settings-input" @input="markDirty">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="settings-label">Coaching Specialty</label>
          <input v-model="form.specialty" type="text" class="settings-input" @input="markDirty">
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="settings-label">Email</label>
          <input v-model="form.email" type="email" class="settings-input" @input="markDirty">
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="settings-label">Phone <span class="settings-label-hint">(optional)</span></label>
          <input v-model="form.phone" type="tel" class="settings-input" @input="markDirty">
        </div>

        <div class="flex flex-col gap-1.5 col-span-full">
          <label class="settings-label">Bio <span class="settings-label-hint">(shown on client portal)</span></label>
          <textarea v-model="form.bio" rows="4" class="settings-textarea" @input="markDirty"></textarea>
        </div>
      </div>

      <template #footer>
        <span class="text-[12.5px] flex-1" :class="isDirty ? 'text-[#D97706]' : 'text-(--text-muted)'">
          {{ isDirty ? 'You have unsaved changes' : '' }}
        </span>
        <button type="button" class="btn-ghost" @click="discard">Discard</button>
        <button type="button" class="btn-primary" @click="save">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Save Changes
        </button>
      </template>
    </SettingsCard>

    <SettingsCard title="Client Portal URL" subtitle="Share this link with clients to access their portal.">
      <div class="flex flex-col gap-1.5">
        <label class="settings-label">Your unique link</label>
        <div class="flex gap-2.5 items-stretch">
          <input
            type="text"
            class="settings-input settings-input-readonly flex-1 min-w-0"
            :value="portalUrl"
            readonly
          >
          <button type="button" class="copy-btn" @click="copy">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
            </svg>
            Copy Link
          </button>
        </div>
        <div class="text-[11.5px] text-(--text-muted) mt-1">
          Clients who visit this URL will be prompted to log in or sign up to access their coaching portal.
        </div>
      </div>
    </SettingsCard>

    <DangerZone
      title="Delete Account"
      description="Permanently delete your FitCoach account and all data. This cannot be undone."
      button-label="Delete Account"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import SettingsCard from './SettingsCard.vue'
import AvatarUploader from './AvatarUploader.vue'
import DangerZone from './DangerZone.vue'

const toast = useToast()

const form = reactive({
  firstName: 'Marcus',
  lastName: 'Johnson',
  businessName: 'Johnson Elite Coaching',
  specialty: 'Strength & Weight Loss',
  email: 'marcus@johnsonelite.com',
  phone: '+1 (555) 214-8830',
  bio: 'NASM-certified personal trainer with 8+ years coaching busy professionals. Specialising in sustainable fat loss, strength development, and building habits that last — no crash diets, no extremes. I work with a small group of motivated clients who are ready to do the work.',
})

const isDirty = ref(false)
const portalUrl = 'https://app.fitcoachcrm.com/p/marcus-johnson'

const markDirty = () => { isDirty.value = true }
const discard = () => { isDirty.value = false }
const save = () => {
  isDirty.value = false
  toast.add({ title: 'Profile saved', color: 'success' })
}
const copy = () => {
  navigator.clipboard?.writeText(portalUrl)
    .then(() => toast.add({ title: 'Link copied to clipboard', color: 'success' }))
    .catch(() => toast.add({ title: 'Could not copy link', color: 'error' }))
}
const onAvatarChange = () => { /* TODO: photo upload */ }
</script>

<style scoped>
.settings-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #374141;
  letter-spacing: .15px;
}
.settings-label-hint { font-weight: 400; color: var(--text-muted); margin-left: 4px; }

.settings-input,
.settings-textarea {
  width: 100%;
  padding: 10px 13px;
  border: 1.5px solid #D8DFD9;
  border-radius: 9px;
  font-size: 13.5px;
  color: #111;
  font-family: inherit;
  background: #fff;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  appearance: none;
}
.settings-input:focus,
.settings-textarea:focus {
  border-color: var(--green-brand);
  box-shadow: 0 0 0 3px rgba(26,122,74,.12);
}
.settings-textarea { resize: vertical; min-height: 96px; line-height: 1.5; }

.settings-input-readonly { background: #F8FAF9; color: var(--text-muted); cursor: default; user-select: all; }
.settings-input-readonly:focus { border-color: #D8DFD9; box-shadow: none; }

.btn-ghost,
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
  white-space: nowrap;
  font-family: inherit;
  transition: background .15s, transform .1s, box-shadow .12s;
}
.btn-ghost { background: #fff; color: #374141; border: 1.5px solid #D8DFD9; }
.btn-ghost:hover { background: #F5F7F5; border-color: #B8C4BB; }
.btn-primary { background: var(--green-brand); color: #fff; }
.btn-primary:hover { background: var(--green-hover); box-shadow: 0 4px 14px rgba(26,122,74,.3); }
.btn-ghost:active, .btn-primary:active { transform: scale(.98); }

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  border-radius: 8px;
  height: 42px;
  font-size: 13px;
  font-weight: 600;
  background: var(--green-pale);
  color: var(--green-brand);
  border: 1.5px solid #B8D9C4;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  flex-shrink: 0;
  transition: background .13s;
}
.copy-btn:hover { background: #D4EDDF; }
</style>

<style>
/* Dark-mode overrides — unscoped to avoid vuejs/core#12404 */
.dark .settings-label { color: var(--text-secondary); }
.dark .settings-input,
.dark .settings-textarea {
  background: var(--bg-input);
  border-color: var(--border);
  color: var(--text-primary);
}
.dark .settings-input-readonly { background: rgba(255,255,255,.03); color: var(--text-muted); }

.dark .btn-ghost { background: var(--bg-surface); color: var(--text-secondary); border-color: var(--border); }
.dark .btn-ghost:hover { background: rgba(255,255,255,.04); border-color: var(--border-strong); }

.dark .copy-btn {
  background: var(--bg-primary-soft);
  color: var(--green-light);
  border-color: rgba(46,204,113,.3);
}
.dark .copy-btn:hover { background: rgba(46,204,113,.22); }
</style>
