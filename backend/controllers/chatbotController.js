import { GoogleGenAI } from "@google/genai";
import Department from "../models/Department.js";
import Doctor from "../models/Doctor.js";

let ai;
function getGeminiClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

// Builds the system prompt telling Gemini how to behave and what departments exist.
// Note: the model is instructed to REPLY to patients in Hindi/Hinglish since that's
// the target audience — this is a functional requirement, not a code comment.
function buildSystemPrompt(departments) {
  const deptList = departments
    .map((d) => `- ${d.name}: ${d.description || "No description"}`)
    .join("\n");

  return `You are an AI Receptionist for a hospital. Your job is to listen to the patient's
symptoms and guide them to the correct department.

Available hospital departments:
${deptList}

RULES:
1. Talk to the patient in friendly, simple Hindi/Hinglish (the way a human receptionist would).
2. If the symptom is unclear, ask 1-2 follow-up questions (e.g. "how many days has this been going on", "any other symptoms").
3. Don't ask too many questions — suggest a department after at most 2 follow-ups.
4. Never give a medical diagnosis or name a disease — only suggest a department.
5. If the symptoms sound like an emergency (severe chest pain, difficulty breathing, heavy bleeding, unconsciousness),
   immediately say "Ye emergency ho sakti hai, kripya turant hospital ki emergency mein sampark karein ya 112 par call karein"
   and set suggestedDepartment to "Emergency".
6. Only set suggestedDepartment when you are confident — use the EXACT name from the list above.
7. Until you suggest a department, keep suggestedDepartment as null.

IMPORTANT: Your entire response must be ONLY a valid JSON object, no extra text, markdown, or code fences.
Format:
{
  "reply": "the conversational message shown to the patient (in Hindi/Hinglish)",
  "suggestedDepartment": "<exact department name from list, or null>",
  "isEmergency": true/false
}`;
}

function parseGeminiJSON(text) {
  // Sometimes the model wraps output in ```json fences — strip them for safety
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// POST /api/chatbot/message
export const sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1. Fetch active departments from DB
    const departments = await Department.find({ isDeleted: { $ne: true } });

    // 2. Convert conversation history into Gemini's format
    //    Gemini uses "user" and "model" roles (not "assistant")
    const conversation = Array.isArray(history)
      ? history
          .filter((h) => h.role === "user" || h.role === "assistant")
          .map((h) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          }))
      : [];

    conversation.push({ role: "user", parts: [{ text: message }] });

    // 3. Call Gemini API
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversation,
      config: {
        systemInstruction: buildSystemPrompt(departments),
      },
    });

    const rawText = response.text || "";

    let parsed;
    try {
      parsed = parseGeminiJSON(rawText);
    } catch (parseErr) {
      // If JSON parsing fails, just send the raw text back as the reply
      console.error("Chatbot JSON parse error:", parseErr.message, rawText);
      return res.status(200).json({
        reply: rawText || "Sorry, something went wrong. Please try again.",
        suggestedDepartment: null,
        isEmergency: false,
        doctors: [],
      });
    }

    // 4. If a department was suggested, also fetch its available doctors
    let matchedDepartment = null;
    let doctors = [];
    if (parsed.suggestedDepartment) {
      matchedDepartment = departments.find(
        (d) =>
          d.name.toLowerCase().trim() ===
          String(parsed.suggestedDepartment).toLowerCase().trim(),
      );

      if (matchedDepartment) {
        doctors = await Doctor.find({
          department: matchedDepartment._id,
          available: true,
        }).select("name specialization fee experience");
      }
    }

    res.status(200).json({
      reply: parsed.reply,
      suggestedDepartment: matchedDepartment
        ? { id: matchedDepartment._id, name: matchedDepartment.name }
        : null,
      isEmergency: !!parsed.isEmergency,
      doctors,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      reply:
        "Sorry, the AI Receptionist is unavailable right now. Please try again shortly.",
      suggestedDepartment: null,
      isEmergency: false,
      doctors: [],
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VOICE — POST /api/chatbot/speak
// Turns a bot reply into natural-sounding speech with Gemini TTS, so the voice
// is the same on every browser (the browser's built-in voices sound robotic).
// Returns audio/wav. If anything fails the frontend falls back to the
// browser voice, so this endpoint is allowed to fail.
// ─────────────────────────────────────────────────────────────────────────────
const TTS_MODELS = [
  process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-tts",
  "gemini-3.1-flash-tts-preview", // fallback if the first model is unavailable
];
const TTS_VOICE = process.env.GEMINI_TTS_VOICE || "Kore";
const TTS_STYLE =
  process.env.GEMINI_TTS_STYLE ||
  "warm, calm and friendly, like a caring hospital receptionist speaking natural Hindi";
const TTS_MAX_CHARS = 600;

// Tiny in-memory cache (same text → same audio, e.g. the greeting) saves cost
const ttsCache = new Map();
const TTS_CACHE_MAX = 50;

// Public route + paid API → simple per-IP rate limit (20 requests / minute)
const ttsHits = new Map();
function ttsRateLimited(ip) {
  const now = Date.now();
  const recent = (ttsHits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  ttsHits.set(ip, recent);
  if (ttsHits.size > 5000) ttsHits.clear(); // keep memory bounded
  return recent.length > 20;
}

function cleanForTTS(text) {
  return String(text || "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TTS_MAX_CHARS);
}

async function generateSpeech(model, text) {
  const client = getGeminiClient();
  const interaction = await client.interactions.create({
    model,
    input: [
      {
        type: "user_input",
        content: [
          {
            type: "text",
            text,
            // Delivery style goes here — NOT in the text, or it gets read aloud
            annotations: [{ type: "speech_metadata", style: TTS_STYLE }],
          },
        ],
      },
    ],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice: TTS_VOICE }] },
  });

  const data = interaction.output_audio?.data;
  if (!data) throw new Error("No audio returned by Gemini");
  return Buffer.from(data, "base64"); // WAV (24 kHz, mono, 16-bit)
}

export const textToSpeech = async (req, res) => {
  try {
    if (ttsRateLimited(req.ip)) {
      return res.status(429).json({ message: "Too many voice requests" });
    }

    const text = cleanForTTS(req.body?.text);
    if (!text) return res.status(400).json({ message: "Text is required" });

    let audio = ttsCache.get(text);
    if (!audio) {
      let lastErr;
      for (const model of TTS_MODELS) {
        try {
          audio = await generateSpeech(model, text);
          break;
        } catch (err) {
          lastErr = err;
          console.error(`TTS failed on ${model}:`, err.message);
        }
      }
      if (!audio) throw lastErr;

      if (ttsCache.size >= TTS_CACHE_MAX) {
        ttsCache.delete(ttsCache.keys().next().value); // drop oldest
      }
      ttsCache.set(text, audio);
    }

    res.set("Content-Type", "audio/wav");
    res.set("Cache-Control", "private, max-age=3600");
    res.send(audio);
  } catch (error) {
    console.error("Chatbot TTS error:", error);
    res.status(500).json({ message: "Voice generation failed" });
  }
};
