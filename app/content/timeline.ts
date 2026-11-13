import type { FinancialMetadata } from '../game/core/financialSnapshot.ts'
export type EventCategory = 'work' | 'projects' | 'school' | 'skills' | 'contact'
export type TimelineFilter = EventCategory | 'all'
export const categoryNames = {
  work: 'Work',
  projects: 'Projects',
  school: 'School',
  skills: 'Skills',
  contact: 'Contact',
} as const
export const categoryColors = {
  work: '#ae7954',
  projects: '#467f74',
  school: '#667eaa',
  skills: '#618b9b',
  contact: '#b88b69',
} as const
export type Landmark =
  'home' | 'school' | 'studio' | 'arcade' | 'station' | 'shop' | 'hotel' | 'office' | 'cloud'
export interface TimelineEvent {
  category: EventCategory
  id: string
  label: string
  title: string
  chapter: string
  kind: 'milestone' | 'story' | 'project'
  summary: string
  body: string[]
  accent: string
  span?: number
  presentation?: 'tooltip' | 'page' | 'world'
  period?: string
  role?: string
  location?: string
  via?: string
  tags?: string[]
  landmark: Landmark
  /** Public historical financial information, scoped to this event. */
  finance?: FinancialMetadata
}
// Source: CV 2026 — Navarone Ismail, Figma file fRNmeTPW9BxYg11rzeDezV.
// Chronological by starting date. Overlapping study, employment and client work are intentional.
export const timeline: TimelineEvent[] = [
  {
    category: 'projects',
    id: 'first-lines',
    label: '2011',
    title: 'My first code',
    chapter: 'Where it began',
    kind: 'milestone',
    landmark: 'home',
    accent: '#e3c17b',
    summary: 'From Habbo retro servers to understanding PHP and building my first CMS.',
    body: [
      'It started with Habbo. Friends and I wanted to understand how retro servers worked. Initially I changed things using Inspect Element, and later in HTML and CSS files, but PHP was still a mystery.',
      'I studied three existing CMS projects from their entry points, followed their logic and rewrote the code myself to understand it. On RetroNet, we shared what we built. Eventually I developed and sold my own CMS.',
      'We also sold in-game credits purchased by phone or text. Hosting the VPS cost money, so I put the surplus aside rather than spending it.',
    ],
    finance: {
      featured: 'savings',
      debt: 0,
      context: {
        en: 'In the first year, CMS sales and credits generated approximately €700 in revenue against €120 of VPS expenses. €50 in and €10 out per month were broad averages, not a salary or exact annual accounting. I saved the surplus and used my allowance for everyday expenses.',
        nl: 'In het eerste jaar leverden CMS-verkoop en credits ongeveer €700 omzet op, tegenover €120 aan VPS-kosten. €50 inkomsten en €10 uitgaven per maand waren globale gemiddelden, geen salaris of exacte jaarrekening. Ik spaarde het overschot en gebruikte mijn zakgeld voor gewone uitgaven.',
      },
    },
  },
  {
    category: 'school',
    id: 'panta-rhei',
    label: '2013',
    title: 'Panta Rhei',
    chapter: 'School years',
    kind: 'milestone',
    landmark: 'school',
    accent: '#98bda4',
    period: '2013–2017',
    location: 'Amstelveen',
    role: 'Sport, Services & Safety',
    summary: 'Studying Sport, Services & Safety at Scholengemeenschap Panta Rhei.',
    body: [
      'From 2013 to 2017, I attended Scholengemeenschap Panta Rhei in Amstelveen, studying Sport, Dienstverlening & Veiligheid.',
    ],
  },
  {
    category: 'work',
    id: 'navel-development',
    span: 1900,
    presentation: 'world',
    label: 'AUG 2016',
    title: 'Navel Development',
    chapter: 'My own company',
    kind: 'project',
    landmark: 'studio',
    accent: '#d2ab8c',
    period: 'August 2016–present',
    role: 'Full Stack Developer',
    location: 'Amsterdam',
    summary:
      'Building applications, connecting systems, and deploying the environments they run in.',
    body: [
      'Through Navel Development, I build single-page applications with Vue.js and Laravel and connect systems through REST and OAuth APIs.',
      'I set up LAMP and WAMP environments and deploy applications with Git and Docker. I also develop Composer and npm packages and contribute to open-source projects.',
      'The client assignments later in this journey belong to Navel Development. They run alongside my other experience, rather than representing separate employers.',
    ],
    tags: [
      'Laravel',
      'Symfony',
      'Vue.js',
      'JavaScript',
      'TypeScript',
      'React Native',
      'Docker',
      'CI/CD',
    ],
  },
  {
    category: 'school',
    id: 'roc-hilversum',
    label: '2017',
    title: 'ROC Hilversum',
    chapter: 'Studying software',
    kind: 'milestone',
    landmark: 'school',
    accent: '#a8c1bc',
    period: '2017–2018',
    role: 'Software Developer',
    location: 'Hilversum',
    summary: 'Software Developer studies at ROC Hilversum.',
    body: ['I studied Software Development at ROC Hilversum from 2017 to 2018.'],
  },
  {
    category: 'projects',
    id: 'gmodstore',
    label: 'JUL 2019',
    title: 'GmodStore',
    chapter: 'Games & virtual worlds',
    kind: 'project',
    landmark: 'arcade',
    accent: '#c5b0db',
    period: 'July 2019–December 2021',
    role: 'Full Stack & Lua Developer',
    location: 'Drammen, Norway',
    via: 'Navel Development',
    summary: 'Lua plug-ins, game mechanics, and a storefront for in-game purchases.',
    body: [
      'I built Lua plug-ins and game mechanics for different game modes.',
      'I also built a website with a store for in-game purchases and improved virtual economies to increase revenue.',
    ],
    tags: ['Lua', 'Full-stack development', 'Game mechanics', 'Virtual economies'],
  },
  {
    category: 'school',
    id: 'coding-college',
    label: '2021',
    title: 'Codam Coding College',
    chapter: 'Deepening the craft',
    kind: 'milestone',
    landmark: 'school',
    accent: '#a9bfa0',
    period: '2021–2023',
    role: 'Software Development',
    location: 'Amsterdam',
    summary: 'Software Developer studies at Codam Coding College.',
    body: ['From 2021 to 2023, I studied Software Development at Codam Coding College.'],
  },
  {
    category: 'projects',
    id: 'q-lite',
    label: 'APR 2022',
    title: 'Q-Lite',
    chapter: 'Making information accessible',
    kind: 'project',
    landmark: 'station',
    accent: '#b6c9a0',
    period: 'April–May 2022',
    role: 'C Programmer',
    location: 'Alblasserdam',
    via: 'Navel Development',
    summary:
      'Adding text-to-speech to travel information for blind and partially sighted passengers.',
    body: [
      'At Q-Lite, I added text-to-speech to travel information so that blind and partially sighted passengers could listen to current travel updates.',
    ],
    tags: ['C', 'Text-to-speech', 'Accessibility'],
  },
  {
    category: 'projects',
    id: 'shopify',
    label: 'MAY 2022',
    title: 'Shopify projects',
    chapter: 'Building storefronts',
    kind: 'project',
    landmark: 'shop',
    accent: '#c8b08b',
    period: 'May 2022–August 2023',
    role: 'Front-End Developer',
    location: 'Amsterdam',
    via: 'Navel Development',
    summary: 'Custom Shopify themes, third-party apps, and more usable online shops.',
    body: [
      'I built Shopify themes for online shops and integrated third-party applications. I improved the usability of the themes to support better conversion.',
    ],
    tags: ['Shopify', 'Theme development', 'Third-party integrations', 'Frontend'],
  },
  {
    category: 'work',
    id: 'fletcher',
    label: 'JUL 2022',
    title: 'Fletcher Holdings BV',
    chapter: 'Modernising the platform',
    kind: 'story',
    landmark: 'hotel',
    accent: '#9db9cd',
    period: 'July 2022–December 2024',
    role: 'Laravel Developer · Lead Laravel Developer from June 2023',
    location: 'Nieuwegein',
    summary: 'Rebuilding existing PHP applications with Laravel, Docker, and microservices.',
    body: [
      'At Fletcher Holdings BV, I took technical responsibility for modernising several existing PHP applications. I documented how they worked and led their rebuild with Laravel, Docker, and microservices. I built a REST API for communication between servers.',
      'With the team, I rebuilt Mijn Fletcher into a central user-management environment based on OAuth 2.0 and connected the existing applications to it.',
      'The internal dashboard with roles and permissions, a restaurant service managed through that dashboard, and a promotions platform for coupons and vouchers went into production.',
      'From June 2023, I was Lead Laravel Developer. I discussed requirements with other departments, kept stakeholders informed, and agreed which new requests could fit within the deadline.',
      'I helped colleagues get started with Laravel. Together with the team lead, I conducted technical interviews, created the practical assignment, and reviewed submissions with colleagues. My assessment carried significant weight in hiring decisions.',
    ],
    tags: ['Laravel', 'Docker', 'Microservices', 'OAuth 2.0', 'REST API'],
  },
  {
    category: 'projects',
    id: 'fifty-five',
    label: 'MAR 2023',
    title: 'Fifty Five',
    chapter: 'Design meets hospitality',
    kind: 'project',
    landmark: 'hotel',
    accent: '#d6ad91',
    period: 'March–May 2023',
    role: 'Full Stack Developer & Designer',
    location: 'Amsterdam',
    via: 'Navel Development',
    summary: 'Brand design, responsive websites, and hotel property-management integrations.',
    body: [
      'I designed logos and window graphics and built responsive websites. For the hotel websites, I connected external property-management systems.',
    ],
    tags: ['Full-stack development', 'Design', 'Responsive websites', 'Property management'],
  },
  {
    category: 'projects',
    id: 'aquablu',
    label: 'JAN 2024',
    title: 'Aquablu',
    chapter: 'Code audit & technical advice',
    kind: 'project',
    landmark: 'office',
    accent: '#92bec4',
    period: 'January 2024',
    role: 'Full Stack Developer · Code audit & technical advice',
    location: 'Amsterdam',
    via: 'Navel Development',
    summary: 'Investigating performance and maintainability in a Laravel codebase.',
    body: [
      'For Aquablu, I investigated which parts of the Laravel codebase were slow or difficult to maintain. I documented the bottlenecks and presented my recommendations.',
    ],
    tags: ['Laravel', 'Code audit', 'Performance', 'Technical advice'],
  },
  {
    category: 'work',
    id: 'get-e',
    label: 'JAN 2025',
    title: 'Get-E',
    chapter: 'Connecting systems',
    kind: 'story',
    landmark: 'station',
    accent: '#b3b6d2',
    period: 'January–June 2025',
    role: 'Senior Back End Developer',
    location: 'Hoofddorp',
    summary: 'An integration API and a more scalable, reliable B2B backend.',
    body: [
      'I built and maintained an integration API for a B2B platform.',
      'I improved backend performance, scalability, and reliability, and supported whitelabel functionality for multiple customers on one platform.',
    ],
    tags: ['Laravel', 'Java/Spring Boot', 'TypeScript', 'Kafka', 'AWS', 'Docker', 'DDD', 'TDD'],
  },
  {
    category: 'work',
    id: 'appjection',
    label: 'JUL 2025',
    title: 'Appjection',
    chapter: 'Architecture & multitenancy',
    kind: 'story',
    landmark: 'office',
    accent: '#c4b7d1',
    period: 'July–December 2025',
    role: 'Senior Back End Developer',
    location: 'Amsterdam',
    summary: 'Designing multitenancy and helping shape the successor to an existing platform.',
    body: [
      'I contributed to the architecture of a scalable, maintainable successor to the existing platform.',
      'I designed and implemented multitenancy for the B2B platform and improved backend logic and integrations to make the platform faster, more reliable, and easier to maintain.',
    ],
    tags: ['Laravel', 'Docker', 'Google Cloud', 'Test-driven development'],
  },
  {
    category: 'projects',
    id: 'navel-cloud',
    label: 'OWN PRODUCT',
    title: 'Navel Cloud',
    chapter: 'Building my own platform',
    kind: 'project',
    landmark: 'cloud',
    accent: '#c5b0db',
    role: 'Developer & Founder',
    summary: 'My SaaS platform for websites, content, forms, and online appointments.',
    body: [
      'Navel Cloud is my SaaS platform for websites, content, forms, and online appointments. I build the Laravel API, the Nuxt management panel, and the hosting. Resellers can offer the panel under their own brand.',
      'I separated the Laravel API, background jobs, and website hosting so they can scale independently. Each site runs as its own service in Docker Swarm, and Traefik routes visitors to the correct site.',
      'Docker images are stored in a private registry. MySQL and Valkey run as managed services.',
    ],
    tags: ['Laravel', 'Nuxt', 'Docker Swarm', 'Traefik', 'MySQL', 'Valkey', 'Private registry'],
  },
]
export const EVENT_SPACING = 920
export const FIRST_EVENT_X = 780
export const eventX = (index: number) => FIRST_EVENT_X + index * EVENT_SPACING
export const WORLD_WIDTH = eventX(timeline.length - 1) + 750

export const isBriefEvent = (event: TimelineEvent) =>
  event.presentation === 'tooltip' || event.kind === 'milestone'

export const filteredIndexes = (filter: TimelineFilter) =>
  timeline.flatMap((event, index) => (filter === 'all' || event.category === filter ? [index] : []))

export function storyParagraphs(event: TimelineEvent) {
  return [...new Set(event.body.map((text) => text.trim()))].filter(
    (text) => text && text !== event.summary.trim(),
  )
}

export const hasDetails = (event: TimelineEvent) =>
  !isBriefEvent(event) &&
  event.category !== 'skills' &&
  event.presentation !== 'world' &&
  event.category !== 'contact'
