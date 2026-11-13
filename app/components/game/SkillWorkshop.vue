<script setup lang="ts">
import { ArrowRight, Check, RotateCcw, X, GitBranch, Layers3, ServerCog } from '@lucide/vue'
const props = defineProps<{ initialGroup: number; completed: string[] }>()
const emit = defineEmits<{ close: []; complete: [id: string] }>()
const { locale } = useI18n()
const nl = computed(() => locale.value === 'nl')
const group = ref(Math.max(0, Math.min(2, props.initialGroup)))
const ids = ['tooling', 'web', 'systems'] as const
const titles = [
  { en: 'Tooling / CI pipeline', nl: 'Tooling / CI-pipeline' },
  { en: 'Web / request flow', nl: 'Web / request-flow' },
  { en: 'Systems / worker capacity', nl: 'Systemen / workercapaciteit' },
]
const flowSteps = ['deploy', 'commit', 'build', 'test'] as const
const expected = ['commit', 'test', 'build', 'deploy']
const flow = ref<string[]>([])
const webTasks = [
  { id: 'structure', en: 'Write semantic page structure', nl: 'Schrijf semantische paginastructuur', valid: ['HTML'] },
  { id: 'style', en: 'Create responsive layout rules', nl: 'Maak responsive opmaakregels', valid: ['CSS'] },
  { id: 'api', en: 'Implement an authenticated API', nl: 'Bouw een API met authenticatie', valid: ['Laravel', 'Node.js', 'Spring Boot'] },
]
const technologies = ['Docker', 'HTML', 'Laravel', 'CSS', 'Kafka', 'Vue', 'Node.js', 'Spring Boot']
const answers = ref<Record<string, string>>({})
const workers = ref(3)
const backlog = ref(120)
const tickCount = ref(0)
const feedback = ref('')
const dialog = ref<HTMLElement>()
const selectedId = computed(() => ids[group.value] ?? 'tooling')
const translated = (value: { en: string; nl: string }) => value[nl.value ? 'nl' : 'en']
function showGroup(index: number) {
  group.value = index
  feedback.value = ''
}
function finish() {
  if (!props.completed.includes(selectedId.value)) emit('complete', selectedId.value)
  feedback.value = nl.value ? 'Gelukt. Je hebt deze werkbank voltooid.' : 'Success. You completed this workstation.'
}
function runPipeline() {
  if (flow.value.length !== 4) return
  if (flow.value.every((step, index) => step === expected[index])) finish()
  else feedback.value = nl.value
    ? 'De pipeline heeft een verkeerde volgorde. Commit eerst, test daarna, bouw de image en deploy als laatste.'
    : 'Pipeline order is incorrect. Commit, test, build the image, then deploy.'
}
function runWeb() {
  if (webTasks.every((task) => task.valid.includes(answers.value[task.id] ?? ''))) finish()
  else feedback.value = nl.value
    ? 'Niet elke taak past bij het gekozen gereedschap. Denk aan structuur, styling en backendgedrag.'
    : 'One or more tools do not fit the task. Consider markup, styling and server-side behaviour.'
}
function simulate() {
  backlog.value = Math.max(0, backlog.value + 180 - workers.value * 60)
  tickCount.value += 1
  if (backlog.value === 0) finish()
  else feedback.value = nl.value
    ? 'De wachtrij bevat nog ' + backlog.value + ' jobs. Probeer meer workers en draai de simulatie opnieuw.'
    : 'The queue still has ' + backlog.value + ' jobs. Add capacity and simulate another minute.'
}
function restart() {
  flow.value = []
  answers.value = {}
  workers.value = 3
  backlog.value = 120
  tickCount.value = 0
  feedback.value = ''
}
function key(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const controls = [...dialog.value.querySelectorAll<HTMLElement>('button,input')]
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
onMounted(() => dialog.value?.querySelector<HTMLButtonElement>('.workshop-close')?.focus())
</script>

<template>
  <section
    ref="dialog"
    class="skill-workshop"
    data-world-panel
    role="dialog"
    aria-modal="true"
    aria-labelledby="workshop-heading"
    @keydown="key"
  >
    <div class="workshop-window">
      <header class="workshop-top">
        <div>
          <span class="workshop-overline">{{ nl ? 'VAARDIGHEDEN / SPEELBARE WERKBANKEN' : 'SKILLS / PLAYABLE WORKSTATIONS' }}</span>
          <h2 id="workshop-heading">{{ nl ? 'Bouw iets dat werkt.' : 'Build something that works.' }}</h2>
        </div>
        <button class="workshop-close" :aria-label="nl ? 'Sluiten' : 'Close'" @click="emit('close')"><X :size="23" /></button>
      </header>
      <nav class="workshop-tabs" :aria-label="nl ? 'Werkbanken' : 'Workstations'">
        <button v-for="(item, index) in titles" :key="ids[index]" :aria-pressed="index === group" @click="showGroup(index)">
          <GitBranch v-if="index === 0" :size="19" />
          <Layers3 v-else-if="index === 1" :size="19" />
          <ServerCog v-else :size="19" />
          <span>{{ translated(item) }}</span>
          <Check v-if="completed.includes(ids[index]!)" :size="16" class="completed-icon" />
        </button>
      </nav>
      <div class="workshop-stage">
        <template v-if="group === 0">
          <div class="challenge-head">
            <span>01 / CI + CD</span>
            <h3>{{ nl ? 'Bouw de deployment-pipeline' : 'Assemble the deployment pipeline' }}</h3>
            <p>{{ nl ? 'Je hebt een wijziging klaar. Zet de stappen in de goede volgorde zodat alleen geteste code wordt gedeployed.' : 'A code change is ready. Put the stages in order so only tested code reaches production.' }}</p>
          </div>
          <div class="flow-rack" :aria-label="nl ? 'Jouw pipeline' : 'Your pipeline'">
            <div v-for="index in 4" :key="index" class="flow-slot" :class="{ filled: flow[index - 1] }">
              <span class="slot-number">{{ String(index).padStart(2, '0') }}</span>
              <strong>{{ flow[index - 1] ?? '—' }}</strong>
              <ArrowRight v-if="index < 4" :size="15" />
            </div>
          </div>
          <div class="challenge-options">
            <button v-for="step in flowSteps" :key="step" :disabled="flow.includes(step)" @click="flow.push(step); feedback = ''">
              <span>+</span> {{ step }}
            </button>
          </div>
          <div class="challenge-actions">
            <button class="primary-action" :disabled="flow.length !== 4" @click="runPipeline">{{ nl ? 'Pipeline uitvoeren' : 'Run pipeline' }}</button>
            <button @click="flow = []; feedback = ''">{{ nl ? 'Volgorde wissen' : 'Clear stages' }}</button>
          </div>
        </template>
        <template v-else-if="group === 1">
          <div class="challenge-head">
            <span>02 / REQUEST → RESPONSE</span>
            <h3>{{ nl ? 'Koppel de juiste technologie' : 'Match the technology to the job' }}</h3>
            <p>{{ nl ? 'Een webapp bestaat uit meerdere onderdelen. Kies per opdracht een passende technologie. Voor backendwerk zijn meerdere oplossingen geldig.' : 'A web app has different layers. Pick a suitable technology for each task. More than one backend choice is valid.' }}</p>
          </div>
          <div class="web-tasks">
            <div v-for="(task, index) in webTasks" :key="task.id" class="web-task">
              <div class="task-heading"><small>0{{ index + 1 }}</small><strong>{{ translated(task) }}</strong></div>
              <div class="technology-options">
                <button v-for="tech in technologies" :key="tech" :aria-pressed="answers[task.id] === tech" @click="answers[task.id] = tech; feedback = ''">{{ tech }}</button>
              </div>
            </div>
          </div>
          <div class="challenge-actions">
            <button class="primary-action" :disabled="webTasks.some(task => !answers[task.id])" @click="runWeb">{{ nl ? 'Controleer de architectuur' : 'Validate architecture' }}</button>
            <button @click="answers = {}; feedback = ''">{{ nl ? 'Opnieuw kiezen' : 'Clear choices' }}</button>
          </div>
        </template>
        <template v-else>
          <div class="challenge-head">
            <span>03 / DOCKER + QUEUES</span>
            <h3>{{ nl ? 'Houd de wachtrij onder controle' : 'Keep the job queue healthy' }}</h3>
            <p>{{ nl ? 'Er staan 120 jobs te wachten, en er komen 180 jobs per minuut bij. Iedere worker verwerkt er 60 per minuut. Schaal het aantal workers en simuleer.' : 'There are 120 queued jobs, with 180 new jobs each minute. Each worker handles 60 jobs per minute. Scale the workers and simulate.' }}</p>
          </div>
          <div class="capacity-numbers">
            <div><small>{{ nl ? 'Wachtrij' : 'Queued jobs' }}</small><strong>{{ backlog }}</strong></div>
            <div><small>{{ nl ? 'Instroom / min' : 'Incoming / min' }}</small><strong>180</strong></div>
            <div><small>{{ nl ? 'Capaciteit / min' : 'Capacity / min' }}</small><strong>{{ workers * 60 }}</strong></div>
          </div>
          <div class="capacity-meter"><span :style="{ width: Math.min(100, backlog / 400 * 100) + '%' }" /></div>
          <label class="worker-label" for="worker-capacity">{{ nl ? 'Actieve workers' : 'Active workers' }} <strong>{{ workers }}</strong></label>
          <input id="worker-capacity" v-model.number="workers" type="range" min="1" max="6" step="1" />
          <div class="worker-tiles"><span v-for="index in 6" :key="index" :class="{ 'is-running': index <= workers }" /></div>
          <div class="challenge-actions">
            <button class="primary-action" @click="simulate">{{ nl ? 'Simuleer één minuut' : 'Simulate one minute' }}</button>
            <button @click="restart">{{ nl ? 'Reset simulatie' : 'Reset simulation' }}</button>
            <small>{{ nl ? 'Gesimuleerde minuten' : 'Minutes simulated' }}: {{ tickCount }}</small>
          </div>
        </template>
        <p v-if="feedback" class="challenge-feedback" role="status">{{ feedback }}</p>
      </div>
      <footer>
        <span>{{ nl ? 'Voltooide werkbanken' : 'Workstations completed' }}: {{ completed.length }} / 3</span>
        <button @click="emit('close')">{{ nl ? 'Verder met de reis' : 'Continue the journey' }} <ArrowRight :size="15" /></button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.skill-workshop {
  position: absolute;
  inset: 0;
  z-index: 28;
  display: grid;
  place-items: center;
  padding: 18px;
  overflow: auto;
  user-select: text;
  -webkit-user-select: text;
  touch-action: pan-y;
  background: #152c2be8;
  color: #e9ebd6;
}
.workshop-window { width: min(950px, 100%); max-height: 100%; overflow: auto; background: #233c39; border: 2px solid #9aaf98; box-shadow: 0 20px 75px #0a1f207a; }
.workshop-top { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 25px 19px; border-bottom: 1px solid #56756d; }
.workshop-overline, .challenge-head > span { color: #b9d0ad; font: 10px 'Space Grotesk'; letter-spacing: .14em; }
.workshop-top h2 { font: 500 clamp(22px, 3vw, 32px) 'Space Grotesk'; margin: 7px 0 0; }
.workshop-close { min-width: 44px; min-height: 44px; display: grid; place-items: center; }
.workshop-tabs { display: flex; border-bottom: 1px solid #56756d; background: #1b3531; }
.workshop-tabs button { display: flex; align-items: center; gap: 9px; flex: 1; padding: 13px; min-height: 55px; font: 12px 'Space Grotesk'; border-right: 1px solid #55746a; text-align: left; }
.workshop-tabs button[aria-pressed='true'] { background: #e2e4ce; color: #294b40; }
.completed-icon { margin-left: auto; color: #9fbd76; }
.workshop-tabs button[aria-pressed='true'] .completed-icon { color: #417648; }
.workshop-stage { padding: 26px; min-height: 350px; }
.challenge-head { max-width: 720px; }
.challenge-head h3 { font: 500 clamp(20px, 2.8vw, 28px) 'Space Grotesk'; margin: 8px 0; }
.challenge-head p { color: #c0d1be; font: 13px/1.75 'DM Sans', sans-serif; margin: 0 0 22px; }
.flow-rack { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; }
.flow-slot { position: relative; min-width: 0; min-height: 93px; background: #162f2b; border: 1px dashed #87a38f; padding: 13px; display: flex; flex-direction: column; justify-content: space-between; }
.flow-slot.filled { background: #365b4d; border-style: solid; }
.slot-number { color: #a9bda7; font: 11px 'Space Grotesk'; }
.flow-slot strong { font: 500 clamp(12px, 2vw, 18px) 'Space Grotesk'; text-transform: uppercase; }
.flow-slot > svg { position: absolute; top: 39px; right: -15px; z-index: 1; background: #233c39; border-radius: 50%; }
.challenge-options { display: flex; gap: 9px; flex-wrap: wrap; margin: 19px 0; }
.challenge-options button, .technology-options button { border: 1px solid #91ab92; background: #33564a; color: #f0ebd3; min-height: 41px; padding: 9px 13px; border-radius: 3px; font: 12px 'Space Grotesk'; }
.challenge-options button:disabled { opacity: .35; }
.challenge-options button span { margin-right: 8px; color: #d4d59d; }
.challenge-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 21px; }
.challenge-actions button { min-height: 44px; padding: 10px 15px; font: 12px 'Space Grotesk'; border: 1px solid #819f87; }
.challenge-actions .primary-action { background: #dfe4c7; color: #294e40; font-weight: 600; }
.challenge-actions button:disabled { opacity: .35; }
.challenge-actions small { margin-left: auto; font-size: 11px; color: #bbcab7; }
.web-tasks { display: grid; gap: 13px; }
.web-task { border: 1px solid #678779; background: #1a332e; padding: 15px; }
.task-heading { display: flex; align-items: center; gap: 13px; margin-bottom: 11px; }
.task-heading small { color: #b8cba2; font: 11px 'Space Grotesk'; }
.task-heading strong { font: 500 13px 'Space Grotesk'; }
.technology-options { display: flex; gap: 6px; flex-wrap: wrap; }
.technology-options button { font-size: 11px; padding: 7px 10px; min-height: 34px; }
.technology-options button[aria-pressed='true'] { color: #274837; background: #dce3c4; }
.capacity-numbers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.capacity-numbers > div { background: #1b322f; border: 1px solid #789487; padding: 17px; }
.capacity-numbers small, .capacity-numbers strong { display: block; }
.capacity-numbers small { color: #adc8b6; font-size: 11px; }
.capacity-numbers strong { font: 500 31px 'Space Grotesk'; margin-top: 6px; }
.capacity-meter { height: 16px; background: #456353; margin: 16px 0 20px; }
.capacity-meter span { display: block; height: 100%; background: #e3bc86; transition: width .2s; }
.worker-label { display: flex; gap: 10px; align-items: center; font: 13px 'Space Grotesk'; }
.worker-label strong { margin-left: auto; font-size: 23px; }
input[type='range'] { width: 100%; accent-color: #c8d7a5; margin: 17px 0; }
.worker-tiles { display: flex; gap: 8px; }
.worker-tiles span { height: 20px; flex: 1; background: #334a43; border: 1px solid #658775; }
.worker-tiles .is-running { background: #a7c49c; }
.challenge-feedback { border-left: 3px solid #c7d4a1; background: #1b342d; padding: 13px; margin: 18px 0 0; font: 13px/1.65 'DM Sans'; }
footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 25px; border-top: 1px solid #55736a; gap: 16px; font: 11px 'Space Grotesk'; }
footer button { display: flex; gap: 8px; align-items: center; padding: 9px 14px; background: #dce3ca; color: #294a40; min-height: 42px; }
button:focus-visible,input:focus-visible { outline: 3px solid #e9c781; outline-offset: 2px; }
@media(max-width:700px) {
  .skill-workshop { padding: 6px; }
  .workshop-top,.workshop-stage { padding: 14px; }
  .workshop-tabs button { padding: 10px 5px; justify-content: center; flex-direction: column; gap: 5px; font-size: 10px; text-align: center; }
  .workshop-tabs .completed-icon { display: none; }
  .flow-slot { min-height: 75px; padding: 7px; }
  .flow-slot strong { font-size: 11px; }
  .flow-slot > svg { right: -12px; }
  .capacity-numbers > div { padding: 10px; }
  .capacity-numbers strong { font-size: 23px; }
  footer { padding: 10px; }
}
</style>
