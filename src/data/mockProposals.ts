import { TopicProposal } from '../types';

export const INITIAL_PROPOSALS: TopicProposal[] = [
  {
    id: 'prop-1',
    title: 'De underjordiske soppnettverkene og "Wood Wide Web"',
    description: 'Hvordan trær deler sukker, næringsstoffer og sender advarsler om parasitter gjennom mykorrhiza-soppnettverk over hele skoger.',
    category: 'Natur & Dypet',
    author: 'Kari M. (Botaniker)',
    votes: 184,
    status: 'avdekket',
    createdAt: '2026-08-28',
    dossier: {
      topic: 'Mykorrhizale skogsnettverk (Wood Wide Web)',
      title: 'Skogens skjulte synapsesystem',
      category: 'Natur & Dypet',
      rarityScore: 92,
      coreFact: 'Modertrær kan gjenkjenne sine egne genetiske avkom i skogen og bevisst kanalisere ekstra karbon og mikronæringsstoffer til dem gjennom sopphyfer.',
      detailedStory: 'Dr. Suzanne Simard ved University of British Columbia utførte radioaktive karbon-14-forsøk som sjokkerte skogbruksverdenen. Hun oppdaget at trær ikke bare konkurrerer om lys, men samarbeider aktivt i et gigantisk underjordisk kooperativ. Døende trær tømmer sine siste energiressurser inn i nettverket til fordel for nabotrær.',
      obscureDetails: [
        'Enkelte parasittiske orkideer kobler seg på nettet som biologiske hackere og stjeler næring uten å gi noe tilbake.',
        'Trær sender kjemiske faresignaler gjennom soppnettet innen minutter etter et insektangrep, slik at nabotrær kan produsere giftige tanniner før insektene ankommer.',
        'Ett enkelt gram skogsjord kan inneholde flere titalls kilometer med sopphyfer.'
      ],
      source: 'Nature: Net transfer of carbon between ectomycorrhizal tree species in the field (Simard et al.)'
    }
  },
  {
    id: 'prop-2',
    title: 'Hullet i Kola: Sovjetunionens reise 12 kilometer ned i jordskorpen',
    description: 'Det dypeste borehullet menneskeheten noensinne har gravd, uventede kokende vannstrømmer og myten om "brølet fra helvete".',
    category: 'Vitenskap',
    author: 'Geolog_Nils',
    votes: 147,
    status: 'under_etterforskning',
    createdAt: '2026-09-01',
  },
  {
    id: 'prop-3',
    title: 'Danseraseriene i Strasbourg 1518',
    description: 'Den bisarre massepsykosen der hundrevis av mennesker danset ukontrollert i ukevis til hjertet sviktet eller føttene blødde.',
    category: 'Historie',
    author: 'ArkivVenn',
    votes: 129,
    status: 'foreslått',
    createdAt: '2026-09-02',
  },
  {
    id: 'prop-4',
    title: 'De hemmelige akustiske speilene langs den engelske kysten',
    description: 'Gigantiske parabolformede betongvegger bygget før oppfinnelsen av radar for å lytte etter lyden av fiendtlige flymotorer over Den engelske kanal.',
    category: 'Glemte Oppfinnelser',
    author: 'LydForskeren',
    votes: 98,
    status: 'foreslått',
    createdAt: '2026-09-03',
  }
];
