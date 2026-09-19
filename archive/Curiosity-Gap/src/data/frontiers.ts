import { KnowledgeFrontier, CalibrationItem } from "../types";

export const KNOWLEDGE_FRONTIERS: KnowledgeFrontier[] = [
  {
    id: "mpemba-effect",
    title: "Mpemba-Effekten",
    category: "Hverdagsmysterier",
    teaser: "Hvorfor fryser kokende vann noen ganger raskere til is enn lunkent vann?",
    whatPeopleAssume: "Kaldt vann har kortere vei å kjøle seg ned til 0°C, så det må alltid fryse først.",
    theUnsolvedCore: "I 1963 oppdaget den tanzanianske skoleeleven Erasto Mpemba at varm iskremblanding frøs raskere enn kald. Selv om effekten er reprodusert, finnes det ingen universell konsensus: Spiller fordamping, oppløste gasser, konveksjonsstrømmer eller uvanlige hydrogenbindinger i vannmolekylene hovedrollen?",
    counterIntuitiveTruth: "Vann er et av de mest uforutsigbare stoffene i universet. Tettheten topper ved 4°C, og hydrogenbindinger danner komplekse klynger som endrer seg ikke-lineært under oppvarming.",
    wonderQuestion: "Hvis vi ikke en gang forstår hvordan rent vann fryser, hvor mye av kjøkkenets fysikk tar vi for gitt?",
    tags: ["Termodynamikk", "Vannets kjemi", "Skolebenkmysterium"]
  },
  {
    id: "bicycle-balance",
    title: "Sykkelens Selvoppretting",
    category: "Hverdagsmysterier",
    teaser: "Hvorfor velter ikke en førerløs sykkel når du dytter den i fart?",
    whatPeopleAssume: "Hjulene fungerer som gyroskoper som tvinger sykkelen til å stå rett opp.",
    theUnsolvedCore: "I 2011 bygde forskere ved Cornell University en fungerende to-hjulssykkel uten spinnende hjul-effekt (motroterende disker kansellerte gyroskopet) og med negativ forgaffel. Den balanserte likevel perfekt på egen hånd!",
    counterIntuitiveTruth: "Sykkelen holder seg oppreist fordi forhjulet automatisk svinger inn i retningen den faller mot raskere enn sykkelen velter, og styrer hjulene tilbake under massesenteret.",
    wonderQuestion: "Er balanse egentlig bare en serie kontrollerte, automatisk korrigerte fall?",
    tags: ["Mekanikk", "Dynamiske systemer", "Ingeniørkunst"]
  },
  {
    id: "open-label-placebo",
    title: "Ærlig Placebo (Open-Label)",
    category: "Hjerne & Bevissthet",
    teaser: "Hvorfor virker en sukkerpille selv når legen forteller deg at det bare er sukker?",
    whatPeopleAssume: "Placebo fungerer bare når pasienten blir lurt til å tro at de får ekte medisin.",
    theUnsolvedCore: "Kliniske studier ved Harvard har vist at pasienter med kroniske smerter og IBS får markant bedring selv når pilleboksen har påskriften: 'Inert placebo uten virkestoff'. Hjernen utløser likevel endorfiner og nevrotransmittere.",
    counterIntuitiveTruth: "Selve ritualet rundt behandling – det å ta en pille, møte en omsorgsperson og handle med hensikt – trigger helbredelsesresponsen uavhengig av intellektuell overbevisning.",
    wonderQuestion: "Kan bevisstheten helbrede kroppen selv når den vet at den blir simulert?",
    tags: ["Nevrovitenskap", "Psykologi", "Medisin"]
  },
  {
    id: "sleep-paradox",
    title: "Søvnens Evolusjonære Gåte",
    category: "Liv & Evolusjon",
    teaser: "Hvorfor bruker alle dyr med et nervesystem en tredjedel av livet på å være bevisstløse og forsvarsløse?",
    whatPeopleAssume: "Søvn er rett og slett kroppens måte å spare kalorier på.",
    theUnsolvedCore: "Å sove sparer bare cirka 110 kalorier per natt hos mennesker (tilsvarende en brødskive). Samtidig gjør det deg sårbar for rovdyr. Biologer kaller det et evolusjonært paradoks: Hvis søvn ikke har en vital funksjon, er det naturens største blunder.",
    counterIntuitiveTruth: "Under dyp søvn krymper hjernecellene med 60%, og det glymfatiske systemet skyller bokstavelig talt spinalvæske gjennom hjernen for å fjerne giftige biprodukter som beta-amyloid.",
    wonderQuestion: "Er bevissthet bare en midlertidig tilstand vi tåler mellom nødvendige biologiske rengjøringer?",
    tags: ["Evolusjon", "Biologi", "Hjernens avløp"]
  },
  {
    id: "dark-matter-energy",
    title: "Det Usynlige Universet (95%)",
    category: "Kosmos & Fysikk",
    teaser: "Alt vi noen gang har sett, målt og rørt utgjør under 5% av kosmos.",
    whatPeopleAssume: "Stjerner, planeter, gasser og svarte hull utgjør det meste av rommet.",
    theUnsolvedCore: "Galakser roterer så fort at de burde flydd fra hverandre hvis bare den synlige massen eksisterte. Det må finnes en usynlig masse (mørk materie, ca 27%) og en mystisk frastøtende kraft (mørk energi, ca 68%). Vi har lett i 50 år uten å finne én eneste mørk materie-partikkel.",
    counterIntuitiveTruth: "Standardmodellen i fysikk – menneskehetens mest presise vitenskapelige teori – beskriver bare en 5% 'forurensning' i et hav av ukjent eksistens.",
    wonderQuestion: "Er det mørk materie som er det normale i kosmos, mens vi er det eksotiske avviket?",
    tags: ["Astrofysikk", "Kosmologi", "Kvantefelt"]
  },
  {
    id: "quantum-measurement",
    title: "Kvantemålingens Paradoks",
    category: "Kosmos & Fysikk",
    teaser: "Endrer virkelig partikler oppførsel bare fordi noen kikker på dem?",
    whatPeopleAssume: "Måleapparatet forstyrrer partikkelen fysisk, som en lommelykt som treffer et støvkorn.",
    theUnsolvedCore: "I dobbeltspalteforsøket oppfører elektroner seg som bølger inntil vi måler hvilken spalte de passerer. Da 'kollapser' bølgefunksjonen til en partikkel. Det finnes ingen enighet om hva som definerer en 'måling': Er det et makroskopisk apparat, termodynamisk irreversibilitet, eller bevisstheten selv?",
    counterIntuitiveTruth: "Virkeligheten eksisterer i en tåke av samtidige sannsynligheter (superposisjon) helt til en interaksjon tvinger frem et konkret utfall.",
    wonderQuestion: "Finnes månen bare der når noen ser på den?",
    tags: ["Kvantefysikk", "Erkjennelsesteori", "Superposisjon"]
  },
  {
    id: "fermi-paradox",
    title: "Fermi-Paradokset: Den Store Stillheten",
    category: "Kosmos & Fysikk",
    teaser: "Hvis universet er 13,8 milliarder år gammelt og fullt av beboelige planeter: Hvor er alle sammen?",
    whatPeopleAssume: "Avstandene er for store til at noen kan reise mellom stjernene.",
    theUnsolvedCore: "Selv med 1% av lysets hastighet ville en sivilisasjon med selvreplikerende sonder (von Neumann-sonder) kolonisert hele Melkeveien på under 10 millioner år – et øyeblikk i kosmisk tid. Likevel er stjernehimmelen fullstendig stille.",
    counterIntuitiveTruth: "Enten er intelligent liv ufattelig sjeldent (vi er alene), eller så finnes det et 'Stort Filter' som utsletter sivilisasjoner før de mestrer interstellare reiser.",
    wonderQuestion: "Er det mer skremmende om vi er helt alene i universet, eller om vi ikke er det?",
    tags: ["SETI", "Eksoplaneter", "Sivilisasjonens fremtid"]
  },
  {
    id: "illusion-of-depth",
    title: "Den Forklarende Dybdeillusjonen",
    category: "Hjerne & Bevissthet",
    teaser: "Hvorfor tror vi at vi forstår hvordan vanlige gjenstander fungerer, helt til vi må tegne dem?",
    whatPeopleAssume: "Hvis vi bruker en glidelås, et toalett eller en mikrobølgeovn hver dag, forstår vi prinsippet.",
    theUnsolvedCore: "I 2002 ba psykologene Keil og Rozenblit folk vurdere hvor godt de forsto en glidelås (gjennomsnitt: 7/10). Da de ble bedt om å tegne krokene og tennene og forklare hektene trinn for trinn, falt selvtilliten til 2/10. Hjernen forveksler det å gjenkjenne en funksjon med å forstå mekanismen.",
    counterIntuitiveTruth: "Mennesker lever i et kollektivt kunnskapsnettverk. Vi lener oss så tungt på andres ekspertise at hjernen vår 'låner' forståelsen og tror den sitter i vårt eget hode.",
    wonderQuestion: "Hvor mye av det du tror du kan, er bare kunnskap du stoler på at noen andre har?",
    tags: ["Kognitiv bias", "Metakognisjon", "Psykologi"]
  }
];

