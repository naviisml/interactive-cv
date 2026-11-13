import type { TimelineEvent } from '../timeline'
export const dutchEvents: Record<string, Partial<TimelineEvent>> = {
  'first-lines': {
    title: 'Mijn eerste code',
    chapter: 'Waar het begon',
    summary: 'Mezelf leren programmeren, met onder andere een forum voor school.',
    body: [
      'Ik begon met programmeren toen ik elf was. Een van mijn eerste projecten was een schoolforum. Vanaf mijn zestiende bouwde ik webapplicaties voor kleinere bedrijven.',
    ],
  },
  'panta-rhei': {
    chapter: 'Mijn schooltijd',
    role: 'Sport, Dienstverlening & Veiligheid',
    summary: 'Sport, Dienstverlening & Veiligheid aan Scholengemeenschap Panta Rhei.',
    body: [
      'Van 2013 tot 2017 volgde ik Sport, Dienstverlening & Veiligheid aan Scholengemeenschap Panta Rhei in Amstelveen.',
    ],
  },
  'roc-hilversum': {
    chapter: 'Software leren ontwikkelen',
    summary: 'De opleiding Software Developer bij ROC Hilversum.',
    body: ['Van 2017 tot 2018 volgde ik de opleiding Software Developer bij ROC Hilversum.'],
  },
  'coding-college': {
    title: 'Codam Coding College',
    role: 'Software Development',
    chapter: 'Verder in het vak',
    summary: 'Software Development bij Codam in Amsterdam, van 2021 tot 2023.',
    body: ['Van 2021 tot 2023 volgde ik Software Development bij Codam Coding College.'],
  },
  'skills-road': {
    title: 'De tools waarmee ik bouw',
    chapter: 'Vaardigheden',
    summary: 'Technologieën en programmeertalen uit mijn cv, langs de route.',
    body: [],
  },
  'navel-development': {
    chapter: 'Mijn eigen onderneming',
    period: 'Augustus 2016–heden',
    summary: 'Webapplicaties bouwen, systemen verbinden en omgevingen inrichten.',
    body: [
      'Via Navel Development ontwikkel en implementeer ik webapplicaties, REST- en OAuth-API’s en integraties voor opdrachtgevers.',
      'Ik richt omgevingen in met Docker en ontwikkel packages voor Composer en npm. Ook draag ik bij aan opensourceprojecten.',
      'Deze klantopdrachten horen bij Navel Development en lopen naast mijn andere werkervaring.',
    ],
  },
  gmodstore: {
    chapter: 'Games en virtuele werelden',
    period: 'Juli 2019–december 2021',
    location: 'Drammen, Noorwegen',
    summary: 'Lua-plug-ins, spelmechanieken en een winkel voor aankopen in de game.',
    body: [
      'Ik bouwde Lua-plug-ins en spelmechanieken voor verschillende spelmodi.',
      'Daarnaast bouwde ik een website met een winkel voor aankopen in de game en verbeterde ik virtuele economieën om de omzet te verhogen.',
    ],
  },
  'q-lite': {
    chapter: 'Reisinformatie toegankelijk maken',
    period: 'April–mei 2022',
    role: 'C-programmeur',
    summary:
      'Tekst-naar-spraak toevoegen aan reisinformatie voor blinde en slechtziende reizigers.',
    body: [
      'Bij Q-Lite voegde ik tekst-naar-spraak toe aan reisinformatie, zodat blinde en slechtziende reizigers actuele reisberichten konden beluisteren.',
    ],
  },
  shopify: {
    label: 'MEI 2022',
    title: 'Shopify-projecten',
    chapter: 'Webwinkels ontwikkelen',
    period: 'Mei 2022–augustus 2023',
    summary: 'Maatwerk Shopify-thema’s, externe apps en gebruiksvriendelijkere webwinkels.',
    body: [
      'Ik ontwikkelde Shopify-thema’s en integreerde externe applicaties. Ik verbeterde de gebruiksvriendelijkheid van de thema’s om de conversie te ondersteunen.',
    ],
  },
  fletcher: {
    chapter: 'Het platform vernieuwen',
    period: 'Juli 2022–december 2024',
    role: 'Laravel Developer · Lead Laravel Developer vanaf juni 2023',
    summary: 'Bestaande PHP-applicaties opnieuw bouwen met Laravel, Docker en microservices.',
    body: [
      'Bij Fletcher Holdings BV nam ik de technische verantwoordelijkheid voor de modernisering van meerdere bestaande PHP-applicaties. Ik documenteerde hun werking en leidde de herbouw met Laravel, Docker en microservices. Ook bouwde ik een REST-API voor communicatie tussen servers.',
      'Samen met het team bouwde ik Mijn Fletcher opnieuw als centrale gebruikersomgeving met OAuth 2.0 en koppelde ik bestaande applicaties.',
      'Het interne dashboard met rollen en rechten, een restaurantservice en een promotieplatform voor coupons en vouchers gingen in productie.',
      'Vanaf juni 2023 was ik Lead Laravel Developer. Ik besprak wensen met andere afdelingen, hield betrokkenen op de hoogte en maakte afspraken over wat binnen de deadline paste.',
      'Ik hielp collega’s op weg met Laravel. Samen met de teamlead voerde ik technische sollicitatiegesprekken, stelde ik de praktijkopdracht op en beoordeelde ik inzendingen. Mijn beoordeling woog zwaar bij de selectie.',
    ],
  },
  'fifty-five': {
    label: 'MRT 2023',
    chapter: 'Ontwerp en hospitality',
    period: 'Maart–mei 2023',
    role: 'Full Stack Developer & Designer',
    summary:
      'Huisstijl, responsive websites en koppelingen met property-managementsystemen voor hotels.',
    body: [
      'Ik ontwierp logo’s en raamreclame en bouwde responsive websites. Voor hotelwebsites koppelde ik externe property-managementsystemen.',
    ],
  },
  aquablu: {
    chapter: 'Code-audit en technisch advies',
    period: 'Januari 2024',
    role: 'Full Stack Developer · Code-audit en technisch advies',
    summary: 'Onderzoek naar prestaties en onderhoudbaarheid van een Laravel-codebase.',
    body: [
      'Voor Aquablu onderzocht ik welke delen van de Laravel-codebase traag of lastig te onderhouden waren. Ik documenteerde de knelpunten en presenteerde mijn aanbevelingen.',
    ],
  },
  'get-e': {
    chapter: 'Systemen verbinden',
    period: 'Januari–juni 2025',
    summary: 'Een integratie-API en een schaalbaardere, betrouwbaardere B2B-backend.',
    body: [
      'Ik bouwde en onderhield een integratie-API voor een B2B-platform.',
      'Ik verbeterde de prestaties, schaalbaarheid en betrouwbaarheid van de backend en ondersteunde whitelabel-functionaliteit voor meerdere klanten op één platform.',
    ],
  },
  appjection: {
    chapter: 'Architectuur en multitenancy',
    period: 'Juli–december 2025',
    summary: 'Multitenancy ontwerpen en meewerken aan de opvolger van een bestaand platform.',
    body: [
      'Ik droeg bij aan de architectuur van een schaalbare, onderhoudbare opvolger van het bestaande platform.',
      'Ik ontwierp en implementeerde multitenancy voor het B2B-platform en verbeterde backendlogica en integraties om het platform sneller, betrouwbaarder en beter te onderhouden te maken.',
    ],
  },
  'navel-cloud': {
    label: 'EIGEN PRODUCT',
    chapter: 'Mijn eigen platform bouwen',
    role: 'Developer & oprichter',
    summary: 'Mijn SaaS-platform voor websites, content, formulieren en online afspraken.',
    body: [
      'Navel Cloud is mijn SaaS-platform voor websites, content, formulieren en online afspraken. Ik bouw de Laravel-API, het Nuxt-beheerpaneel en de hosting. Resellers kunnen het paneel onder hun eigen merk aanbieden.',
      'Ik scheidde de Laravel-API, achtergrondtaken en websitehosting, zodat ze onafhankelijk kunnen schalen. Elke website draait als een eigen service in Docker Swarm. Traefik stuurt bezoekers naar de juiste website.',
      'Docker-images staan in een eigen registry. MySQL en Valkey draaien als beheerde diensten.',
    ],
  },
  contact: {
    label: 'HET VOLGENDE HOOFDSTUK',
    title: 'Laten we samen verder schrijven.',
    chapter: 'Contact',
    summary: 'Een project in gedachten? Neem contact op.',
    body: [
      'Ik ben een full-stack developer uit Amsterdam. Ik bouw webapplicaties en de omgevingen waarin ze draaien.',
    ],
  },
}
