import type { TimelineEvent } from './timeline'
export const companySlideIds = [
  'navel-development',
  'gmodstore',
  'q-lite',
  'shopify',
  'fifty-five',
  'aquablu',
  'navel-cloud',
] as const
export function companySlides(timeline: TimelineEvent[]) {
  return companySlideIds.flatMap((id) => {
    const event = timeline.find((event) => event.id === id)
    return event
      ? [
          {
            id,
            title: event.title,
            summary: event.summary,
            body: event.body[0] ?? event.summary,
            tags: event.tags ?? [],
            period: event.period ?? event.label,
          },
        ]
      : []
  })
}
export const COMPUTER_WATCH_OFFSET = -360
export const COMPANY_STORY_DISTANCE = 2200
