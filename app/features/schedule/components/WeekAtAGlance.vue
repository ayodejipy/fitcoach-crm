<template>
  <div class="bg-(--bg-surface) border border-(--border) rounded-[14px] overflow-hidden py-3.5 px-[18px]">
    <div class="text-xs font-bold text-(--text-primary) mb-2.5">Week at a Glance</div>
    <div class="grid grid-cols-2 gap-2.5">
      <div class="stat-cell">
        <div class="stat-label">Sessions</div>
        <div class="stat-value">{{ sessions }}</div>
        <div class="text-[11px] text-primary dark:text-(--green-light) font-semibold mt-0.5">{{ deltaSessions }}</div>
      </div>
      <div class="stat-cell">
        <div class="stat-label">Hours</div>
        <div class="stat-value">{{ hours }}</div>
        <div class="text-[11px] text-(--text-muted) font-medium mt-0.5">coaching hrs</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sessions: number
  hours: string
  deltaSessions: string
}>()
</script>

<style scoped>
.stat-cell {
  background: #F7FAF8;
  border: 1px solid #E8F0EB;
  border-radius: 8px;
  padding: 10px;
}
.stat-label {
  font-size: 10px;
  font-weight: 700;
  color: #8FAD97;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}
</style>

<style>
.dark .stat-cell { background: rgba(255,255,255,.02); border-color: var(--border); }
.dark .stat-label { color: var(--text-muted); }
</style>
