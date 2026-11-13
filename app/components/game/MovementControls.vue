<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpFromLine,
  ChevronsRight,
  Mouse,
  MoveHorizontal,
} from '@lucide/vue'
import { heldControls, type HeldControl } from '~/game/core/heldControls'
const { t } = useI18n()
const props = defineProps<{ nearLadder: boolean; paused: boolean }>()
const emit = defineEmits<{
  direction: [value: number]
  vertical: [value: number]
  sprint: [value: boolean]
  jump: []
}>()
const touch = ref(false),
  held = new Map<number, HeldControl>()
let query: MediaQueryList | undefined
function publish() {
  const state = heldControls(held)
  emit('direction', state.direction)
  emit('vertical', state.vertical)
  emit('sprint', state.sprint)
}
function hold(control: HeldControl, event: PointerEvent) {
  if (props.paused) return
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  held.set(event.pointerId, control)
  publish()
}
function release(event: PointerEvent) {
  if (held.delete(event.pointerId)) publish()
}
function jump(event: PointerEvent) {
  if (props.paused) return
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  emit('jump')
}
function clear() {
  held.clear()
  publish()
}
function preference() {
  touch.value = query?.matches ?? false
}
function pointer(event: PointerEvent) {
  // On coarse-pointer devices, an emulated mouse click or hardware keyboard
  // does not mean the touchscreen controls should disappear.
  if (event.pointerType === 'touch' || event.pointerType === 'pen') touch.value = true
  else if (!query?.matches) touch.value = false
}
function keyboard() {
  if (!query?.matches) touch.value = false
}
watch(
  () => props.paused,
  (paused) => {
    if (paused) clear()
  },
)
onMounted(() => {
  query = matchMedia('(pointer: coarse)')
  preference()
  query.addEventListener('change', preference)
  window.addEventListener('pointerdown', pointer, { passive: true })
  window.addEventListener('keydown', keyboard)
  window.addEventListener('blur', clear)
})
onBeforeUnmount(() => {
  clear()
  query?.removeEventListener('change', preference)
  window.removeEventListener('pointerdown', pointer)
  window.removeEventListener('keydown', keyboard)
  window.removeEventListener('blur', clear)
})
</script>
<template>
  <div class="movement-ui" :class="{ 'is-touch': touch }">
    <div v-if="!touch" class="keyboard-hints" :aria-label="t('controls.keyboard')">
      <span
        ><kbd><ArrowLeft /><ArrowRight /></kbd> / A D <span>{{ t('controls.walk') }}</span></span
      >
      <span><kbd>Space</kbd><ArrowUpFromLine /> {{ t('controls.jump') }}</span>
      <span><kbd>Shift</kbd><ChevronsRight /> {{ t('controls.sprint') }}</span>
      <span><Mouse /> {{ t('controls.scroll') }}</span>
      <span v-if="nearLadder"
        ><kbd><ArrowUp /><ArrowDown /></kbd> {{ t('controls.climb') }}</span
      >
    </div>
    <template v-else>
      <p class="swipe-hint">
        <MoveHorizontal :size="15" /> {{ t('controls.swipe')
        }}<span v-if="nearLadder"> · ↑ ↓ {{ t('controls.climb') }}</span>
      </p>
      <div
        class="direction-pad"
        aria-label="Walking controls"
        @pointerup="release"
        @pointercancel="release"
        @lostpointercapture="release"
      >
        <button :aria-label="t('controls.left')" @pointerdown.prevent="hold('left', $event)">
          <ArrowLeft />
        </button>
        <button :aria-label="t('controls.right')" @pointerdown.prevent="hold('right', $event)">
          <ArrowRight />
        </button>
        <template v-if="nearLadder"
          ><button :aria-label="t('controls.up')" @pointerdown.prevent="hold('up', $event)">
            <ArrowUp /></button
          ><button :aria-label="t('controls.down')" @pointerdown.prevent="hold('down', $event)">
            <ArrowDown /></button
        ></template>
      </div>
      <div
        class="action-pad"
        aria-label="Jump and sprint controls"
        @pointerup="release"
        @pointercancel="release"
        @lostpointercapture="release"
      >
        <button
          class="sprint-control"
          :aria-label="t('controls.holdSprint')"
          @pointerdown.prevent="hold('sprint', $event)"
        >
          <ChevronsRight /><small>{{ t('controls.sprint') }}</small>
        </button>
        <button class="jump-control" :aria-label="t('controls.jump')" @pointerdown.prevent="jump">
          <ArrowUpFromLine /><small>{{ t('controls.jump') }}</small>
        </button>
      </div>
    </template>
  </div>
</template>
<style scoped>
.movement-ui {
  position: absolute;
  z-index: 7;
  inset: auto clamp(12px, 2vw, 26px) 14px;
  pointer-events: none;
  color: #e6e5cb;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.keyboard-hints {
  display: flex;
  width: fit-content;
  max-width: 100%;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  font: 500 11px 'Space Grotesk', sans-serif;
  min-height: 40px;
  padding: 7px 12px;
  border: 1px solid #abc1a85c;
  border-radius: 8px;
  background: #203f34cf;
  backdrop-filter: blur(5px);
  box-shadow: 0 5px 18px #18372e24;
}
.keyboard-hints > span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.keyboard-hints svg {
  width: 14px;
  height: 14px;
}
.keyboard-hints kbd {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  min-height: 27px;
  padding: 3px 7px;
  border-color: #9bb59a;
  background: #315747;
  border-radius: 4px;
}
.direction-pad,
.action-pad {
  display: flex;
  gap: 7px;
  pointer-events: auto;
  touch-action: none;
}
.direction-pad {
  position: absolute;
  left: 0;
  bottom: 0;
}
.action-pad {
  position: absolute;
  right: 0;
  bottom: 0;
}
.movement-ui button {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex-direction: column;
  background: #365a4e;
  border: 1px solid #a4b592;
  border-radius: 8px;
  color: #f4e9c4;
  box-shadow: 0 3px 0 #173d32, 0 5px 16px #0d2a2545;
  padding: 5px;
  transition: background 130ms ease, transform 130ms ease;
}
.movement-ui button:active {
  background: #607e60;
  box-shadow: 0 1px 0 #173d32;
  transform: translateY(2px);
}
button svg {
  width: 23px;
  height: 23px;
}
button small {
  font: 9px 'Space Grotesk';
}
.jump-control {
  background: #d9d6ad !important;
  color: #284c40 !important;
}
.swipe-hint {
  position: absolute;
  left: 0;
  bottom: 60px;
  display: flex;
  align-items: center;
  gap: 6px;
  font: 600 11px 'Space Grotesk', sans-serif;
  margin: 0;
  padding: 4px 8px;
  background: #203f34d9;
  border-radius: 4px;
}
.is-touch {
  height: 96px;
}
@media (prefers-reduced-motion: reduce) {
  .movement-ui button { transition: none; }
}
@media (max-width: 380px) {
  .movement-ui {
    left: 12px;
    right: 12px;
  }
  .movement-ui button {
    width: 44px;
    height: 48px;
  }
  .direction-pad,
  .action-pad {
    gap: 5px;
  }
}
</style>
