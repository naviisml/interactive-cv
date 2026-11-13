import { timeline as source, type TimelineEvent } from '~/content/timeline'
import { journeyEvents } from '~/content/journey'
import { dutchEvents } from '~/content/locales/nl'
export function usePortfolioContent() {
  const { locale } = useI18n()
  const localize = (event: TimelineEvent) =>
    locale.value === 'nl' ? { ...event, ...dutchEvents[event.id] } : event
  const timeline = computed(() =>
    journeyEvents.map((event) => ({ ...localize(event), level: event.level })),
  )
  const cvTimeline = computed(() => source.map(localize))
  return { timeline, cvTimeline, localize }
}
