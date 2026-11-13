import { skillLogos, SKILL_ROAD_SPAN } from './skills.ts'
import { timeline, type TimelineEvent } from './timeline.ts'
export type LevelId = 'about' | 'skills' | 'work' | 'company' | 'contact'
export interface JourneyLevel {
  id: LevelId
  title: string
  subtitle: string
  color: string
  entries: TimelineEvent[]
}
const cv = (ids: string[]) => ids.map((id) => timeline.find((event) => event.id === id)!)
export const levels: JourneyLevel[] = [
  {
    id: 'about',
    title: 'About me',
    subtitle: 'Navarone Ismail · Full-stack developer · Amsterdam',
    color: '#81946a',
    entries: cv(['first-lines', 'panta-rhei', 'roc-hilversum', 'coding-college']),
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'The tools I build with',
    color: '#618b9b',
    entries: [
      {
        id: 'skills-road',
        category: 'skills',
        label: 'SKILLS',
        title: 'The tools I build with',
        chapter: 'Skills',
        kind: 'story',
        landmark: 'studio',
        accent: '#618b9b',
        presentation: 'world',
        span: SKILL_ROAD_SPAN,
        summary: 'Technologies and languages from my CV, along the road.',
        body: [],
        tags: skillLogos.map((logo) => logo.name),
      },
    ],
  },
  {
    id: 'work',
    title: 'Work experience',
    subtitle: 'Teams, platforms and technical leadership',
    color: '#af825e',
    entries: cv(['fletcher', 'get-e', 'appjection']),
  },
  {
    id: 'company',
    title: 'My company & projects',
    subtitle: 'Navel Development · Client work & Navel Cloud',
    color: '#9480a6',
    entries: cv(['navel-development']),
  },
  {
    id: 'contact',
    title: 'Contact me',
    subtitle: 'Let’s write it together',
    color: '#b88b69',
    entries: [
      {
        id: 'contact',
        category: 'contact',
        label: 'THE NEXT CHAPTER',
        title: 'Let’s write it together.',
        chapter: 'Contact me',
        kind: 'story',
        landmark: 'home',
        accent: '#c49b76',
        summary: 'Have a project in mind? Get in touch.',
        body: [
          'I’m a full-stack developer from Amsterdam. I build web applications and the environments they run in.',
        ],
        tags: [],
      },
    ],
  },
]
export const journeyEvents = levels.flatMap((level) =>
  level.entries.map((event) => ({
    ...event,
    span: event.category === 'school' ? 1280 : level.id === 'work' ? 1500 : event.span,
    level: level.id,
  })),
)
export const levelForEvent = (index: number) =>
  levels.find((level) => level.id === journeyEvents[index]?.level) ?? levels[0]!
export const firstInLevel = (id: LevelId) => journeyEvents.findIndex((event) => event.level === id)