export const CALIBRATION_QUESTIONS: CalibrationItem[] = [
  {
    id: 1,
    statement: "I et rom med bare 23 tilfeldige personer: Er det over eller under 50% sjanse for at minst to har bursdag på samme dag?",
    optionA: "Over 50% sjanse (Bursdagsparadokset)",
    optionB: "Under 50% sjanse (Et år har tross alt 365 dager)",
    correctAnswer: "A",
    explanation: "Ved 23 personer er sannsynligheten 50,7%! Vi tenker automatisk 'hvem har bursdag på MIN dag' (som krever 253 personer), men det handler om alle parvise sammenligninger: 23 personer danner 253 unike par!",
    counterIntuitiveReason: "Kombinatorisk eksplosjon: n*(n-1)/2 vokser kvadratisk, noe den lineære menneskehjernen ikke intuitivt oppfatter."
  },
  {
    id: 2,
    statement: "Hvis du bretter et vanlig A4-ark i to 42 ganger: Hvor tykt blir papiret?",
    optionA: "Omtrent som en tykk telefonkatalog eller et lite hus",
    optionB: "Tykt nok til å nå fra jorden til månen",
    correctAnswer: "B",
    explanation: "Et ark er ca 0,1 mm tykt. 0,1 mm * 2^42 = ca 439 804 kilometer! Avstanden til månen er ca 384 400 km. Eksponentiell vekst dobler volumet i hvert steg.",
    counterIntuitiveReason: "Eksponentiell blindhet: Hjernen ekstrapolerer lineært (1, 2, 3, 4...) i stedet for geometrisk (2, 4, 8, 16...)."
  },
  {
    id: 3,
    statement: "I Monty Hall-paradokset (3 dører, 1 bil, 2 geiter): Programlederen åpner en dør med geit. Bør du bytte dør for å maksimere vinnersjansen?",
    optionA: "Ja, å bytte dør dobler vinnersjansen fra 1/3 til 2/3",
    optionB: "Det spiller ingen rolle, det er 50/50 mellom de to gjenværende dørene",
    correctAnswer: "A",
    explanation: "Når du valgte dør først, var det 1/3 sjanse for at du traff og 2/3 sjanse for at bilen sto bak en av de to andre dørene. Siden programlederen alltid må åpne en dør med en geit, overføres hele 2/3-sannsynligheten til den uåpnede døren!",
    counterIntuitiveReason: "Betinget sannsynlighet og asymmetrisk informasjon lurer selv nobelprisvinnere."
  },
  {
    id: 4,
    statement: "Hvis et romskip reiser tur-retur Alfa Centauri i 99% av lysets hastighet: Hvem eldes raskest?",
    optionA: "Menneskene som ble igjen på jorden",
    optionB: "Astronauten om bord i romskipet",
    correctAnswer: "A",
    explanation: "Ifølge Einsteins spesielle relativitetsteori går tiden saktere for objekter i ekstrem bevegelse (tidsdilatasjon). For astronauten går det kanskje 1,5 år, mens det på jorden har gått over 8,5 år!",
    counterIntuitiveReason: "Tid er ikke en universell univers-klokke, men et elastisk vev sammenvevd med rom og gravitasjon."
  },
  {
    id: 5,
    statement: "Hvilken retning må en satellitt i bane rundt jorden bremse/skyte rakettene hvis den vil ta igjen en satellitt foran seg i samme bane?",
    optionA: "Skyte bakover for å akselerere fremover",
    optionB: "Bremse ned farten (skyte forover) for å falle til en lavere, raskere bane",
    correctAnswer: "B",
    explanation: "Banemekanikk (Keplers lover) er totalt motintuitiv: Hvis du gasser fremover, kastes du inn i en høyere bane der omløpstiden er lenger (du sakker akterut). For å ta igjen noen må du bremse, falle ned i en lavere bane og rase forbi!",
    counterIntuitiveReason: "I gravitasjonsfelter bytter kinetisk energi og potensiell energi plass på en måte som trosser bil-intuisjon."
  },
  {
    id: 6,
    statement: "Hvor mye veier en vanlig hvit cumulus-sommersky som svever rolig på himmelen?",
    optionA: "Omtrent like mye som noen få biler (ca 5 tonn)",
    optionB: "Omtrent som 100 elefanter eller et passasjerfly (ca 500 tonn)",
    correctAnswer: "B",
    explanation: "En cumulus-sky er ca 1 kubikk-kilometer stor og inneholder ca 0,5 gram vanndråper per kubikkmeter. Totalt veier den ca 500 000 kg (500 tonn)! Den svever fordi tettheten er spredt over et enormt volum og bæres av oppadgående varmluft.",
    counterIntuitiveReason: "Masse vs tetthet: Hjernen forveksler 'ser lett ut' med 'har lav totalvekt'."
  }
];
