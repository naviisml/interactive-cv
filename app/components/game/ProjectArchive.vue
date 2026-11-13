<script setup lang="ts">
import { ArrowLeft, ArrowRight, ArrowUpRight, X, FolderOpen, Keyboard, LayoutGrid } from '@lucide/vue'
import { presentationSlide } from '~/game/core/presentation'
import type { companySlides } from '~/content/company'

type Slide = ReturnType<typeof companySlides>[number]
const props = defineProps<{ slides: Slide[]; progress: number }>()
const emit = defineEmits<{ seek: [progress: number]; exit: [] }>()
const { locale } = useI18n()
const index = computed(() => presentationSlide(props.progress, props.slides.length))
const project = computed(() => props.slides[index.value])
const mainScroll = ref<HTMLElement>()
const shell = ref<HTMLElement>()
const isNl = computed(() => locale.value === 'nl')
const label = (nl: string, en: string) => isNl.value ? nl : en

function select(i: number) {
  if (i < 0 || i >= props.slides.length) return
  emit('seek', i / props.slides.length)
}
function keydown(event: KeyboardEvent) {
  if ((event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable]')) return
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('exit')
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    select(index.value + (event.key === 'ArrowRight' ? 1 : -1))
  } else if (event.key === 'Home') {
    event.preventDefault()
    select(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    select(props.slides.length - 1)
  }
}
watch(index, () => {
  mainScroll.value?.scrollTo({ top: 0, behavior: 'instant' })
})
onMounted(() => nextTick(() => shell.value?.focus({ preventScroll: true })))
</script>

<template>
  <section
    ref="shell"
    class="archive-shell"
    data-world-panel
    role="dialog"
    aria-modal="true"
    :aria-label="label('Projectarchief', 'Project archive')"
    tabindex="-1"
    @keydown="keydown"
  >
    <div class="archive-scrim" aria-hidden="true" />
    <div class="archive-window">
      <header class="archive-topbar">
        <div class="archive-brand">
          <div class="archive-brand-mark">n<span>°</span></div>
          <div class="archive-brand-text">
            <strong>NAVEL DEVELOPMENT</strong>
            <small>{{ label('PROJECTARCHIEF', 'PROJECT ARCHIVE') }} / 2016–{{ label('NU', 'NOW') }}</small>
          </div>
        </div>
        <div class="archive-top-actions">
          <span class="archive-status"><span /> {{ label('WERKARCHIEF', 'WORK ARCHIVE') }}</span>
          <button
            class="archive-close"
            type="button"
            :aria-label="label('Terug naar de wereld', 'Return to world')"
            @click="emit('exit')"
          >
            <X :size="19" />
            <span>{{ label('Terug naar wereld', 'Back to world') }}</span>
          </button>
        </div>
      </header>

      <div class="archive-workspace">
        <aside class="archive-index" :aria-label="label('Projecten', 'Projects')">
          <div class="archive-index-heading">
            <FolderOpen :size="15" />
            <span>{{ label('DOSSIERS', 'CASE FILES') }}</span>
            <span>{{ String(slides.length).padStart(2, '0') }}</span>
          </div>
          <div class="archive-projects">
            <button
              v-for="(item, i) in slides"
              :key="item.id"
              class="archive-file"
              type="button"
              :class="{ 'is-active': i === index }"
              :aria-current="i === index ? 'true' : undefined"
              :aria-label="`${String(i + 1).padStart(2, '0')}. ${item.title}`"
              @click="select(i)"
            >
              <span class="archive-file-nr">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="archive-file-main">
                <strong>{{ item.title }}</strong>
                <small>{{ item.period }}</small>
              </span>
              <ArrowUpRight class="archive-file-arrow" :size="14" />
            </button>
          </div>
          <p class="archive-index-footnote">
            {{ label('Een selectie van mijn eigen werk en opdrachten.', 'Selected independent work and client projects.') }}
          </p>
        </aside>

        <div ref="mainScroll" class="archive-main-scroll">
          <Transition name="archive-change" mode="out-in">
            <article v-if="project" :key="project.id" class="archive-document">
              <div class="archive-breadcrumb">
                <span>INDEX / {{ String(index + 1).padStart(2, '0') }}</span>
                <span>{{ label('PROJECTDOSSIER', 'CASE STUDY') }}</span>
              </div>

              <div class="archive-hero">
                <div class="archive-hero-copy">
                  <div class="archive-period"><span class="archive-period-dot" /> {{ project.period }}</div>
                  <h1>{{ project.title }}</h1>
                  <p class="archive-summary">{{ project.summary }}</p>
                </div>
                <div class="archive-project-number" aria-hidden="true">
                  {{ String(index + 1).padStart(2, '0') }}
                </div>
              </div>

              <div class="archive-facts">
                <div v-if="project.role">
                  <small>{{ label('MIJN ROL', 'MY ROLE') }}</small>
                  <span>{{ project.role }}</span>
                </div>
                <div v-if="project.via">
                  <small>{{ label('PROJECT VIA', 'PROJECT VIA') }}</small>
                  <span>{{ project.via }}</span>
                </div>
                <div v-if="project.location">
                  <small>{{ label('LOCATIE', 'LOCATION') }}</small>
                  <span>{{ project.location }}</span>
                </div>
              </div>

              <ProjectArtifact :key="project.id" :project="project" />

              <div class="archive-story">
                <section>
                  <div class="archive-section-label">01 / {{ label('HET VERHAAL', 'THE STORY') }}</div>
                  <h2>{{ project.chapter }}</h2>
                  <p v-for="(paragraph, i) in project.body" :key="i">{{ paragraph }}</p>
                </section>
                <aside class="archive-tech">
                  <div class="archive-section-label">02 / {{ label('TECHNOLOGIE & FOCUS', 'TECH & FOCUS') }}</div>
                  <div class="archive-tag-list">
                    <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
                    <span v-if="!project.tags.length" class="archive-no-tags">
                      {{ label('Zie de projectonderdelen hierboven', 'Explore the project components above') }}
                    </span>
                  </div>
                </aside>
              </div>
            </article>
          </Transition>
        </div>
      </div>

      <footer class="archive-footer">
        <div class="archive-footer-help">
          <LayoutGrid :size="15" />
          <span>{{ label('Kies een dossier en onderzoek de onderdelen', 'Choose a file and explore its components') }}</span>
          <span class="archive-key-hint"><Keyboard :size="14" /> ← → / ESC</span>
        </div>
        <div class="archive-footer-nav">
          <button
            type="button"
            :disabled="index === 0"
            :aria-label="label('Vorig project', 'Previous project')"
            @click="select(index - 1)"
          ><ArrowLeft :size="18" /></button>
          <span aria-live="polite">{{ String(index + 1).padStart(2, '0') }} <span>/ {{ String(slides.length).padStart(2, '0') }}</span></span>
          <button
            type="button"
            :disabled="index >= slides.length - 1"
            :aria-label="label('Volgend project', 'Next project')"
            @click="select(index + 1)"
          ><ArrowRight :size="18" /></button>
        </div>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.archive-shell {
  position: absolute;
  inset: 0;
  z-index: 18;
  padding: clamp(7px, 1.7vw, 26px);
  display: grid;
  place-items: center;
  outline: none;
  touch-action: pan-y;
  isolation: isolate;
}
.archive-scrim {
  position: absolute;
  inset: 0;
  background: #142e28da;
  backdrop-filter: blur(7px);
  z-index: -1;
}
.archive-window {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(1220px, 100%);
  height: 100%;
  max-height: 800px;
  min-height: 0;
  background: #f5f3e9;
  color: #274c3d;
  box-shadow: 0 20px 70px #0e292a5c;
  border: 1px solid #d2dccb;
  border-radius: 12px;
  overflow: hidden;
  animation: archive-enter .25s cubic-bezier(.16,.8,.24,1) both;
}
.archive-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 13px 19px;
  min-height: 68px;
  border-bottom: 1px solid #cfdbca;
  background: #faf9f0;
}
.archive-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.archive-brand-mark {
  width: 41px;
  height: 41px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #2f5a48;
  color: #f4efdb;
  font: 700 25px 'Space Grotesk', sans-serif;
  letter-spacing: -.08em;
}
.archive-brand-mark span { font-size: 13px; vertical-align: 9px; letter-spacing: 0; }
.archive-brand-text { display: grid; gap: 3px; min-width: 0; }
.archive-brand-text strong { font: 700 12px 'Space Grotesk', sans-serif; letter-spacing: .055em; }
.archive-brand-text small { font: 600 9px 'Space Grotesk', sans-serif; letter-spacing: .08em; color: #6c8571; }
.archive-top-actions { display: flex; align-items: center; gap: 21px; }
.archive-status { color: #5a7965; font: 700 10px 'Space Grotesk', sans-serif; letter-spacing: .09em; white-space: nowrap; }
.archive-status span { display: inline-block; width: 6px; height: 6px; margin-right: 6px; border-radius: 50%; background: #628a70; }
.archive-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid #b8cbb8;
  border-radius: 6px;
  font: 600 12px 'DM Sans', sans-serif;
}
.archive-close:hover { background: #e3e9dc; }
.archive-workspace { display: grid; grid-template-columns: 247px minmax(0, 1fr); min-height: 0; }
.archive-index {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #e8ebe0;
  border-right: 1px solid #cad6c6;
}
.archive-index-heading { display: flex; align-items: center; gap: 10px; padding: 23px 18px 15px; color: #4c745b; font: 700 11px 'Space Grotesk', sans-serif; letter-spacing: .12em; }
.archive-index-heading span:last-child { margin-left: auto; color: #809989; }
.archive-projects { display: grid; align-content: start; gap: 3px; padding: 0 9px; overflow-y: auto; scrollbar-width: thin; }
.archive-file {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 14px;
  gap: 9px;
  align-items: center;
  text-align: left;
  width: 100%;
  min-height: 67px;
  padding: 11px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: background .15s ease, border-color .15s ease;
}
.archive-file:hover { background: #f3f3e9; }
.archive-file.is-active {
  background: #fbf9f0;
  border-color: #cbd5c4;
  box-shadow: 0 1px 2px #28472b0c;
}
.archive-file-nr { align-self: start; margin-top: 2px; color: #72917a; font: 700 10px 'Space Grotesk', sans-serif; }
.archive-file-main { display: grid; min-width: 0; gap: 5px; }
.archive-file-main strong { font: 600 13px/1.3 'Space Grotesk', sans-serif; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
.archive-file-main small { font: 500 10px 'DM Sans', sans-serif; color: #65816e; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.archive-file-arrow { opacity: 0; }
.archive-file.is-active .archive-file-arrow { opacity: 1; }
.archive-index-footnote { margin: auto 17px 20px; padding-top: 15px; border-top: 1px solid #c4d1c1; font: 400 11px/1.65 'DM Sans', sans-serif; color: #75907a; }
.archive-main-scroll { overflow-y: auto; min-height: 0; overscroll-behavior: contain; scrollbar-width: thin; scroll-behavior: auto; }
.archive-document { max-width: 900px; margin: 0 auto; padding: clamp(18px, 3vw, 39px) clamp(18px, 3.3vw, 44px) 42px; }
.archive-breadcrumb { display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #6f896f; font: 700 10px 'Space Grotesk', sans-serif; letter-spacing: .13em; }
.archive-hero { position: relative; display: flex; align-items: flex-end; margin: 17px 0 22px; min-height: 155px; }
.archive-hero-copy { position: relative; z-index: 1; max-width: 630px; }
.archive-period { display: flex; align-items: center; gap: 9px; color: #527762; font: 700 11px 'Space Grotesk', sans-serif; }
.archive-period-dot { width: 8px; height: 8px; border-radius: 2px; background: #b78f6a; }
.archive-hero h1 {
  margin: 12px 0 14px;
  font: 700 clamp(33px, 4.1vw, 65px)/1 'Space Grotesk', sans-serif;
  letter-spacing: -.065em;
  text-wrap: balance;
}
.archive-summary { margin: 0; max-width: 600px; color: #476b55; font: 400 clamp(13px, 1.25vw, 16px)/1.7 'DM Sans', sans-serif; }
.archive-project-number { position: absolute; top: -38px; right: 0; font: 700 clamp(90px, 15vw, 188px)/1 'Space Grotesk', sans-serif; letter-spacing: -.09em; color: #e5e9de; pointer-events: none; }
.archive-facts { display: flex; flex-wrap: wrap; gap: 20px 32px; margin-bottom: 24px; padding: 15px 0; border-top: 1px solid #cbd7c9; border-bottom: 1px solid #cbd7c9; }
.archive-facts > div { min-width: 115px; max-width: 250px; display: grid; gap: 6px; }
.archive-facts small { color: #73907a; font: 700 10px 'Space Grotesk', sans-serif; letter-spacing: .09em; }
.archive-facts span { color: #2f5542; font: 600 12px/1.5 'DM Sans', sans-serif; }
.archive-story { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(175px, .7fr); gap: 40px; margin-top: 34px; }
.archive-section-label { color: #62846d; font: 700 10px 'Space Grotesk', sans-serif; letter-spacing: .12em; margin-bottom: 15px; }
.archive-story h2 { margin: 0 0 18px; font: 600 clamp(21px, 2vw, 28px)/1.2 'Space Grotesk', sans-serif; letter-spacing: -.04em; }
.archive-story p { max-width: 640px; margin: 0 0 17px; font: 400 14px/1.85 'DM Sans', sans-serif; color: #456250; }
.archive-tech { padding-top: 2px; }
.archive-tag-list { display: flex; flex-wrap: wrap; align-items: start; gap: 7px; }
.archive-tag-list span { padding: 8px 10px; border: 1px solid #becfbf; border-radius: 4px; background: #edf0e5; color: #496b55; font: 600 11px/1.4 'DM Sans', sans-serif; }
.archive-tag-list .archive-no-tags { font-weight: 400; line-height: 1.6; }
.archive-footer { min-height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 7px 18px; border-top: 1px solid #cbd6c6; background: #faf9f1; }
.archive-footer-help { display: flex; align-items: center; gap: 8px; color: #698572; font: 500 11px 'DM Sans', sans-serif; }
.archive-key-hint { display: flex; align-items: center; gap: 5px; padding-left: 16px; border-left: 1px solid #cbd6c6; color: #8a9c8c; font: 600 10px 'Space Grotesk', sans-serif; }
.archive-footer-nav { display: flex; align-items: center; gap: 13px; }
.archive-footer-nav button { display: grid; place-items: center; width: 43px; height: 43px; border: 1px solid #b9cbb7; border-radius: 6px; background: #f2f3e9; }
.archive-footer-nav button:hover:not(:disabled) { background: #dce7d9; }
.archive-footer-nav button:disabled { opacity: .3; }
.archive-footer-nav > span { min-width: 51px; text-align: center; font: 700 13px 'Space Grotesk', sans-serif; }
.archive-footer-nav > span span { color: #91a392; font-weight: 500; }
.archive-change-enter-active, .archive-change-leave-active { transition: opacity .12s ease, transform .12s ease; }
.archive-change-enter-from { opacity: 0; transform: translateY(6px); }
.archive-change-leave-to { opacity: 0; transform: translateY(-6px); }
@keyframes archive-enter { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (max-width: 800px) {
  .archive-workspace { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr); }
  .archive-index { border-right: 0; border-bottom: 1px solid #cbd6c6; }
  .archive-index-heading, .archive-index-footnote { display: none; }
  .archive-projects { display: flex; overflow-x: auto; overflow-y: hidden; gap: 5px; padding: 7px 10px; scrollbar-width: thin; scroll-snap-type: x proximity; }
  .archive-file { min-width: 132px; width: 132px; min-height: 52px; display: flex; gap: 7px; padding: 8px; scroll-snap-align: start; }
  .archive-file-nr { align-self: center; }
  .archive-file-main strong { font-size: 11px; }
  .archive-file-main small { font-size: 9px; }
  .archive-file-arrow { display: none; }
  .archive-story { grid-template-columns: 1fr; gap: 16px; margin-top: 23px; }
  .archive-tech { padding-bottom: 15px; }
  .archive-footer-help > span:not(.archive-key-hint), .archive-key-hint { display: none; }
}
@media (max-width: 560px) {
  .archive-shell { padding: 0; }
  .archive-window { border: 0; border-radius: 0; max-height: none; }
  .archive-topbar { min-height: 53px; padding: 6px 11px; }
  .archive-brand-mark { width: 33px; height: 33px; font-size: 21px; }
  .archive-brand-text strong { font-size: 10px; }
  .archive-brand-text small { font-size: 8px; }
  .archive-status { display: none; }
  .archive-top-actions { gap: 0; }
  .archive-close { min-width: 43px; padding: 0 10px; }
  .archive-close span { display: none; }
  .archive-document { padding: 15px 13px 26px; }
  .archive-hero { min-height: 0; margin: 13px 0 17px; }
  .archive-hero h1 { font-size: clamp(31px, 8vw, 39px); margin: 9px 0; }
  .archive-summary { font-size: 13px; line-height: 1.55; }
  .archive-project-number { font-size: 94px; top: -20px; }
  .archive-facts { gap: 10px 18px; padding: 10px 0; margin-bottom: 14px; }
  .archive-facts > div { min-width: 100px; max-width: 100%; }
  .archive-facts small { font-size: 9px; }
  .archive-facts span { font-size: 11px; }
  .archive-story h2 { font-size: 21px; }
  .archive-story p { font-size: 13px; }
  .archive-footer { min-height: 54px; padding: 5px 10px; }
  .archive-footer-nav { margin-left: auto; }
}
@media (max-height: 630px) {
  .archive-topbar { min-height: 48px; }
  .archive-brand-mark { width: 30px; height: 30px; }
  .archive-file { min-height: 48px; }
  .archive-footer { min-height: 50px; }
}
@media (prefers-reduced-motion: reduce) {
  .archive-window { animation: none; }
  .archive-change-enter-active, .archive-change-leave-active { transition: none; }
  .archive-file { transition: none; }
}
</style>
