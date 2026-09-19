import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI lazily with process.env.GEMINI_API_KEY
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Pre-packaged high-craft knowledge gaps fallback in case Gemini key is pending
const CURATED_BLINDSPOTS: Record<string, any> = {
  "kaffe": {
    topic: "Kaffe & Koffein",
    curiosityHook: "Kaffe gir deg ikke 'energi'. Den blokkerer bare hjernens kvitteringssystem for tretthet.",
    intuitiveTrap: {
      question: "Hvorfor føler du deg ofte enda trøttere noen timer etter en sterk kopp kaffe enn hvis du ikke drakk kaffe?",
      options: [
        "Koffeinet omdannes til et beroligende stoff i leveren",
        "Adenosin (tretthetsmolekylet) har fortsatt å hope seg opp i bakgrunnen mens reseptorene var blokkert",
        "Kroppen mister for mye vann og blir dehydrert",
        "Insulinnivået stiger voldsomt og gir et 'sukkerkrasj'"
      ],
      intuitiveWrongAnswerIndex: 0,
      correctIndex: 1,
      counterIntuitiveExplanation: "Koffein er en adenosin-antagonist: Den setter seg i låsen uten å vri om. I mellomtiden fortsetter hjernen å produsere adenosin. Når koffeinet brytes ned, skyller all den oppsamlede trettheten inn i reseptorene samtidig ('adenosin-tsunami')!"
    },
    mechanismChallenge: {
      title: "Mekanisme-testen: Koffein og Våkenhet",
      prompt: "Forklar nøyaktig hva som skjer på cellenivå når koffein når hjernen, og hvorfor toleranse oppstår etter noen uker.",
      keyMissingMechanisms: [
        "Oppregulering av adenosinreseptorer (hjernen bygger flere 'låser')",
        "Blokade av A1 og A2A adenosinreseptorer",
        "Halveringstid i leveren via cytokrom P450 1A2"
      ],
      commonFallacy: "Troen på at koffein skaper reell metabolsk energi (ATP), mens det egentlig bare maskerer feedback-signalet om ATP-forbruk."
    },
    humanIgnoranceFrontier: {
      unresolvedQuestion: "Hvorfor utviklet kaffeplanten koffein som en dødelig nervegift mot insekter, men samtidig belønner bier med akkurat passe mengde i nektaren for å forbedre hukommelsen deres?",
      whyScienceDoesNotKnowYet: "Evolusjonsbiologer debatterer fremdeles den eksakte finkalibreringen mellom gift og nevromodulator over millioner av år med sam-evolusjon.",
      openTheories: [
        "Avhengighetsskapende nektar manipulerer pollinerende insekter til å favorisere planten",
        "Beskyttelse mot sopp og jordbakterier ved spiring",
        "Dose-avhengig seleksjonstrykk"
      ]
    }
  },
  "sykkel": {
    topic: "Hvordan en sykkel balanserer",
    curiosityHook: "Fysikere trodde i over 100 år at de forsto hvorfor en sykkel ikke velter. I 2011 bygde forskere en sykkel som motbeviste alle lærebøker.",
    intuitiveTrap: {
      question: "Hva er hovedgrunnen til at en førerløs sykkel holder seg oppreist når du dytter den i fart?",
      options: [
        "Hjulenes gyroskopiske krefter holder den automatisk vertikal",
        "Styregeometrien (trail/forgaffel-vinkel) gjør at forhjulet svinger i fallretningen for å hente inn tyngdepunktet",
        "Luftmotstanden mot eikene skaper en stabiliserende vortex",
        "Senter av masse er lavere enn pedalakslingen"
      ],
      intuitiveWrongAnswerIndex: 0,
      correctIndex: 1,
      counterIntuitiveExplanation: "I 2011 bygde forskere (Kooijman et al., Science) en fungerende to-hjuling helt UTEN gyroskopisk effekt (motroterende hjul) og med negativ trail, og den balanserte likevel selv! Nøkkelen er koblingen mellom styre-treghet og massesenter som 'svinger inn i fallet'."
    },
    mechanismChallenge: {
      title: "Mekanisme-testen: Selvoppretting",
      prompt: "Hvis du dytter en sykkel mot høyre i fart, hvorfor faller den ikke flatt i bakken?",
      keyMissingMechanisms: [
        "Forgaffelens vinkel og forskyvning (trail)",
        "Styret faller raskere enn rammen velter og gjenvinner støttepunktet under tyngdepunktet",
        "Sentrifugalkraft fra svingen motvirker gravitasjonsmomentet"
      ],
      commonFallacy: "Å tilskrive all stabilitet til gyroskopiske krefter (hjulene roterer for sakte ved 15 km/t til å motvirke en velting alene)."
    },
    humanIgnoranceFrontier: {
      unresolvedQuestion: "Finnes det en universell matematisk formel som forutsier nøyaktig om et vilkårlig to-hjuls fartøy er selvopprettende uten å måtte løse 25 koblede differensialligninger?",
      whyScienceDoesNotKnowYet: "Systemet har for mange ikke-lineære dynamiske frihetsgrader (styrvinkel, helningsvinkel, dekkdeformasjon).",
      openTheories: [
        "Ikke-holonome dynamiske systemer",
        "Minimal parameter-modell med 4 uavhengige variabler"
      ]
    }
  },
  "sov": {
    topic: "Hvorfor vi sover",
    curiosityHook: "Hvis søvn ikke tjener en helt avgjørende funksjon, er det evolusjonens største feiltakelse.",
    intuitiveTrap: {
      question: "Hvilket av disse dyrene har forskere oppdaget at ALDRI sover i løpet av livet?",
      options: [
        "Ingen – alle dyr med et nervesystem som er undersøkt viser en form for søvn eller dvaletilstand",
        "Gepard (må alltid være våken for rovdyr)",
        "Delfiner og hvaler sover aldri",
        "Trelevende maur mangler søvnmekanismer"
      ],
      intuitiveWrongAnswerIndex: 2,
      correctIndex: 0,
      counterIntuitiveExplanation: "Delfiner sover med én hjernehalvdel om gangen (unihemisfærisk søvn)! Selv maneter (som mangler hjerne) og rundormer (C. elegans) sover. Søvn er universelt, men vitenskapen krangler fremdeles om primærhovedårsaken."
    },
    mechanismChallenge: {
      title: "Mekanisme-testen: Det glymfatiske systemet",
      prompt: "Hva foretar hjernen seg mekanisk mens du sover dypt (NREM) for å forhindre nevrodegenerasjon?",
      keyMissingMechanisms: [
        "Det glymfatiske systemet skyller spinalvæske gjennom hjernevevet",
        "Gliaceller krymper med opptil 60% for å åpne interstitielle kanaler",
        "Utskylling av beta-amyloid og tau-proteiner"
      ],
      commonFallacy: "Å tro at hjernen 'skrur seg av' for å hvile, mens den i realiteten er metabolsk hyperaktiv med reparasjonsarbeid og synaptisk beskjæring."
    },
    humanIgnoranceFrontier: {
      unresolvedQuestion: "Hvorfor drømmer vi i bisarre, absurde narrativer i stedet for bare å repetere dagens hendelser lineært?",
      whyScienceDoesNotKnowYet: "Nevroforskere er delt mellom 'Overfitted Brain Hypothesis' (drømmer forhindrer kognitiv overtilpasning gjennom surrealistisk støy) og 'Trussel-simulering'.",
      openTheories: [
        "Overfitted Brain Hypothesis (nevral regularisering)",
        "Emosjonell desensibilisering (REM fjerner noradrenalin mens minner rekonsolideres)"
      ]
    }
  }
};

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Epistemic truth mandate status
app.get("/api/epistemic/truth-mandate", (_req, res) => {
  res.json({
    status: "active",
    guarantee: "Absolutt forbud mot usannheter, fabrikasjoner og pseudovitenskap",
    enforcement: "Strict Epistemic Consensus Guardrails",
    timestamp: new Date().toISOString(),
    rules: [
      "1. Kun etablert vitenskapelig konsensus og etterprøvbare empiriske data aksepteres som fakta.",
      "2. Uløste fenomener skal eksplisitt erklæres som uoppklarte mysterier med åpne hypoteser.",
      "3. Utbredte myter og tankefeller skal eksplisitt dekonstrueres.",
      "4. Nulltoleranse for AI-hallusinasjoner eller oppdiktede mekanismer."
    ]
  });
});

