<script setup lang="ts">
import { countryNames, helpText } from '~/content/locales/finance-nl'
import data from '~/content/finance-support.json'
import type { TimelineEvent } from '~/content/timeline'
import { financialSnapshot } from '~/game/core/financialSnapshot'
const { t, locale } = useI18n()
const props = defineProps<{ index: number; events: readonly TimelineEvent[]; contextTitle?: string }>()
const emit = defineEmits<{ toggle: [open: boolean] }>()
const dialog = ref<HTMLDialogElement>()
const selectedCountry = ref('NL')
const countries = data.countries as Record<
  string,
  { name: string; resources: { name: string; description: string; url: string }[] }
>
const support = computed(() => displayCountries.value[selectedCountry.value])
const displayCountries = computed(() =>
  Object.fromEntries(
    Object.entries(countries).map(([code, country]) => [
      code,
      locale.value === 'nl'
        ? {
            ...country,
            name: countryNames[code] ?? country.name,
            resources: country.resources.map((resource, i) => ({
              ...resource,
              ...helpText[code]?.[i],
            })),
          }
        : country,
    ]),
  ),
)
const snapshot = computed(() =>
  financialSnapshot(props.events, props.index),
)
const eventContext = computed(() => {
  const text = props.events[props.index]?.finance?.context
  return text?.[locale.value === 'nl' ? 'nl' : 'en'] ?? ''
})
const featuredLabel = computed(() =>
  t(snapshot.value.featured === 'savings' ? 'finance.savings' : 'finance.debt'),
)
function amount(value: number | null) {
  return value === null
    ? t('finance.notShared')
    : new Intl.NumberFormat(locale.value === 'nl' ? 'nl-NL' : 'en-IE', {
        style: 'currency',
        currency: data.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)
}
const featuredAmount = computed(() => amount(snapshot.value[snapshot.value.featured]))
const incomeLabel = computed(() =>
  snapshot.value.yearlyIncome
    ? `${snapshot.value.yearlyIncome.year} · ${t('finance.' + snapshot.value.yearlyIncome.basis)}`
    : t('finance.income'),
)
function open() {
  dialog.value?.showModal()
  emit('toggle', true)
}
function close() {
  dialog.value?.close()
}
function closed() {
  emit('toggle', false)
}
function changed() {
  try {
    localStorage.setItem('debt-help-country', selectedCountry.value)
  } catch {}
}
onMounted(() => {
  try {
    const saved = localStorage.getItem('debt-help-country')
    if (saved && (saved === 'OTHER' || countries[saved])) {
      selectedCountry.value = saved
      return
    }
    const region = new Intl.Locale(navigator.language).region
    if (region && countries[region]) selectedCountry.value = region
  } catch {}
})
onBeforeUnmount(() => {
  if (dialog.value?.open) {
    dialog.value.close()
    emit('toggle', false)
  }
})
</script>
<template>
  <div class="money-counter">
    <div class="debt-balance">
      <span>{{ featuredLabel }}</span><strong>{{ featuredAmount }}</strong>
    </div>
    <div class="debt-balance">
      <span>{{ incomeLabel }}</span><strong>{{
        amount(snapshot.yearlyIncome?.amount ?? null)
      }}</strong>
    </div>
    <button
      class="debt-info-button"
      :aria-label="t('finance.about')"
      aria-haspopup="dialog"
      @click="open"
    >
      i
    </button>
    <ClientOnly
      ><Teleport to="body">
        <dialog
          ref="dialog"
          class="debt-dialog"
          aria-labelledby="debt-title"
          @close="closed"
          @click="$event.target === dialog && close()"
        >
          <header>
            <span class="eyebrow">{{ t('finance.eyebrow') }}</span><button
              :aria-label="t('finance.close')"
              @click="close"
            >
              ×
            </button>
          </header>
          <h2 id="debt-title">{{ t('finance.title') }}</h2>
          <p>{{ t('finance.intro') }}</p>
          <div class="debt-chapter">
            <span>{{ contextTitle || events[index]?.title }}</span>
            <dl>
              <div>
                <dt>{{ t('finance.debt') }}</dt>
                <dd>{{ amount(snapshot.debt) }}</dd>
              </div>
              <div>
                <dt>{{ t('finance.savings') }}</dt>
                <dd>{{ amount(snapshot.savings) }}</dd>
              </div>
              <div>
                <dt>{{ incomeLabel }}</dt>
                <dd>{{ amount(snapshot.yearlyIncome?.amount ?? null) }}</dd>
              </div>
            </dl>
          </div>
          <p v-if="eventContext" class="debt-context">{{ eventContext }}</p>
          <h3>{{ t('finance.support') }}</h3>
          <p class="debt-support-intro">{{ t('finance.supportIntro') }}</p>
          <label for="debt-country">{{ t('finance.helpIn') }}</label>
          <select id="debt-country" v-model="selectedCountry" @change="changed">
            <option v-for="(country, code) in displayCountries" :key="code" :value="code">
              {{ country.name }}
            </option>
            <option value="OTHER">{{ t('finance.other') }}</option>
          </select>
          <div v-if="support" class="debt-resources">
            <a
              v-for="resource in support.resources"
              :key="resource.url"
              :href="resource.url"
              target="_blank"
              rel="noopener noreferrer"
              ><strong>{{ resource.name }} <span>↗</span></strong>
              <p>{{ resource.description }}</p></a
            >
          </div>
          <p v-else class="debt-fallback">{{ t('finance.fallback') }}</p>
          <p class="debt-footnote">{{ t('finance.footnote') }}</p>
        </dialog>
      </Teleport></ClientOnly
    >
  </div>
</template>
<style scoped>
.money-counter {
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 1px solid #cbd2c3;
  padding-left: 18px;
  min-width: 250px;
}
.debt-balance {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.debt-balance > span {
  text-transform: uppercase;
  font: 600 9px 'Space Grotesk', sans-serif;
  letter-spacing: 1px;
  color: #52685c;
}
.debt-balance strong {
  font: 600 14px 'Space Grotesk', sans-serif;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.debt-info-button {
  display: grid;
  place-items: center;
  font:
    italic 12px Georgia,
    serif;
  width: 30px;
  height: 30px;
  border: 1px solid #8c9f8c;
  border-radius: 50%;
  background: #f8f8ef;
  padding: 0;
  flex-shrink: 0;
}
.debt-info-button:hover { background: #e5ecdb; }
.debt-dialog {
  border: 1px solid #a5b295;
  border-radius: 8px;
  background: #f4f1e7;
  color: #2d4d43;
  width: min(580px, calc(100% - 28px));
  max-height: 85svh;
  padding: 26px 30px;
  overscroll-behavior: contain;
  box-shadow: 0 20px 100px #142e3c33;
}
.debt-dialog::backdrop {
  background: #142e3cc4;
}
.debt-dialog header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.debt-dialog header button {
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  font-size: 28px;
  border-radius: 5px;
}
.debt-dialog h2 {
  font: 500 31px/1.15 'Space Grotesk';
  letter-spacing: -1px;
  margin: 19px 0;
}
.debt-dialog > p {
  font-size: 14px;
  line-height: 1.75;
  color: #405f4e;
}
.debt-dialog h3 {
  font: 500 19px 'Space Grotesk';
  margin: 26px 0 10px;
}
.debt-chapter {
  padding: 16px 0;
  border-top: 1px solid #c9cfbb;
  border-bottom: 1px solid #c9cfbb;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 22px;
}
.debt-context {
  font-size: 12px;
  line-height: 1.8;
  color: #425f4e;
  margin: 14px 0 0;
}
.debt-chapter > span {
  font-size: 12px;
}
.debt-chapter dl {
  margin: 0;
  display: grid;
  gap: 9px;
}
.debt-chapter dl > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.debt-chapter dt {
  font-size: 12px;
  color: #526b57;
}
.debt-chapter dd {
  margin: 0;
  font: 500 15px 'Space Grotesk';
}
.debt-chapter strong {
  font: 500 17px 'Space Grotesk';
  font-variant-numeric: tabular-nums;
}
.debt-chapter small {
  grid-column: 1/-1;
  font-size: 11px;
  color: #7c8771;
}
.debt-dialog label {
  display: block;
  font-size: 11px;
  margin: 20px 0 8px;
}
.debt-dialog select {
  font:
    12px 'DM Sans',
    sans-serif;
  width: 100%;
  padding: 10px;
  border: 1px solid #a4b193;
  background: #f9f7f0;
  color: #365541;
  border-radius: 0;
}
.debt-resources {
  display: grid;
  margin-top: 12px;
}
.debt-resources a {
  padding: 15px 0;
  border-bottom: 1px solid #d0d5c4;
}
.debt-resources strong {
  font: 500 13px 'Space Grotesk';
  display: flex;
  justify-content: space-between;
}
.debt-resources p {
  font-size: 12px;
  line-height: 1.7;
  margin: 6px 0 0;
  color: #4e6957;
}
.debt-dialog .debt-footnote {
  font-size: 11px;
  line-height: 1.7;
  margin-top: 24px;
  color: #59705c;
}
@media (max-width: 700px) {
  .money-counter {
    grid-column: 1/-1;
    grid-row: 2;
    min-width: 0;
    width: 100%;
    padding: 10px 0 0;
    gap: 24px;
    border-left: 0;
    border-top: 1px solid #d2d6c5;
  }
  .debt-info-button {
    margin-left: auto;
  }
  .debt-balance strong {
    font-size: 12px;
  }
  .debt-info-button {
    width: 30px;
    height: 30px;
  }
  .debt-dialog {
    padding: 20px;
  }
  .debt-dialog h2 {
    font-size: 27px;
  }
}
</style>
