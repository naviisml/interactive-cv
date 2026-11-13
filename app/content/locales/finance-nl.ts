export const countryNames: Record<string, string> = {
  NL: 'Nederland',
  BE: 'België · Vlaanderen',
  DE: 'Duitsland',
  GB: 'Verenigd Koninkrijk',
  US: 'Verenigde Staten',
}
export const helpText: Record<string, { name?: string; description: string }[]> = {
  NL: [
    {
      name: 'Je gemeente',
      description: 'Je gemeente kan je adviseren over geldzorgen en schuldhulpverlening.',
    },
    { description: 'Gratis en anonieme hulp bij geldzorgen en het vinden van hulp in de buurt.' },
    {
      description:
        'Juridische informatie over schulden en incasso. Voor persoonlijk advies gelden voorwaarden.',
    },
  ],
  BE: [
    {
      name: 'Je lokale OCMW of CAW',
      description: 'Informatie over erkende schuldbemiddeling in Vlaanderen.',
    },
    {
      name: 'Vind schuldhulpverlening',
      description: 'Overzicht van diensten voor schuldbemiddeling van de Vlaamse overheid.',
    },
  ],
  DE: [
    {
      name: 'Vind een Schuldnerberatung',
      description: 'Zoek een adviescentrum voor schulden. Vraag vooraf of het advies gratis is.',
    },
  ],
  GB: [
    {
      description: 'Vind gratis en vertrouwelijk schuldadvies online, telefonisch of in de buurt.',
    },
    { description: 'Gratis en onafhankelijk advies van een organisatie voor schuldhulp.' },
  ],
  US: [
    { description: 'Informatie over betrouwbare kredietadviseurs, schuldregelingen en kosten.' },
  ],
}