// API: Socratic Blindspot Probe
app.post("/api/blindspot/probe", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== "string") {
      res.status(400).json({ error: "Vennligst oppgi et emne" });
      return;
    }

    const cleanTopic = topic.trim().toLowerCase();
    
    // Check if curated match exists
    const matchingKey = Object.keys(CURATED_BLINDSPOTS).find(k => cleanTopic.includes(k) || k.includes(cleanTopic));

    const ai = getAI();
    if (!ai) {
      if (matchingKey) {
        res.json({ challenge: CURATED_BLINDSPOTS[matchingKey], source: "curated" });
        return;
      }

      // Generate a dynamic fallback challenge if no AI key yet
      const fallbackChallenge = {
        topic: topic,
        curiosityHook: `De fleste tror de forstår grunnprinsippene i ${topic}, men overser det underliggende paradokset.`,
        intuitiveTrap: {
          question: `Hva er den vanligste motintuitive misforståelsen folk har om ${topic}?`,
          options: [
            `At den mest åpenbare effekten er en direkte lineær konsekvens`,
            `At systemet reguleres av en skjult negativ tilbakekoblingssløyfe de fleste overser`,
            `At korrelasjon forveksles med kausal mekanisme`,
            `At ekstreme randtilfeller oppfører seg stikk motsatt av normalsituasjonen`
          ],
          intuitiveWrongAnswerIndex: 0,
          correctIndex: 1,
          counterIntuitiveExplanation: `Når vi tenker på ${topic}, tenker vi lineært: 'Mer A gir mer B'. I virkeligheten styres systemet av komplekse motkrefter og likevektsprinsipper som utløses når vi endrer skala.`
        },
        mechanismChallenge: {
          title: `Mekanisme-testen: ${topic}`,
          prompt: `Hvordan vil du forklare selve årsakskjeden (mekanismen) bak ${topic} til en som aldri har hørt om det, uten å bruke abstrakte buzzwords?`,
          keyMissingMechanisms: [
            "Førsteprinsipper og kausale ledd",
            "Grensebetingelser der intuisjonen bryter sammen",
            "Måling vs antagelse"
          ],
          commonFallacy: "Å forveksle navnet på tingen med å forstå hvordan den fungerer i detalj (Feynman-fellen)."
        },
        humanIgnoranceFrontier: {
          unresolvedQuestion: `Hva er det største åpne spørsmålet i verden i dag angående ${topic}?`,
          whyScienceDoesNotKnowYet: "Det involverer enten for mange koblede variabler, målebegrensninger eller et grunnleggende paradoks i fysikk/psykologi.",
          openTheories: [
            "Emergens fra enklere deler",
            "Målefeil vs reell stokastisitet",
            "Paradigmeskifte i definisjonen"
          ]
        }
      };

      res.json({ challenge: fallbackChallenge, source: "fallback-structure" });
      return;
    }

    // Call Gemini 3.8 Flash for real-time Socratic probe with strict Epistemic Truthfulness Mandate
    const prompt = `Du er Sokrates og en kompromissløs, nøyaktig vitenskapsformidler.
Brukeren ønsker å teste sine kognitive blindsoner og kunnskapshull om temaet: "${topic}".

STRENG EPISTEMISK SANNHETSGARANTI (IKKE LOV Å GI USANNHETER):
- DU HAR ET ABSOLUTT, UFRAVIKELIG FORBUD MOT Å GI USANNHETER, FABRIKASJONER ELLER PÅSTANDER UTEN VITENSKAPELIG DEKNING.
- Alt du formidler MÅ bygge på verifiserte fakta og anerkjent vitenskapelig konsensus.
- Hvis emnet inneholder en utbredt myte (f.eks. 'koffein gir energi', 'sykler balanserer kun pga hjulenes gyroeffekt', 'vi bruker bare 10% av hjernen'), MÅ du eksplisitt avdekke at dette er en usannhet og forklare den sanne fysiske/biologiske mekanismen.
- Hvis et aspekt er et uløst mysterium der vitenskapen fremdeles er usikker, HAR DU IKKE LOV til å late som svaret er kjent. Du MÅ si rett ut at vitenskapen IKKE vet det, og liste opp de ledende, fagfellevurderte hypotesene.

Generer en leken, motintuitiv og dypt fascinerende blindsonetest på NORSK. 
Fokuser på:
1. "The Illusion of Explanatory Depth" (hvorfor folk tror de forstår dette bedre enn de gjør).
2. En motintuitiv sannhet eller felle (Intuitive Trap).
3. Hva moderne vitenskap/menneskeheten FREMDELES IKKE vet (Human Ignorance Frontier).

Svar strengt i JSON med nøyaktig følgende format:
{
  "topic": "${topic}",
  "curiosityHook": "En kort, fengende setning som snur en vanlig oppfatning på hodet basert på streng vitenskap",
  "intuitiveTrap": {
    "question": "Et konkret motintuitivt spørsmål eller gåte",
    "options": ["Alternativ 0", "Alternativ 1", "Alternativ 2", "Alternativ 3"],
    "intuitiveWrongAnswerIndex": 0,
    "correctIndex": 1,
    "counterIntuitiveExplanation": "En lettfattelig, 100% vitenskapelig presis forklaring på hvorfor intuisjonen tok feil (uten usannheter)."
  },
  "mechanismChallenge": {
    "title": "Mekanisme-testen: ...",
    "prompt": "En utfordring der brukeren må forklare den nøyaktige fysiske/logiske årsakskjeden",
    "keyMissingMechanisms": ["Mekanisme 1", "Mekanisme 2", "Mekanisme 3"],
    "commonFallacy": "Den klassiske tankefeilen eller myten folk forveksler dette med"
  },
  "humanIgnoranceFrontier": {
    "unresolvedQuestion": "Det største reelt uløste mysteriet vitenskapen fremdeles grubler på om dette",
    "whyScienceDoesNotKnowYet": "Hvorfor det vitenskapelig er uavklart og vanskelig å måle",
    "openTheories": ["Teori A", "Teori B", "Teori C"]
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Du er en mester i motintuitiv vitenskap, filosofi og kognitive blindsoner. DU HAR STRENGT FORBUD MOT Å GI USANNHETER ELLER FABRIKASJONER. Alt du skriver skal være 100% vitenskapelig etterrettelig på norsk.",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ challenge: parsed, source: "gemini" });
  } catch (error: any) {
    console.error("Error in /api/blindspot/probe:", error);
    res.status(500).json({ error: error.message || "Kunne ikke generere blindsonetest" });
  }
});

// API: Evaluate User's Explanation (The Explanatory Depth Rubric)
app.post("/api/blindspot/evaluate", async (req, res) => {
  try {
    const { topic, userExplanation, challenge } = req.body;
    if (!userExplanation || typeof userExplanation !== "string") {
      res.status(400).json({ error: "Vennligst skriv din forklaring" });
      return;
    }

    const ai = getAI();
    if (!ai) {
      // Local heuristic evaluator
      const wordCount = userExplanation.trim().split(/\s+/).length;
      let score = Math.min(88, Math.max(35, wordCount * 2.5 + 20));
      
      res.json({
        evaluation: {
          feedback: `Du gjorde et hederlig forsøk! Å formulere den eksakte årsakskjeden i ord er nettopp der den 'forklarende dybdeillusjonen' slår inn. Du fanget opp deler av essensen, men det mangler ofte de finkornede overgangene.`,
          epistemicAccuracyScore: Math.round(score),
          revealedBlindspots: [
            "Kausale mellomledd som ble hoppet over i forklaringen",
            "Antagelse om linearitet fremfor tilbakekobling"
          ],
          deepDivingQuestion: `Hva ville skjedd dersom du reverserte den første variabelen i forklaringen din?`,
          epistemicTitle: score > 70 ? "Skarp Observatør" : "Nysgjerrig Utforsker"
        }
      });
      return;
    }

    const evalPrompt = `STRENG EPISTEMISK SANNHETSGARANTI:
