import { QuizQuestion } from '../types';

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz-1',
    category: 'Kunst & Kultur',
    difficulty: 'Ekstremt obskur',
    question: 'Hvilken farge hadde de klassiske greske og romerske marmorstatuene opprinnelig?',
    options: [
      'De var aldri malt, kun polert hvit marmor',
      'De var malt i intense, skarpe primærfarger og mønstre',
      'De ble utelukkende forgylt med bladgull',
      'De ble innsatt med kvae for å se ut som brent leire'
    ],
    correctAnswerIndex: 1,
    explanation: 'Antikkens statuer og templer var malt i overdådige, nesten psykedeliske farger (polykromi). UV-analyser og røntgenfluorescens (XRF) har avdekket mikroskopiske spor av sinober, azuritt og malakitt. Forestillingen om ren hvit marmor oppsto i renessansen da statuene ble gravd opp etter at fargene hadde forvitret.',
    bonusDidYouKnow: 'Tyske arkeologen Vinzenz Brinkmann har gjenskapt nøyaktige gipskopier i full fargeprakt som sjokkerer museumbesøkere over hele verden.'
  },
  {
    id: 'quiz-2',
    category: 'Vitenskap',
    difficulty: 'Sjelden',
    question: 'Hva var den uventede opprinnelsen til verdens første programmerbare vevstol (Jacquard-veven) som inspirerte moderne datamaskiner?',
    options: [
      'Den brukte hullkort av papp for å styre vevmønsteret automatisk',
      'Den ble drevet av en hemmelig dampkondensator i Lyon',
      'Den brukte metallkjeder med bittesmå magneter',
      'Den leste lysstråler gjennom farget glass'
    ],
    correctAnswerIndex: 0,
    explanation: 'Joseph Marie Jacquard patenterte i 1804 en vevstol styrt av utstansede hullkort. Ada Lovelace og Charles Babbage hentet direkte inspirasjon fra dette da de designet The Analytical Engine, verdens første mekaniske datamaskin.',
    bonusDidYouKnow: 'Lovelace bemerket berømt: "The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves."'
  },
  {
    id: 'quiz-3',
    category: 'Historie',
    difficulty: 'Arkivmester',
    question: 'Hvorfor ble Napoleon Bonaparte aldri formelt henrettet etter nederlaget ved Waterloo i 1815?',
    options: [
      'Han betalte en hemmelig løsesum i gull til Det britiske ostindiske kompani',
      'Britene fryktet å gjøre ham til en martyr og forviste ham til en utilgjengelig vulkansk øy',
      'Tsar Aleksander I av Russland nedla veto mot henrettelse',
      'Ludvig XVIII ønsket å holde ham i live for personlig hevn'
    ],
    correctAnswerIndex: 1,
    explanation: 'Storbritannia og de allierte fryktet at en henrettelse ville antenne nye revolusjoner i Frankrike og Europa. Løsningen ble Saint Helena, en forblåst øy 1900 km vest for det sørvestlige Afrika, overvåket av krigsskip døgnet rundt.',
    bonusDidYouKnow: 'Napoleons tapet i Longwood House på Saint Helena inneholdt Scheele-grønt, et pigment med kobberarsenitt, som enkelte forskere mener kan ha bidratt til hans død.'
  },
  {
    id: 'quiz-4',
    category: 'Natur & Dypet',
    difficulty: 'Sjelden',
    question: 'Hvilken sans bruker nebbdyret under vann når det lukker øyne, ører og nese mens det jakter?',
    options: [
      'Ekkolokalisering med ultralyd',
      'Elektroresepsjon via 40 000 sensorer i nebbet',
      'Infrarød varmesans',
      'Magnetisk kompassfølelse i tungen'
    ],
    correctAnswerIndex: 1,
    explanation: 'Nebbdyrets myke nebb har titusenvis av reseptorer som oppfatter de ørsmå elektriske impulsene som genereres av muskelbevegelsene til reker og krepsdyr på elvebunnen.',
    bonusDidYouKnow: 'Hann-nebbdyret har i tillegg en giftspore på bakbena med en gift som forårsaker smerter så intense at morfin har liten effekt.'
  },
  {
    id: 'quiz-5',
    category: 'Glemte Oppfinnelser',
    difficulty: 'Ekstremt obskur',
    question: 'Hva var formålet med "Pykrete", det hemmelige allierte materialet testet under 2. verdenskrig?',
    options: [
      'Å bygge et usenkelig 600 meter langt hangarskip laget av frossen treflis og is',
      'Å lage skuddsikre hjelmer av presset cellulose',
      'Å produsere syntetisk gummi fra melk',
      'Å kamuflere radarstasjoner med reflekterende krystaller'
    ],
    correctAnswerIndex: 0,
    explanation: 'Prosjekt Habakkuk var den britiske oppfinneren Geoffrey Pykes plan om å bygge gigantiske hangarskip av 14% tremasse og 86% vann frosset sammen. Materialet var seigt, smeltet forbløffende langsomt og stoppet kuler bedre enn stålplater.',
    bonusDidYouKnow: 'Lord Mountbatten demonstrerte materialets styrke under Quebec-konferansen i 1943 ved å skyte på en Pykrete-blokk med revolver foran lamslåtte generaler.'
  }
];
