import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server strictly using process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-transient-environments-if-missing",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cache for daily motivational quotes to ensure stability and reduce duplicate generation overhead
let dailyQuoteCache: {
  date: string;
  data: {
    text: string;
    author: string;
    reflection: string;
    milestoneAction: string;
  };
} | null = null;

// Cache for live daily real-life situations recovery stories keyed by addiction category
let dailyStoriesCache: Record<string, {
  date: string;
  data: {
    title: string;
    addictionType: string;
    realLifeSituation: string;
    cognitiveTrap: string;
    sovereignSolution: string;
    keyTakeaway: string;
  };
}> = {};

// Endpoint for live daily recovery motivational quotes - AI-powered, updated daily
app.get("/api/daily-quote", async (req, res) => {
  try {
    const todayStr = new Date().toDateString();

    // Return the cached daily quote if it matches today's server system date
    if (dailyQuoteCache && dailyQuoteCache.date === todayStr) {
      return res.json(dailyQuoteCache.data);
    }

    const systemPrompt = `You are a world-class recovery guide and philosophical mentor specializing in addiction rehabilitation. 
Your task is to generate a highly motivating, profound daily recovery quote, unique daily reflection, and an active small milestone action step for the current calendar date (${todayStr}).

The output MUST be structured as a JSON object matching this schema:
{
  "text": "The motivational recovery quote string",
  "author": "The author designation (e.g. 'Sovereign Guide', 'Marcus Aurelius', 'Unknown Seeker', 'Socrates')",
  "reflection": "A 2-sentence supportive, compassionate psychological perspective reflecting on how to apply the quote",
  "milestoneAction": "A 1-sentence micro-action task for today (e.g. 'Sit with cold water for 2 minutes and focus purely on your breath.')"
}

Tone guidelines:
- Powerful, supportive, deeply poetic, yet realistic and clean.
- Strictly avoid generic corporate fluff.
- Celebrate resilience, daily surrender, and clear path action.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate the motivational quote bundle for today: ${todayStr}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.9,
        responseMimeType: "application/json",
      }
    });

    const bodyText = response.text?.trim() || "";
    const parsedData = JSON.parse(bodyText);

    if (parsedData && parsedData.text && parsedData.author) {
      dailyQuoteCache = {
        date: todayStr,
        data: {
          text: parsedData.text,
          author: parsedData.author,
          reflection: parsedData.reflection || "Take today as a separate, self-governing block of 24 hours. You have the power.",
          milestoneAction: parsedData.milestoneAction || "Reach out to one friend and tell them you appreciate their support."
        }
      };
      return res.json(dailyQuoteCache.data);
    }

    throw new Error("Invalid output layout format from model");
  } catch (err: any) {
    console.warn("Gemini Daily Quote generation notice (relying on robust dynamic local algorithm):", err?.message || err);
    
    // Stable day-of-year pseudo-random generator backup fallback
    const fallbacks = [
      {
        text: "You are not broken. You are a sovereign spirit learning to navigate a brain that was momentarily rewired by design.",
        author: "Sovereign Guide",
        reflection: "Your past behavior was not your core character. It was an automatic pain-relief system.",
        milestoneAction: "Delete 1 triggering contact or application from your absolute vicinity."
      },
      {
        text: "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.",
        author: "Socrates",
        reflection: "Resistance alone drains willpower. Building positive, healthy alternatives crowds out the old craving patterns.",
        milestoneAction: "Take a 10-minute walk without your digital screen present."
      },
      {
        text: "Every single day is a micro-startup of your personal sovereignty. Today, the board is clean.",
        author: "Recovery Council",
        reflection: "Do not borrow regret from yesterday or fear from tomorrow. Focus on the next 15 minutes of right choice.",
        milestoneAction: "Close your eyes, take 5 slow deep breaths, and declare: 'I am safe'."
      },
      {
        text: "Shame dies when exposed to the therapeutic light of absolute honesty.",
        author: "New Dawn Founder",
        reflection: "Secrets protect the addiction's growth. Sharing your status with trusted allies breaks the loop.",
        milestoneAction: "Write down the exact amount you spent on your trigger last week."
      }
    ];
    
    const dayOfYear = new Date().getDate() % fallbacks.length;
    const backupQuote = fallbacks[dayOfYear];
    return res.json(backupQuote);
  }
});

// Endpoint for live real-life situation recovery stories - updated daily, keyed by category
app.get("/api/daily-stories", async (req, res) => {
  try {
    const categoryQuery = String(req.query.category || "General");
    const todayStr = new Date().toDateString();
    const cacheKey = `${categoryQuery}_${todayStr}`;

    // Return the cached daily story if it matches today's server date
    if (dailyStoriesCache[cacheKey]) {
      return res.json(dailyStoriesCache[cacheKey].data);
    }

    const systemPrompt = `You are a clinical recovery advocate and professional counselor. 
Your target is to generate an authentic, immersive, real-life biographical narrative of a person facing an addiction of category "${categoryQuery}" and overcoming it successfully.
The narrative must outline deep psychological triggers, a clear cognitive distortion, and a highly practical evidence-based solution.

You MUST reply with a JSON object conforming exactly to this structure:
{
  "title": "A short, catchy, realistic title (e.g., 'Shattering the 5:00 PM Craving Loop')",
  "addictionType": "${categoryQuery}",
  "realLifeSituation": "A respectful 3-sentence description of the person's trigger point, high-arousal environment, and real challenge.",
  "cognitiveTrap": "A 1-sentence explanation of the cognitive thinking error or mental trap (e.g., 'Rationalizing that a single puff doesn't count' or 'The near-miss betting chase illusion').",
  "sovereignSolution": "A 3-sentence description of the concrete actions they took (such as physical blockades, cold water exposure, tactile substitutes, or social checking) to safely bypass the relapse.",
  "keyTakeaway": "A 1-sentence encouraging, evidence-backed guideline for sustaining long-term sobriety."
}`;

    // Lazy load or query Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a daily real-world recovery story of overcoming ${categoryQuery} on date ${todayStr}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
        responseMimeType: "application/json",
      }
    });

    const bodyText = response.text?.trim() || "";
    const parsedData = JSON.parse(bodyText);

    if (parsedData && parsedData.title && parsedData.realLifeSituation) {
      dailyStoriesCache[cacheKey] = {
        date: todayStr,
        data: {
          title: parsedData.title,
          addictionType: parsedData.addictionType || categoryQuery,
          realLifeSituation: parsedData.realLifeSituation,
          cognitiveTrap: parsedData.cognitiveTrap || "Rationalizing immediate, harmful comfort under physical fatigue.",
          sovereignSolution: parsedData.sovereignSolution || "Engaged with an emergency 10sh/100sh commitment stake, notifying an anchor teammate, and conducting box breathing.",
          keyTakeaway: parsedData.keyTakeaway || "Real power is built in the brief 15 seconds between the trigger and the choice."
        }
      };
      return res.json(dailyStoriesCache[cacheKey].data);
    }

    throw new Error("Invalid format received from Gemini client");
  } catch (err: any) {
    console.warn("Gemini daily-stories generation fallback triggered:", err?.message || err);

    // Dynamic date-based local fallbacks indexed by Category
    const category = String(req.query.category || "General");
    const todayNum = new Date().getDate();

    const fallbacksDict: Record<string, Array<{
      title: string;
      addictionType: string;
      realLifeSituation: string;
      cognitiveTrap: string;
      sovereignSolution: string;
      keyTakeaway: string;
    }>> = {
      "Drugs": [
        {
          title: "Kevin's Midnight Trigger Swap",
          addictionType: "Drugs",
          realLifeSituation: "Kevin used to experience strong physical cravings for stimulants when working late-night shifts alone in his apartment. The quiet hours coupled with fatigue made the desire for immediate dopamine intense.",
          cognitiveTrap: "Emotional Reasoning: Equating a wave of temporary fatigue to a permanent emotional void that only chemical substances could resolve.",
          sovereignSolution: "Kevin moved his desk to the living room, locked his smartphone using a timed lockbox at 10 PM, and took a five-minute cold shower to immediately trigger a safe norepinephrine physical reset.",
          keyTakeaway: "By altering your physical environment, you disrupt the brain’s automated cue-behavior search path."
        },
        {
          title: "Sarah's Weekend Flight Blueprint",
          addictionType: "Drugs",
          realLifeSituation: "Sarah routinely relapsed on recreational substances during Saturday evening social drives. The presence of old associates and high musical stimulation triggered instant craving loops that bypassed her cognitive defenses.",
          cognitiveTrap: "Overgeneralization: Believing she could never experience real fun or laughter without party stimulants.",
          sovereignSolution: "Sarah pledged standard accountability fees with her sister, exited active party groups, and substituted the trigger time with a weekend culinary group. This forced high tactile distraction.",
          keyTakeaway: "Healthy replacement crowds out the obsession. You cannot fight a void; you must fill it with clean structure."
        }
      ],
      "Alcohol": [
        {
          title: "Mary's Happy Hour Detour",
          addictionType: "Alcohol",
          realLifeSituation: "Mary always met associates at a local club after stressful Friday meetings. The smell of hops and friendly peer pressure routinely broke her commitment to sobriety.",
          cognitiveTrap: "Minimizing: Telling herself 'just one light cider won't hurt, I had a hard week and deserve to loosen up'.",
          sovereignSolution: "Mary called her recovery partner before leaving the office, ordered a highly carbonated mineral water with fresh lime first, and left the venue at 7:30 PM before others changed tone.",
          keyTakeaway: "First-fluid control determines the evening. Secure a non-alcoholic drink immediately to protect your prefrontal cortex."
        },
        {
          title: "James's Solo Evening Reclaim",
          addictionType: "Alcohol",
          realLifeSituation: "James returned home to an empty house at 6 PM, which was his traditional drinking trigger hour to drown loneliness. The urge to pour a drink felt physical and heavy.",
          cognitiveTrap: "Magnification: Assuming the heavy discomfort of loneliness would be absolute and intolerable for the entire evening.",
          sovereignSolution: "James committed to a 3-mile ran immediately upon entering his doorway without turning on any lights inside. The endorphin release replaced his drink craving and improved his quality sleep.",
          keyTakeaway: "Craving waves peak within 20 minutes if un-indulged. Build a non-negotiable physical displacement habit."
        }
      ],
      "Gambling": [
        {
          title: "Kamau's Zero-Deposit Sports Fast",
          addictionType: "Gambling",
          realLifeSituation: "Kamau spent hours looking at betting charts on his phone. After losing school fees on a 'sure bet' sports match, he felt an immediate panic urge to deposit another KES 2,000 to win it back.",
          cognitiveTrap: "The Sunk Cost Fallacy: Believing that additional betting increases the likelihood of recovering past losses.",
          sovereignSolution: "Kamau deleted all payment apps, linked his M-PESA to daily lock-alerts, and used Solmontec Recovery life's stake system to deposit small, non-refundable discipline stakes instead of wagering.",
          keyTakeaway: "Sovereignty is built by taking financial tools of relapse entirely out of your physical reach."
        },
        {
          title: "Arap's Virtual Casino Escape",
          addictionType: "Gambling",
          realLifeSituation: "Arap played virtual slot games on weekends for hours. The bright colors, celebratory sound signals, and quick near-miss loops kept him hooked while his bank balance drained.",
          cognitiveTrap: "The Illusion of Control: Mistaking random algorithmic outcomes for personal skill or a lucky streak.",
          sovereignSolution: "Arap switched his phone's display to greyscale mode to strip the game of visual allure, and loaded a hard blocking DNS configuration.",
          keyTakeaway: "Casinos use behavioral design to trap human attention. Demystify the game by stripping it of colorful dopamine triggers."
        }
      ],
      "Nicotine": [
        {
          title: "Wanjiku's 3 PM Stress Bypass",
          addictionType: "Nicotine",
          realLifeSituation: "Wanjiku reached for her disposable vape at 3 PM during corporate work peaks. The habitual hand-to-mouth movement felt completely automatic whenever stress surged.",
          cognitiveTrap: "Confusing relief with relaxation: Attributing anxiety reduction to nicotine, rather than the deep exhalations she performed while puffing.",
          sovereignSolution: "She replaced her vape with a box of organic toothpicks and took 5 deep 'box breaths' (inhale 4s, hold 4s, exhale 4s) to calm her nervous system.",
          keyTakeaway: "The stressful trigger is work; the breathing reduces it, not the nicotine."
        }
      ],
      "Sex": [
        {
          title: "David's Laptop Solitary Guard",
          addictionType: "Sex",
          realLifeSituation: "David found himself opening private incognito tabs late at night when bored and isolated in his bedroom. The high-novelty instant gratification left him feeling depleted and shame-ridden by morning.",
          cognitiveTrap: "Deprivation Mindset: Feeling that denying himself the digital escape was an unfair punishment, rather than a protective choice.",
          sovereignSolution: "David established a physical house rule: all laptops and charging cables sleep in the kitchen. He placed a physical book on his pillow to redirect his mind.",
          keyTakeaway: "Proximity governs behavior. Keep your sleep sanctuary safe by locking digital triggers outside your room."
        }
      ],
      "Tech": [
        {
          title: "Amani's 5-Hour Midnight Scroll Lock",
          addictionType: "Tech",
          realLifeSituation: "Amani fell into a passive social feed scroll till 3 AM. He woke up with brain fog, eye strain, and acute frustration over wasted hours.",
          cognitiveTrap: "FOMO (Fear of Missing Out): Acting as if logging off meant missing a massive community conversation.",
          sovereignSolution: "He uninstalled algorithm-driven feeds on weekdays and replaced his night ritual with a physical journal to write thoughts on paper.",
          keyTakeaway: "Peace of mind is not found on a glass screen. Give your brain permission to sleep in silence."
        }
      ],
      "General": [
        {
          title: "John's Self-Sabotage Awakening",
          addictionType: "General",
          realLifeSituation: "John had been clean for 15 days of his milestone. Suddenly, a feeling of 'I am cured' hit him, and he wanted to test his discipline by hanging out around temptation.",
          cognitiveTrap: "Overconfidence Trap: Believing that temporary absence of physical cravings means psychological triggers are fully healed.",
          sovereignSolution: "John logged his thoughts onto the Alliance forum and read experiences of people who relapsed after 'testing' their willpower. He stayed home.",
          keyTakeaway: "True healing respects the cunning nature of neural pathways. Do not walk into a trap to prove your strength."
        }
      ]
    };

    const categoriesList = fallbacksDict[category] || fallbacksDict["General"];
    const chosenStory = categoriesList[todayNum % categoriesList.length];
    
    return res.json(chosenStory);
  }
});

// Endpoint for cognitive behavioral therapy counselor chat, handled securely server-side
app.post("/api/counselor", async (req, res) => {
  try {
    const { messages, category } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format. Expected array of chat message turns." });
    }

    // Build standard prompt with contextual CBT framing based on the addiction category
    const categoryFocus = category ? `specifically focused on recovery from ${category}` : "general addiction recovery";
    
    const systemPrompt = `You are "Sovereign Guide", a highly compassionate, non-judgmental, professional therapy counselor and recovery specialist. 
Your objective is to provide evidence-based Cognitive Behavioral Therapy (CBT) and Motivational Interviewing guidance to individuals seeking to overcome addiction (${categoryFocus}).

Core Constraints for your character:
- Be incredibly empathetic, gentle, validating, and clear.
- Validate their struggles and acknowledge that recovery takes immense courage.
- Never be preachy, clinical-only, or shaming.
- Frame addiction as an attempt to solve an underlying pain or gap, and help them identify safe triggers and healthier alternatives.
- Offer practical, action-oriented exercises (e.g., CBT worksheets, distress tolerance, breathing pacing, urges mapping).
- Mention that this platform facilitates community support and "small-stakes subscription" (such as 300sh split into 10sh/20sh stakes payments) to keep professional care accessible and manageable. Encourage them that taking small stakes is a massive step forward.
- Keep answers structured and scannable. Use Markdown list items, bold highlight points, and clear spacing.
`;

    // Map conversation formatting from the client to Gemini generateContent contents format
    // Contents structure: array of { role: 'user' | 'model', parts: [{ text: '...' }] }
    const formattedContents = messages.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Perform server-side call using the official @google/genai SDK
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I am here to support you. Let's take the next small step together.";
    return res.json({ reply: replyText });
  } catch (err: any) {
    console.warn("Gemini CBT Counselor API notice:", err?.message || err);
    return res.status(500).json({ 
      error: "The Sovereign Guide is temporarily meditating. Please try your request in a moment.",
      technical: err instanceof Error ? err.message : String(err)
    });
  }
});

// Server-side database connection health-check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Mount Vite middleware in development or serve compiled assets in production
async function setupViteStaticFiles() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite dev server integrating as Express middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server safely running on http://0.0.0.0:${PORT}`);
  });
}

setupViteStaticFiles();