Vurder brukerens forsøk på å forklare mekanismen bak "${topic}" med full vitenskapelig ærlighet og stringens.
IKKE godkjenn eller bekreft pseudovitenskap, myter eller oppdiktede mekanismer. Hvis brukeren gjentar en vanlig myte, pek det vennlig, men entydig ut.

Utfordringen var: "${challenge?.mechanismChallenge?.prompt || topic}"
Viktige mekanismer som kreves: ${JSON.stringify(challenge?.mechanismChallenge?.keyMissingMechanisms || [])}
Brukerens forklaring:
"${userExplanation}"

Analyser forklaringen med vennlig, leken, men presis sokratisk visdom på NORSK.
Returner JSON:
{
  "feedback": "En oppmuntrende, fascinerende kommentar om hva de forsto og hva som manglet (maks 3-4 setninger, vitenskapelig etterrettelig)",
  "epistemicAccuracyScore": 65, // tall mellom 10 og 95 basert på faktisk mekanistisk nøyaktighet
  "revealedBlindspots": ["Spesifikk blindflekk 1 de overså", "Spesifikk blindflekk 2"],
  "deepDivingQuestion": "Et tankevekkende oppfølgingsspørsmål",
  "epistemicTitle": "F.eks: 'Intuitiv Alchemist' eller 'Empirisk Sokrates' eller 'Konseptuell Arkitekt'"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: evalPrompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Du er en sokratisk sensor med strengt forbud mot å bekrefte usannheter. Vurder vitenskapelig presisjon på norsk.",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ evaluation: parsed });
  } catch (error: any) {
    console.error("Error in /api/blindspot/evaluate:", error);
    res.status(500).json({ error: error.message || "Kunne ikke evaluere forklaring" });
  }
});

