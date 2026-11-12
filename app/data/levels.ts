import {timeline,type TimelineEvent} from './timeline'
export type LevelId='about'|'skills'|'work'|'company'|'contact'
export interface JourneyLevel {id:LevelId;title:string;subtitle:string;color:string;entries:TimelineEvent[]}
const cv=(ids:string[])=>ids.map(id=>timeline.find(event=>event.id===id)!)
const skill=(id:string,title:string,summary:string,tags:string[]):TimelineEvent=>({id,category:'skills',label:'SKILLS',title,chapter:'Technical skills',kind:'story',landmark:'studio',accent:'#719baf',summary,body:[summary],tags})
export const levels:JourneyLevel[]=[
 {id:'about',title:'About me',subtitle:'Navarone Ismail · Full-stack developer · Amsterdam',color:'#81946a',entries:cv(['first-lines','panta-rhei','roc-hilversum','coding-college'])},
 {id:'skills',title:'Skills',subtitle:'The tools I build with',color:'#618b9b',entries:[
  skill('skills-backend','Backend','PHP, Laravel, Symfony, Node.js, Java/Spring Boot, C and Lua.',['PHP','Laravel','Symfony','Node.js','Java/Spring Boot','C','Lua']),
  skill('skills-frontend','Frontend','HTML, CSS, JavaScript, TypeScript, Vue, React and React Native.',['HTML','CSS','JavaScript','TypeScript','Vue','React','React Native']),
  skill('skills-infrastructure','Infrastructure','Docker, CI/CD, Git, Kafka, AWS, Google Cloud and DigitalOcean.',['Docker','CI/CD','Git','Kafka','AWS','Google Cloud','DigitalOcean']),
  skill('skills-practice','Approach & tooling','REST, OAuth 2.0, domain-driven design, test-driven development, GitHub, GitLab, Jira and Figma.',['REST','OAuth 2.0','DDD','TDD','GitHub','GitLab','Jira','Figma'])]},
 {id:'work',title:'Work experience',subtitle:'Teams, platforms and technical leadership',color:'#af825e',entries:cv(['fletcher','get-e','appjection'])},
 {id:'company',title:'My company & projects',subtitle:'Navel Development · Client work & Navel Cloud',color:'#9480a6',entries:cv(['navel-development','gmodstore','q-lite','shopify','fifty-five','aquablu','navel-cloud'])},
 {id:'contact',title:'Contact me',subtitle:'Let’s write it together',color:'#b88b69',entries:[{id:'contact',category:'contact',label:'THE NEXT CHAPTER',title:'Let’s write it together.',chapter:'Contact me',kind:'story',landmark:'home',accent:'#c49b76',summary:'Have a project in mind? Get in touch.',body:['I’m a full-stack developer from Amsterdam. I build web applications and the environments they run in.'],tags:[]}]}
]
export const journeyEvents=levels.flatMap(level=>level.entries.map(event=>({...event,level:level.id})))
export const levelForEvent=(index:number)=>levels.find(level=>level.id===journeyEvents[index]?.level) ?? levels[0]!
export const firstInLevel=(id:LevelId)=>journeyEvents.findIndex(event=>event.level===id)
