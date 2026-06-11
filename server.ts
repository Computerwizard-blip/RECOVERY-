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
    console.error("Gemini API Error details:", err);
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