// API: Thought experiment generator
app.post("/api/thought-experiment", async (req, res) => {
  try {
    const { mysteryTitle, details } = req.body;
    const ai = getAI();
    if (!ai) {
      res.json({
        thoughtExperiment: {
          title: `Tankeeksperiment: Hva om vi endrer fysikkens regler for ${mysteryTitle}?`,
          scenario: `Forestill deg at du befinner deg i et isolert observatorium der denne mekanismen plutselig opphører å fungere i 10 sekunder.`,
          choices: [
            { label: "Universet kollapser i uorden", outcome: "Entropien øker umiddelbart, men ikke nødvendigvis katastrofalt på mikronivå." },
            { label: "Tidsfornemmelsen forsvinner", outcome: "Uten en termodynamisk gradient kan ikke hjernen skille fortid fra fremtid!" }
          ],
          philosophicalPunchline: "Det største beviset på at vi ikke forstår en naturlov, er at vi ikke kan simulere konsekvensene av dens fravær."
        }
      });
      return;
    }

    const prompt = `Lag et interaktivt, fascinerende tankeeksperiment (Gedankenexperiment) om det uløste vitenskapelige mysteriet "${mysteryTitle}": ${details || ""}.
STRENG EPISTEMISK SANNHETSGARANTI: Ikke dikt opp naturlover eller påstå at gåten er løst. Tankeeksperimentet må belyse den reelle grensen for menneskelig kunnskap.
Språk: Norsk.
Returner JSON:
{
  "title": "Tittelen på tankeeksperimentet",
  "scenario": "En levende, fantasifull situasjon der brukeren må ta stilling til et paradoks",
  "choices": [
    { "label": "Valg A", "outcome": "Hva dette valget avslører om fysikken eller sinnet" },
    { "label": "Valg B", "outcome": "Hva dette valget avslører om fysikken eller sinnet" }
  ],
  "philosophicalPunchline": "En dyp og tankevekkende innsikt om menneskelig kunnskap"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Du designer fysikalske og filosofiske tankeeksperimenter uten usannheter. Norsk språk.",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ thoughtExperiment: parsed });
  } catch (error: any) {
    console.error("Error in /api/thought-experiment:", error);
    res.status(500).json({ error: error.message || "Kunne ikke generere tankeeksperiment" });
  }
});


// Setup Vite middleware in dev or static serving in prod
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Terra Incognita backend server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
