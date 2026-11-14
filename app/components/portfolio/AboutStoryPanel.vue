<script setup lang="ts">
const emit = defineEmits<{ close: []; firstComputer: [] }>()
const { locale } = useI18n()
const panel = ref<HTMLElement>()
const closeButton = ref<HTMLButtonElement>()

function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return
  const controls = Array.from(
    panel.value?.querySelectorAll<HTMLElement>('button,a[href],[tabindex="0"]') ?? [],
  )
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
onMounted(() => closeButton.value?.focus({ preventScroll: true }))
</script>

<template>
  <section
    ref="panel"
    class="about-story-panel"
    data-world-panel
    role="dialog"
    aria-modal="true"
    aria-labelledby="about-story-title"
    @keydown="keydown"
    @pointerdown.stop
    @click.stop
  >
    <header class="about-window-bar">
      <span>{{ locale === 'nl' ? 'Mijn verhaal' : 'My story' }} / NAVI</span>
      <button
        ref="closeButton"
        type="button"
        class="about-window-close"
        :aria-label="locale === 'nl' ? 'Sluit mijn verhaal' : 'Close my story'"
        @click="emit('close')"
      >×</button>
    </header>
    <div class="about-window-content">
      <AboutStoryContent embedded @first-computer="emit('firstComputer')" />
    </div>
  </section>
</template>

<style scoped>
.about-story-panel {
  position: absolute;
  z-index: 35;
  top: 20px;
  right: clamp(16px, 4vw, 54px);
  width: min(460px, calc(100% - 48px));
  height: min(560px, calc(100% - 40px));
  max-height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #274d3d;
  background: #faf8f1;
  border: 1px solid #a9b9a4;
  border-top: 4px solid #64816a;
  border-radius: 9px;
  box-shadow: 0 18px 55px #173b3266;
  user-select: text;
  -webkit-user-select: text;
  touch-action: pan-y;
}
.about-window-bar {
  flex: 0 0 auto;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px 0 20px;
  background: #e7e9df;
  border-bottom: 1px solid #c7d2c2;
  color: #476952;
  font: 700 10px/1.4 'Space Grotesk', sans-serif;
  letter-spacing: 0.12em;
}
.about-window-close {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 5px;
  font: 400 28px/1 'Space Grotesk', sans-serif;
}
.about-window-close:hover,
.about-window-close:focus-visible {
  background: #d4dfd1;
}
.about-window-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 27px 30px 36px;
}
@media (max-width: 700px) {
  .about-story-panel {
    top: 12px;
    right: 12px;
    width: calc(100% - 44px);
    height: min(490px, calc(100% - 24px));
    max-height: calc(100% - 24px);
  }
  .about-window-bar { min-height: 44px; padding-left: 14px; }
  .about-window-content { padding: 18px 18px 26px; }
}
@media (max-height: 500px) {
  .about-story-panel {
    top: 8px;
    height: calc(100% - 16px);
    max-height: calc(100% - 16px);
  }
}
</style>
