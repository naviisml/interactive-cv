<script setup lang="ts">
import { MonitorPlay, ArrowRight } from '@lucide/vue'
const emit = defineEmits<{ start: [] }>()
const { t } = useI18n()
</script>

<template>
  <aside class="computer-invitation" data-world-panel aria-labelledby="computer-invitation-title">
    <div class="invitation-copy">
      <span class="invitation-kicker"><MonitorPlay :size="16" aria-hidden="true" /> {{ t('company.invitationTitle') }}</span>
      <p id="computer-invitation-title">{{ t('company.invitationBody') }}</p>
    </div>
    <button class="invitation-action" @click="emit('start')">
      {{ t('company.start') }} <ArrowRight :size="17" aria-hidden="true" />
    </button>
  </aside>
</template>

<style scoped>
.computer-invitation {
  position: absolute;
  z-index: 8;
  right: clamp(18px, 3vw, 48px);
  top: 150px;
  width: min(325px, calc(100% - 36px));
  padding: 16px;
  background: #f6f2e6f2;
  backdrop-filter: blur(10px);
  border: 1px solid #9fb09b;
  border-radius: 8px;
  color: #2b5042;
  box-shadow: 0 8px 28px #1e433529, 0 3px 0 #2e524520;
}
.invitation-kicker {
  display: flex;
  align-items: center;
  gap: 9px;
  font: 600 12px 'Space Grotesk', sans-serif;
  color: #305848;
}
.invitation-copy p {
  font-size: 12px;
  line-height: 1.6;
  margin: 9px 0 14px;
  color: #496b58;
}
.invitation-action {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 46px;
  padding: 11px 14px;
  color: #f6f3e9;
  background: #325a48;
  border: 1px solid #274c3b;
  border-radius: 5px;
  box-shadow: 0 3px 0 #20423255;
  font: 600 12px 'Space Grotesk', sans-serif;
  transition: background 140ms ease, transform 140ms ease, box-shadow 140ms ease;
}
.invitation-action:hover { background: #264b3d; }
.invitation-action:active { transform: translateY(2px); box-shadow: 0 1px 0 #20423255; }
@media (max-width: 1000px) {
  .computer-invitation { top: 155px; }
}
@media (max-width: 700px) {
  .computer-invitation {
    top: 118px;
    left: 16px;
    right: auto;
    width: auto;
    padding: 0;
    border: 0;
    background: transparent;
    backdrop-filter: none;
    box-shadow: none;
  }
  .invitation-copy { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .invitation-action { min-height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .invitation-action { transition: none; }
}
</style>
