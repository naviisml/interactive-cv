<script setup lang="ts">
import { Menu, X, List, Map, MessageSquareText, MessageSquareOff, ChevronDown } from '@lucide/vue'
import { financialSnapshot } from '~/game/core/financialSnapshot'
import type { TimelineEvent } from '~/content/timeline'
import { levels, type LevelId } from '~/content/journey'
const props = defineProps<{
  active: LevelId
  financeIndex: number
  financeEvents: readonly TimelineEvent[]
  contextTitle?: string
  listMode: boolean
  tooltipsEnabled: boolean
}>()
const hasFinances = computed(() => {
  const { debt, savings, yearlyIncome } = financialSnapshot(props.financeEvents, props.financeIndex)
  return debt !== null || savings !== null || yearlyIncome !== null
})
const financeCounter = ref<{ open: () => void }>()
function openFinanceHelp() {
  menuOpen.value = false
  financeCounter.value?.open()
}
const emit = defineEmits<{
  navigate: [id: LevelId]
  toggleList: []
  toggleTooltips: [enabled: boolean]
  moneyToggle: [open: boolean]
}>()
const { t, locale, setLocale } = useI18n()
const menuOpen = ref(false)
const menuRoot = ref<HTMLElement>()
// The first outside gesture only dismisses the menu. Capture it before Pixi
// or an underlying DOM button can treat it as a second, unrelated action.
let dismissingPointer = false
function dismissMenu(event: PointerEvent) {
  dismissingPointer = false
  if (!menuOpen.value || menuRoot.value?.contains(event.target as Node)) return
  menuOpen.value = false
  dismissingPointer = true
  event.preventDefault()
  event.stopImmediatePropagation()
}
function consumeDismissalClick(event: MouseEvent) {
  if (!dismissingPointer) return
  dismissingPointer = false
  if (event.detail === 0) return
  event.preventDefault()
  event.stopImmediatePropagation()
}
function focusLeavesMenu(event: FocusEvent) {
  if (!menuRoot.value?.contains(event.relatedTarget as Node | null)) menuOpen.value = false
}
function escapeMenu(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !menuOpen.value) return
  menuOpen.value = false
  menuRoot.value?.querySelector<HTMLButtonElement>('.menu-toggle')?.focus()
}
onMounted(() => {
  document.addEventListener('pointerdown', dismissMenu, true)
  document.addEventListener('click', consumeDismissalClick, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', dismissMenu, true)
  document.removeEventListener('click', consumeDismissalClick, true)
})
function navigate(id: LevelId) {
  menuOpen.value = false
  emit('navigate', id)
}
function toggleView() {
  menuOpen.value = false
  emit('toggleList')
}
</script>
<template>
  <header class="portfolio-header" @keydown="escapeMenu">
    <NuxtLink class="wordmark" to="/" aria-label="Navi home">navi<span>®</span></NuxtLink>
    <div ref="menuRoot" class="header-menu" @focusout="focusLeavesMenu">
      <button
        class="menu-toggle"
        :aria-expanded="menuOpen"
        aria-controls="portfolio-menu"
        @click="menuOpen = !menuOpen"
      >
        <span>{{ t(menuOpen ? 'nav.close' : 'nav.menu') }}</span><component
          :is="menuOpen ? X : Menu"
          :size="18"
          aria-hidden="true"
        />
      </button>
      <nav
        id="portfolio-menu"
        class="portfolio-menu"
        :class="{ 'is-open': menuOpen }"
        aria-label="Main navigation"
      >
        <button
          v-for="level in levels"
          :key="level.id"
          :aria-current="active === level.id ? 'location' : undefined"
          :style="{ '--level-color': level.color }"
          @click="navigate(level.id)"
        >
          {{ t('nav.' + level.id) }}
        </button>
        <button v-if="!hasFinances" class="finance-help-link" @click="openFinanceHelp">
          {{ t('finance.about') }}
        </button>
      </nav>
    </div>
    <div class="header-actions">
      <label class="language-switch">
        <span class="sr-only">{{ t('nav.language') }}</span>
        <select
          :value="locale"
          :aria-label="t('nav.language')"
          @change="setLocale(($event.target as HTMLSelectElement).value as 'en' | 'nl')"
        >
          <option value="en">EN</option>
          <option value="nl">NL</option>
        </select>
        <ChevronDown :size="13" aria-hidden="true" />
      </label>
      <button
        class="header-icon-toggle"
        type="button"
        :aria-label="t(listMode ? 'nav.world' : 'nav.list')"
        :title="t(listMode ? 'nav.world' : 'nav.list')"
        :aria-pressed="listMode"
        @click="toggleView"
      >
        <component :is="listMode ? Map : List" :size="19" aria-hidden="true" />
      </button>
      <button
        class="header-icon-toggle"
        type="button"
        :aria-label="locale === 'nl' ? 'Tooltips boven interacties' : 'Tooltips above interactions'"
        :title="locale === 'nl' ? 'Tooltips boven interacties' : 'Tooltips above interactions'"
        :aria-pressed="tooltipsEnabled"
        @click="emit('toggleTooltips', !tooltipsEnabled)"
      >
        <component :is="tooltipsEnabled ? MessageSquareText : MessageSquareOff" :size="19" aria-hidden="true" />
      </button>
    </div>
    <MoneyCounter
      ref="financeCounter"
      :index="financeIndex"
      :events="financeEvents"
      :show-summary="hasFinances"
      :context-title="contextTitle"
      @toggle="emit('moneyToggle', $event)"
    />
  </header>
</template>
<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  min-width: 0;
}
.language-switch {
  position: relative;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 53px;
  height: 44px;
}
.language-switch select {
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
  text-align-last: center;
  width: 100%;
  height: 44px;
  min-height: 44px;
  padding: 0 14px 0 0;
  margin: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #345747;
  font: 600 13px/1 'Space Grotesk', sans-serif;
  cursor: pointer;
}
.language-switch > svg {
  position: absolute;
  right: 5px;
  pointer-events: none;
  color: #345747;
}
.header-icon-toggle {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #345747;
}
.header-icon-toggle:hover, .header-icon-toggle:focus-visible {
  background: #e7eadf;
  border-color: #b6c5b7;
}
.header-icon-toggle[aria-pressed='false'] { color: #82938a; }
.header-icon-toggle:focus-visible, .language-switch select:focus-visible {
  outline: 2px solid #456d57;
  outline-offset: 2px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.portfolio-header {
  position: relative;
  z-index: 20;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 28px;
  min-height: 86px;
  padding: 12px 3%;
  background: #f8f5ed;
  border-bottom: 1px solid #cbd2c3;
  box-shadow: 0 4px 18px #284d3e0c;
}
.header-menu {
  min-width: 0;
}
.portfolio-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.portfolio-menu > button {
  position: relative;
  white-space: nowrap;
  padding: 14px 10px;
  font:
    13px 'Space Grotesk',
    sans-serif;
  color: #506b5d;
  border-radius: 5px;
  min-height: 44px;
}
.portfolio-menu > button:hover {
  background: #e5e9de;
  color: #294a40;
}
.portfolio-menu > button[aria-current] {
  font-weight: 600;
  color: #294a40;
  background: #e7eadf;
}
.portfolio-menu > button[aria-current]::after {
  content: '';
  position: absolute;
  bottom: 5px;
  height: 2px;
  left: 10px;
  right: 10px;
  background: var(--level-color);
}
.menu-toggle {
  display: none;
}
@media (max-width: 1100px) {
  .portfolio-header {
    gap: 12px;
    padding-inline: 3%;
  }
  .portfolio-menu > button {
    padding-inline: 7px;
    font-size: 11px;
  }
  .portfolio-header :deep(.money-counter) {
    min-width: 0;
    padding-left: 12px;
    gap: 12px;
  }
  .portfolio-header :deep(.debt-balance strong) {
    font-size: 12px;
  }
}
@media (max-width: 900px) {
  .portfolio-header {
    min-height: 0;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: 44px;
    column-gap: 8px;
    column-gap: 10px;
    row-gap: 6px;
    padding: 8px 4% 10px;
  }
  .wordmark {
    font-size: 32px;
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
  }
  .header-menu {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    z-index: 2;
  }
  .header-actions {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    margin-right: 79px;
    gap: 1px;
  }
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 44px;
    padding: 0 8px;
    font:
      12px 'Space Grotesk',
      sans-serif;
  }
  .portfolio-menu {
    display: none;
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    padding: 12px 4% 18px;
    box-shadow: 0 18px 32px #173d3328;
    background: #f8f5ed;
    border-bottom: 1px solid #cfd4c4;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .portfolio-menu.is-open {
    display: grid;
  }
  .portfolio-menu > button {
    text-align: left;
    padding: 14px;
    font-size: 14px;
  }
  .portfolio-menu > button[aria-current]::after {
    left: 14px;
    right: auto;
    width: 22px;
  }
  .portfolio-header:has(.money-counter) { grid-template-rows: 44px 36px; }
  .portfolio-header :deep(.money-counter) {
    justify-self: stretch;
    grid-column: 1/-1;
    grid-row: 2;
    min-width: 0;
    width: 100%;
    padding: 6px 0 0;
    border-top: 1px solid #cfd4c4;
    border-left: 0;
    gap: 12px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 32px;
  }
  .portfolio-header :deep(.debt-balance) {
    min-width: 0;
  }
  .portfolio-header :deep(.debt-balance > span) {
    font-size: 9px;
    letter-spacing: 0.7px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .portfolio-header :deep(.debt-balance strong) {
    font-size: 12px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .portfolio-header :deep(.debt-info-button) {
    margin: 0;
    width: 32px;
    height: 32px;
  }
}
@media (max-width: 380px) {
  .portfolio-header {
    gap: 6px;
    padding-inline: 12px;
  }
  .wordmark {
    font-size: 29px;
  }
  .menu-toggle {
    gap: 5px;
    font-size: 11px;
    padding-inline: 5px;
  }
  .portfolio-header :deep(.money-counter) {
    gap: 8px;
    padding-left: 0;
  }
  .portfolio-header :deep(.debt-balance strong) {
    font-size: 11px;
  }
  .header-actions { margin-right: 45px; gap: 0; }
  .language-switch { width: 43px; }
  .language-switch select { font-size: 12px; padding-right: 12px; }
  .header-icon-toggle { width: 38px; flex-basis: 38px; }
  .menu-toggle span { display: none; }
}
</style>
