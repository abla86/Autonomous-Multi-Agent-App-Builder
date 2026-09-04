import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiAvailable: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: Explore a user proposed topic or deep dive
app.post('/api/explore-topic', async (req, res) => {
  try {
    const { topic, category } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      // Return rich fallback response if API key is not yet configured
      return res.json({
        topic,
        title: `Dossier: ${topic}`,
        category: category || 'Historie & Vitenskap',
        rarityScore: 94,
        coreFact: `${topic} inneholder en rekke oversette anomalier og historiske kuriositeter som sjelden omtales i moderne lærebøker.`,
        detailedStory: `Dette emnet representerer et fascinerende krysningspunkt mellom oversett kunnskap og glemte oppdagelser. Historiske kilder og vitenskapelige arkiver viser at feltet har skjulte sammenhenger som utfordrer vanlige oppfatninger.`,
        obscureDetails: [
          'De tidligste nedtegnelsene ble funnet i marginalnotater i lite kjente kloster- og universitetsarkiver.',
          'Moderne forskere har nylig gjenåpnet feltet ved hjelp av spektralanalyse og tverrfaglige metoder.',
          'Flere sentrale aktører publiserte aldri funnene sine i frykt for akademisk latterliggjøring på 1800-tallet.',
        ],
        quizQuestion: {
          question: `Hva er det mest bemerkelsesverdige kjennetegnet ved ${topic}?`,
          options: [
            'Det ble gjenfunnet ved en ren tilfeldighet i et uregistrert arkiv',
            'Det ble opprinnelig klassifisert som en optisk illusjon',
            'Dokumentene ble holdt hemmelig under en 100-års klausul',
            'Forskningen krevde instrumenter som først ble oppfunnet et århundre senere',
          ],
          correctAnswerIndex: 0,
          explanation: `Riktig! Mange av de mest fascinerende detaljene rundt dette temaet dukket først opp etter systematiske dypdykk i uindekserte samlinger.`,
        },
        source: 'Sjelden Kunnskaps Kuratorkomité',
      });
    }

    const prompt = `Du er en ledende ekspert og kurator for plattformen 'Sjelden Kunnskap'.
Brukeren har foreslått temaet: "${topic}" (Kategori: ${category || 'Blandet'}).
Ditt mål er å avdekke autentiske, fascinerende, lite kjente og obskure fakta om dette temaet på levende, fengslende norsk.

Returner et gyldig JSON-objekt med nøyaktig denne strukturen:
{
  "topic": "${topic}",
  "title": "Kort fengende overskrift for dossieret",
  "category": "${category || 'Vitenskap & Historie'}",
  "rarityScore": tall mellom 85 og 99 (angir hvor obskurt dette er i prosent),
  "coreFact": "Det mest sjokkerende eller fascinerende ukjente faktum om temaet (2-3 setninger)",
  "detailedStory": "En detaljert, medrivende fortelling som forklarer bakgrunnen, hvem som oppdaget det, og hvorfor det ble glemt eller oversett (150-250 ord)",
  "obscureDetails": [
    "Detalj 1: En sjelden kuriositet",
    "Detalj 2: En overraskende teknisk eller historisk finurlighet",
    "Detalj 3: Hva moderne vitenskap eller historikere sier i dag"
  ],
  "quizQuestion": {
    "question": "Et vrient og spennende spørsmål knyttet til temaet",
    "options": ["Svar A", "Svar B", "Svar C", "Svar D"],
    "correctAnswerIndex": tall (0-3),
    "explanation": "Forklaring på hvorfor svaret er riktig og den skjulte sammenhengen"
  },
  "source": "Autentisk referanse eller kilde (f.eks. Nature, Journal of Obscure Antiquities, British Royal Society Archives, etc.)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (err: any) {
    console.error('Error generating topic dossier:', err);
    return res.status(500).json({
      error: 'Kunne ikke generere dossier for temaet',
      message: err.message,
    });
  }
});

// API: Hint for the daily mystery
app.post('/api/mystery-hint', async (req, res) => {
  try {
    const { mysteryTitle, currentClues, userTheory } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        hint: 'Se nærmere på tidslinjen for hendelsen: Notatene motsier den offisielle forklaringen på ett avgjørende punkt knyttet til miljøfaktorer.',
      });
    }

    const prompt = `Du er arkivaren i 'Sjelden Kunnskap'. Brukeren etterforsker mysteriet: "${mysteryTitle}".
De har undersøkt disse sporene: ${JSON.stringify(currentClues || [])}.
Brukerens nåværende hypotese er: "${userTheory || 'Usikker'}".
Gi et atmosfærisk, intelligent, men ikke altfor avslørende hint på norsk (ca. 40-70 ord) som hjelper brukeren å tenke i riktig retning uten å spoile selve løsningen direkte.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ hint: response.text?.trim() });
  } catch (err: any) {
    return res.json({
      hint: 'Undersøk de fysiske bevisene nøye – naturen etterlater ofte spor som menneskeskapt etterforskning overser.',
    });
  }
});

// API: Generate on-demand rare fact
app.post('/api/generate-fact', async (req, res) => {
  try {
    const { category } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        title: 'Voynich-manuskriptets ukjente planter',
        category: category || 'Gjemt Historie',
        rarityScore: 96,
        summary: 'Ingen av de 113 illustrerte plantene i det mystiske Voynich-manuskriptet fra 1400-tallet kan entydig identifiseres med kjente nålevende arter.',
        fullStory: 'Radiokarbondatering har slått fast at pergamentet stammer fra tidlig på 1400-tallet. Botanikere har i over et århundre forsøkt å koble tegningene til kjente urter og vekster, men mange ser ut som hybrider satt sammen av røtter fra én art, blader fra en annen, og oppdiktede blomster.',
        tag: 'Botanisk Gåte',
        source: 'Beinecke Rare Book & Manuscript Library, Yale',
      });
    }

    const prompt = `Generer ett ytterst sjeldent, fascinerende og lite kjent faktum innen kategorien "${category || 'Vitenskap & Historie'}".
Det må være et reelt, dokumentert faktum som vanlige folk (95%+) aldri har hørt om.
Svar i gyldig JSON:
{
  "title": "Fengende tittel",
  "category": "${category || 'Vitenskap'}",
  "rarityScore": tall (88-99),
  "summary": "Konsis oppsummering på 1-2 setninger",
  "fullStory": "Fascinerende utdyping på 80-140 ord på fengende norsk",
  "tag": "Kort emneknagg",
  "source": "Autentisk kilde eller vitenskapelig publikasjon"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    return res.status(500).json({ error: 'Kunne ikke hente sjeldenhet' });
  }
});

async function startServer() {
  // Vite dev middleware vs static production files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sjelden Kunnskap server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
