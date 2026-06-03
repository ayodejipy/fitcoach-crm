<script setup lang="ts">
withDefaults(defineProps<{
  coachFirstName?: string
  clientName?: string
  clientsCount?: number
  questionsCount?: number
  connectedCount?: number
}>(), {
  coachFirstName: '',
  clientName: '',
  clientsCount: 0,
  questionsCount: 5,
  connectedCount: 0,
})

defineEmits<{
  dashboard: []
}>()
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center px-10 py-12 text-center max-md:px-5">
    <div class="relative mb-7">
      <span aria-hidden="true" class="absolute inset-[-12px] rounded-full pulse-ring bg-(--green-soft)" />
      <span aria-hidden="true" class="absolute inset-[-6px] rounded-full bg-(--green-pale)" />
      <span class="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-(--green-brand) text-white">
        <UIcon name="i-lucide-check" class="size-9" />
      </span>
    </div>

    <h1 class="text-[28px] font-semibold tracking-[-0.02em] text-(--text-primary)">You're all set.</h1>
    <p class="mt-2 text-[14px] text-(--text-secondary) max-w-[460px]">
      <template v-if="clientName">
        {{ clientName }}'s first check-in is scheduled. We'll send them an invite to your client portal.
      </template>
      <template v-else>
        Your workspace is ready. Time to start coaching.
      </template>
    </p>

    <div class="mt-8 grid grid-cols-3 gap-3 w-full max-w-[480px] max-md:grid-cols-1">
      <div class="rounded-[10px] border border-(--border) p-4 text-left">
        <div class="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">Clients</div>
        <div class="mt-1 text-[20px] font-semibold tabular-nums text-(--text-primary)">{{ clientsCount }}</div>
        <div class="mt-0.5 text-[10.5px] text-(--text-muted) truncate">
          {{ clientName || 'None yet' }}
        </div>
      </div>
      <div class="rounded-[10px] border border-(--border) p-4 text-left">
        <div class="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">Questions</div>
        <div class="mt-1 text-[20px] font-semibold tabular-nums text-(--text-primary)">{{ questionsCount }}</div>
        <div class="mt-0.5 text-[10.5px] text-(--text-muted)">In your check-in form</div>
      </div>
      <div class="rounded-[10px] border border-(--border) p-4 text-left">
        <div class="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">Connected</div>
        <div class="mt-1 text-[20px] font-semibold tabular-nums text-(--text-primary)">{{ connectedCount }}</div>
        <div class="mt-0.5 text-[10.5px] text-(--text-muted)">Payments &amp; tools</div>
      </div>
    </div>

    <div class="mt-8 w-full max-w-[480px] rounded-[10px] border border-(--green-soft) bg-(--green-pale) px-4 py-3.5 text-left flex items-start gap-3">
      <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--green-brand) text-white">
        <UIcon name="i-lucide-chevrons-right" class="size-3.5" />
      </span>
      <div>
        <div class="text-[12.5px] font-semibold text-(--green-brand)">What's next</div>
        <div class="mt-0.5 text-[11.5px] text-(--green-brand)">
          Your dashboard shows today's sessions and any check-ins waiting on you. Create your first invoice from Payments when you're ready.
        </div>
      </div>
    </div>

    <UButton
      color="primary"
      size="lg"
      class="mt-8"
      trailing-icon="i-lucide-arrow-right"
      @click="$emit('dashboard')"
    >
      Open my dashboard
    </UButton>
  </div>
</template>

<style scoped>
@keyframes ping-slow {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50%       { transform: scale(1.2); opacity: 0.1; }
}
.pulse-ring { animation: ping-slow 2s ease-in-out infinite; }
</style>
