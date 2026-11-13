<script setup lang="ts">
import { MonitorPlay, ArrowRight, MousePointer2 } from '@lucide/vue'
const emit = defineEmits<{ start: [] }>()
const { t } = useI18n()
</script>
<template>
  <aside class="computer-invitation" data-world-panel aria-labelledby="computer-invitation-title">
    <MonitorPlay :size="23" />
    <div>
      <h2 id="computer-invitation-title">{{ t('company.invitationTitle') }}</h2>
      <p>{{ t('company.invitationBody') }}</p>
      <button @click="emit('start')">
        <MousePointer2 :size="16" />{{ t('company.start') }}<ArrowRight :size="17" />
      </button>
    </div>
  </aside>
</template>
<style scoped>
.computer-invitation {
  position: absolute;
  z-index: 8;
  left: 24px;
  top: 134px;
  bottom: auto;

  display: flex;
  align-items: flex-start;
  gap: 13px;
  width: min(390px, calc(100% - 28px));
  padding: 15px 18px;
  background: #f1eddc;
  color: #315447;
  border: 1px solid #8ca17e;
  border-radius: 5px;
  box-shadow: 5px 6px 0 #294b432b;
}
h2 {
  font: 500 17px 'Space Grotesk';
  margin: 0 0 7px;
}
p {
  font-size: 12px;
  line-height: 1.6;
  margin: 0 0 10px;
}
button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 9px 14px;
  background: #355d4c;
  color: #f1e8c9;
  border-radius: 3px;
  font-size: 12px;
}
@media (max-width: 500px) {
  .computer-invitation {
    top: auto;
    bottom: 96px;
    left: 12px;
    padding: 10px;
    width: calc(100% - 24px);
  }
  .computer-invitation h2 {
    font-size: 14px;
    margin-bottom: 8px;
  }
  .computer-invitation p,
  .computer-invitation > svg {
    display: none;
  }
}
</style>
