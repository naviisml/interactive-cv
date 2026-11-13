export interface SkillLogo {
  id: string
  name: string
  asset: string
  group: 'technology' | 'language'
  width: number
  height: number
}
// Assets exported from Figma LMifGg6w0DY0Sx3Hbm97ZQ, node 110:704.
export const skillLogos: SkillLogo[] = [
  {
    id: 'docker',
    name: 'Docker',
    asset: '/skills/docker.png',
    group: 'technology',
    width: 40,
    height: 40,
  },
  {
    id: 'github',
    name: 'GitHub',
    asset: '/skills/github.png',
    group: 'technology',
    width: 30,
    height: 30,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    asset: '/skills/gitlab.png',
    group: 'technology',
    width: 30,
    height: 28.886,
  },
  {
    id: 'figma',
    name: 'Figma',
    asset: '/skills/figma.svg',
    group: 'technology',
    width: 20,
    height: 30,
  },
  {
    id: 'jira',
    name: 'Jira',
    asset: '/skills/jira.png',
    group: 'technology',
    width: 30,
    height: 30,
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    asset: '/skills/digitalocean.png',
    group: 'technology',
    width: 30,
    height: 30,
  },
  {
    id: 'kafka',
    name: 'Kafka',
    asset: '/skills/kafka.png',
    group: 'technology',
    width: 30,
    height: 30,
  },
  { id: 'html', name: 'HTML', asset: '/skills/html.svg', group: 'language', width: 21, height: 30 },
  { id: 'css', name: 'CSS', asset: '/skills/css.svg', group: 'language', width: 21, height: 30 },
  {
    id: 'php',
    name: 'PHP',
    asset: '/skills/php.png',
    group: 'language',
    width: 30,
    height: 16.207,
  },
  {
    id: 'laravel',
    name: 'Laravel',
    asset: '/skills/laravel.png',
    group: 'language',
    width: 30,
    height: 31.204,
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    asset: '/skills/nodejs.png',
    group: 'language',
    width: 40,
    height: 24.469,
  },
  {
    id: 'vue',
    name: 'Vue',
    asset: '/skills/vue.png',
    group: 'language',
    width: 30,
    height: 25.995,
  },
  {
    id: 'react',
    name: 'React / React Native',
    asset: '/skills/react.png',
    group: 'language',
    width: 30,
    height: 30,
  },
  {
    id: 'symfony',
    name: 'Symfony',
    asset: '/skills/symfony.png',
    group: 'language',
    width: 30,
    height: 30,
  },
  { id: 'c', name: 'C', asset: '/skills/c.png', group: 'language', width: 30, height: 33.157 },
  { id: 'lua', name: 'Lua', asset: '/skills/lua.png', group: 'language', width: 30, height: 30 },
  {
    id: 'spring',
    name: 'Spring Boot',
    asset: '/skills/spring.png',
    group: 'language',
    width: 30,
    height: 30,
  },
]
export const SKILL_ROAD_SPAN = 1580

export const skillGroups = [
  {
    id: 'tooling',
    title: { en: 'Tooling', nl: 'Tooling' },
    ids: ['docker', 'github', 'gitlab', 'figma', 'jira'],
  },
  {
    id: 'web',
    title: { en: 'Web development', nl: 'Webontwikkeling' },
    ids: ['html', 'css', 'php', 'laravel', 'nodejs', 'vue', 'react', 'symfony'],
  },
  {
    id: 'systems',
    title: { en: 'Systems & cloud', nl: 'Systemen & cloud' },
    ids: ['digitalocean', 'kafka', 'c', 'lua', 'spring'],
  },
] as const
