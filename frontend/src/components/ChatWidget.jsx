// src/components/ChatWidget.jsx
// AI Receptionist — floating chat widget (v2: text + voice)
// Patient describes symptoms (typing OR speaking), gets department suggestion,
// doctor list, and a booking link. Replies can be read aloud.
//
// Voice uses the browser's built-in Web Speech API:
//   - SpeechRecognition  → mic input  (Chrome / Edge / Safari; not Firefox)
//   - speechSynthesis    → read replies aloud (all modern browsers)
// No extra npm package, API key or backend change is needed.
// Note: the mic needs HTTPS (localhost is fine for development).

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { chatbotAPI } from "../services/api";
import { isLoggedIn } from "../utils/auth";
import { useLanguage } from "../context/LanguageSwitcher";

const GREETING = {
  role: "assistant",
  content:
    "Namaste! 🙏 Main aapka AI Receptionist hoon. Aap apne symptoms batayein, main aapko sahi department aur doctor tak pahunchane mein madad karunga.",
};

// ── Voice support detection ──────────────────────────────────────────────────
const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const synth =
  typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;

// App language code (from LanguageProvider) → BCP-47 code for speech recognition.
// Browser support differs per language; Hindi/English/Hinglish work best.
const SPEECH_LANG = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  te: "te-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  ur: "ur-IN",
  or: "or-IN",
  as: "as-IN",
  sa: "hi-IN",
};

// TTS reads emoji names out loud ("folded hands") — strip them first.
const cleanForSpeech = (text) =>
  String(text || "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/️/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Indic / Arabic script present? (Bot normally replies in Roman Hinglish.)
const hasNativeScript = (text) => /[ऀ-෿؀-ۿ]/.test(text);

// Prefer natural-sounding voices: Edge "Online (Natural)" neural voices and
// Chrome "Google" network voices sound far less robotic than the offline
// default voices (e.g. Microsoft Heera / Kalpana).
const voiceScore = (v) => {
  const n = v.name.toLowerCase();
  let score = 0;
  if (n.includes("natural") || n.includes("neural")) score += 100;
  if (n.includes("online")) score += 40;
  if (n.includes("google")) score += 60;
  if (n.includes("swara") || n.includes("madhur")) score += 20; // hi-IN neural voices
  if (v.localService) score -= 10;
  return score;
};

const pickVoice = (langCode) => {
  if (!synth) return null;
  const voices = synth.getVoices();
  const norm = (s) => s.replace("_", "-").toLowerCase();
  const target = norm(langCode);
  const best = (list) =>
    list.sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
  return (
    best(voices.filter((v) => norm(v.lang) === target)) ||
    best(voices.filter((v) => norm(v.lang).startsWith(target.split("-")[0]))) ||
    null
  );
};

const VOICE_ERRORS = {
  "not-allowed":
    "Mic ki permission blocked hai. Browser settings mein mic allow karein.",
  "service-not-allowed":
    "Mic ki permission blocked hai. Browser settings mein mic allow karein.",
  "no-speech": "Kuch sunai nahi diya. Dobara try karein.",
  "audio-capture": "Mic nahi mila. Mic connect karke dobara try karein.",
  network: "Voice service se connect nahi ho paya. Internet check karein.",
  "language-not-supported":
    "Is language ke liye voice support available nahi hai.",
};

export default function ChatWidget() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const recogLang = SPEECH_LANG[lang] || "en-IN";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false); // always read replies aloud
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [voiceError, setVoiceError] = useState("");

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const cancelledRef = useRef(false); // true when we stop the mic on purpose (don't auto-send)
  const audioRef = useRef(null); // currently playing Gemini voice (HTMLAudioElement)
  const speakIdRef = useRef(0); // lets us ignore stale voice responses after Stop

  // Refs let the long-lived speech callbacks always see fresh values
  const messagesRef = useRef(messages);
  const loadingRef = useRef(false);
  const recogLangRef = useRef(recogLang);
  const sendTextRef = useRef(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    recogLangRef.current = recogLang;
  }, [recogLang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading, listening, voiceError]);

  // Chrome loads voices asynchronously — touch getVoices() once so they're ready
  useEffect(() => {
    if (!synth) return;
    synth.getVoices();
    const warm = () => synth.getVoices();
    synth.addEventListener?.("voiceschanged", warm);
    return () => synth.removeEventListener?.("voiceschanged", warm);
  }, []);

  // Stops both the Gemini voice and the browser voice, and cancels in-flight requests
  const stopSpeaking = useCallback(() => {
    speakIdRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    synth?.cancel();
    setSpeakingIdx(null);
  }, []);

  // Stops the mic AND all speech
  const stopAllVoice = useCallback(() => {
    cancelledRef.current = true;
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
    stopSpeaking();
  }, [stopSpeaking]);

  // Stop mic + speech when widget is closed or unmounted
  useEffect(() => {
    if (!open) stopAllVoice();
  }, [open, stopAllVoice]);

  useEffect(() => () => stopAllVoice(), [stopAllVoice]);

  // ── Voice helpers ──────────────────────────────────────────────────────────
  // Browser voice - robotic, used only as a fallback when Gemini voice fails
  const speakWithBrowser = (clean, idx) => {
    if (!synth) {
      setSpeakingIdx(null);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    // A Hindi voice pronounces Hinglish far better than an English one
    u.lang = hasNativeScript(clean) ? recogLangRef.current : "hi-IN";
    let voice = pickVoice(u.lang);
    if (!voice && u.lang !== "en-IN") {
      u.lang = "en-IN"; // no Hindi voice installed -> fall back to English
      voice = pickVoice(u.lang);
    }
    if (voice) u.voice = voice;
    u.rate = 1;
    u.pitch = 1;
    u.onstart = () => setSpeakingIdx(idx);
    u.onend = () => setSpeakingIdx((cur) => (cur === idx ? null : cur));
    u.onerror = () => setSpeakingIdx((cur) => (cur === idx ? null : cur));
    synth.speak(u);
  };

  // Natural voice from the backend (Gemini TTS); falls back to the browser voice
  const speak = async (text, idx) => {
    const clean = cleanForSpeech(text);
    if (!clean) return;

    stopSpeaking();
    const myId = speakIdRef.current;
    setSpeakingIdx(idx); // shows "Stop" while the voice is being generated

    try {
      const res = await chatbotAPI.speak(clean);
      if (myId !== speakIdRef.current) return; // user pressed Stop / started something else

      const url = URL.createObjectURL(res.data);
      const audio = new Audio(url);
      audioRef.current = audio;
      const done = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
        setSpeakingIdx((cur) => (cur === idx ? null : cur));
      };
      audio.onended = done;
      audio.onerror = done;
      await audio.play();
    } catch {
      if (myId !== speakIdRef.current) return;
      audioRef.current = null;
      speakWithBrowser(clean, idx);
    }
  };

  const toggleSpeakMessage = (text, idx) => {
    if (speakingIdx === idx) {
      stopSpeaking();
    } else {
      speak(text, idx);
    }
  };

  const startListening = () => {
    if (!SpeechRecognitionAPI || loadingRef.current) return;

    stopSpeaking(); // don't let the mic hear the bot talking
    setVoiceError("");
    cancelledRef.current = false;

    const rec = new SpeechRecognitionAPI();
    rec.lang = recogLangRef.current;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    let finalText = "";
    let interimText = "";

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      setInput((finalText + interimText).trim()); // live transcript in the input box
    };

    rec.onerror = (e) => {
      if (e.error === "aborted") return;
      setVoiceError(VOICE_ERRORS[e.error] || "Voice input mein problem aayi.");
    };

    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      // Some browsers end without marking the last phrase final — keep it
      const text = (finalText || interimText).trim();
      if (!cancelledRef.current && text) {
        sendTextRef.current?.(text, true); // auto-send what the patient said
      } else if (!text) {
        setInput("");
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch {
      setVoiceError("Mic start nahi ho paya. Dobara try karein.");
    }
  };

  const stopListening = () => {
    // Normal stop → onend fires and sends what was captured
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
  };

  const toggleMic = () => (listening ? stopListening() : startListening());

  const toggleSpeakReplies = () => {
    setSpeakReplies((v) => {
      if (v) stopSpeaking();
      return !v;
    });
  };

  // ── Sending ────────────────────────────────────────────────────────────────
  const sendText = async (rawText, viaVoice = false) => {
    const text = rawText.trim();
    if (!text || loadingRef.current) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messagesRef.current, userMsg];
    messagesRef.current = newMessages;
    setMessages(newMessages);
    setInput("");
    setVoiceError("");
    setLoading(true);
    loadingRef.current = true;

    try {
      // Only send role/content history (exclude extra metadata like doctors, isEmergency)
      const history = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await chatbotAPI.sendMessage(text, history.slice(0, -1));
      const { reply, suggestedDepartment, isEmergency, doctors } = res.data;

      const botMsg = {
        role: "assistant",
        content: reply,
        suggestedDepartment,
        isEmergency,
        doctors,
      };
      const botIdx = newMessages.length; // index this reply will have in `messages`
      messagesRef.current = [...newMessages, botMsg];
      setMessages(messagesRef.current);

      // Spoke to the bot → bot speaks back. Typed → only if speaker toggle is on.
      if (viaVoice || speakReplies) speak(reply, botIdx);
    } catch {
      const errMsg = {
        role: "assistant",
        content:
          "Sorry, I couldn't connect right now. Please try again shortly.",
      };
      messagesRef.current = [...newMessages, errMsg];
      setMessages(messagesRef.current);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // Always point the ref at the latest closure (fresh speakReplies etc.)
  sendTextRef.current = sendText;

  const handleSend = (e) => {
    e?.preventDefault();
    if (listening) {
      // Send pressed while mic is on: stop mic quietly and send what's in the box
      cancelledRef.current = true;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      setListening(false);
    }
    sendText(input, false);
  };

  const handleBookClick = () => {
    setOpen(false);
    navigate(isLoggedIn() ? "/patient/dashboard" : "/login");
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={styles.launcher}
        aria-label="Chat with AI Receptionist"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div style={styles.window}>
          <div style={styles.header}>
            <div style={styles.headerDot} />
            <div style={{ flex: 1 }}>
              <div style={styles.headerTitle}>AI Receptionist</div>
              <div style={styles.headerSubtitle}>
                {SpeechRecognitionAPI
                  ? "Type or speak your symptoms"
                  : "Tell me your symptoms, I'll help"}
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSpeakReplies}
              style={{
                ...styles.speakToggle,
                ...(speakReplies ? styles.speakToggleOn : {}),
              }}
              title={
                speakReplies
                  ? "Replies are read aloud (tap to mute)"
                  : "Read replies aloud"
              }
              aria-label="Toggle reading replies aloud"
              aria-pressed={speakReplies}
            >
              {speakReplies ? "🔊" : "🔇"}
            </button>
          </div>

          <div style={styles.body} ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubbleRow,
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(m.role === "user"
                      ? styles.userBubble
                      : styles.botBubble),
                    ...(m.isEmergency ? styles.emergencyBubble : {}),
                  }}
                >
                  {m.content}

                  {m.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => toggleSpeakMessage(m.content, i)}
                      style={styles.listenBtn}
                      aria-label={
                        speakingIdx === i ? "Stop speaking" : "Listen to reply"
                      }
                    >
                      {speakingIdx === i ? "⏹ Stop" : "🔊 Suno"}
                    </button>
                  )}

                  {m.suggestedDepartment && (
                    <div style={styles.deptTag}>
                      🏥 Suggested: {m.suggestedDepartment.name}
                    </div>
                  )}

                  {m.doctors && m.doctors.length > 0 && (
                    <div style={styles.doctorList}>
                      {m.doctors.map((d) => (
                        <div key={d._id} style={styles.doctorCard}>
                          <div style={styles.doctorName}>{d.name}</div>
                          <div style={styles.doctorMeta}>
                            {d.specialization} · {d.experience} yrs exp · ₹
                            {d.fee}
                          </div>
                        </div>
                      ))}
                      <button style={styles.bookBtn} onClick={handleBookClick}>
                        Book Appointment →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={styles.bubbleRow}>
                <div style={{ ...styles.bubble, ...styles.botBubble }}>
                  <span style={styles.typingDot}>●</span>
                  <span
                    style={{ ...styles.typingDot, animationDelay: "0.15s" }}
                  >
                    ●
                  </span>
                  <span style={{ ...styles.typingDot, animationDelay: "0.3s" }}>
                    ●
                  </span>
                </div>
              </div>
            )}

            {voiceError && <div style={styles.voiceError}>{voiceError}</div>}
          </div>

          <form onSubmit={handleSend} style={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                listening ? "Listening… boliye 🎤" : "Type your symptom..."
              }
              style={styles.input}
              disabled={loading}
            />

            {SpeechRecognitionAPI && (
              <button
                type="button"
                onClick={toggleMic}
                style={{
                  ...styles.micBtn,
                  ...(listening ? styles.micBtnActive : {}),
                }}
                disabled={loading}
                aria-label={
                  listening ? "Stop listening" : "Speak your symptoms"
                }
                title={listening ? "Tap to stop" : "Tap to speak"}
              >
                {listening ? "⏹" : "🎤"}
              </button>
            )}

            <button type="submit" style={styles.sendBtn} disabled={loading}>
              ➤
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes chatbot-blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes chatbot-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          70%  { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </>
  );
}

const styles = {
  launcher: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(14, 165, 233, 0.45)",
    zIndex: 1000,
  },
  window: {
    position: "fixed",
    bottom: 96,
    right: 24,
    width: 340,
    maxWidth: "calc(100vw - 32px)",
    height: 460,
    maxHeight: "calc(100vh - 140px)",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    background: "#0a0f1e",
    borderBottom: "1px solid #1e293b",
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981",
  },
  headerTitle: { color: "#fff", fontWeight: 600, fontSize: 14 },
  headerSubtitle: { color: "#94a3b8", fontSize: 11 },
  speakToggle: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
    fontSize: 14,
    cursor: "pointer",
  },
  speakToggleOn: {
    background: "#0ea5e9",
    color: "#fff",
    border: "1px solid #38bdf8",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  bubbleRow: { display: "flex" },
  bubble: {
    maxWidth: "82%",
    padding: "9px 12px",
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.45,
  },
  userBubble: {
    background: "#0ea5e9",
    color: "#fff",
    borderBottomRightRadius: 3,
  },
  botBubble: {
    background: "#1e293b",
    color: "#e2e8f0",
    borderBottomLeftRadius: 3,
  },
  emergencyBubble: {
    background: "#7f1d1d",
    color: "#fecaca",
    border: "1px solid #f87171",
  },
  listenBtn: {
    display: "block",
    marginTop: 6,
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: "2px 9px",
    fontSize: 11,
    cursor: "pointer",
  },
  deptTag: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 600,
    color: "#38bdf8",
  },
  doctorList: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  doctorCard: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "6px 10px",
  },
  doctorName: { color: "#fff", fontSize: 12.5, fontWeight: 600 },
  doctorMeta: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
  bookBtn: {
    marginTop: 4,
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  typingDot: {
    display: "inline-block",
    marginRight: 3,
    animation: "chatbot-blink 1s infinite",
  },
  voiceError: {
    alignSelf: "center",
    background: "#451a03",
    color: "#fcd34d",
    border: "1px solid #92400e",
    borderRadius: 10,
    padding: "6px 10px",
    fontSize: 11.5,
    textAlign: "center",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid #1e293b",
    background: "#0a0f1e",
  },
  input: {
    flex: 1,
    minWidth: 0,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 20,
    padding: "9px 14px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
  },
  micBtn: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: "50%",
    background: "#1e293b",
    color: "#fff",
    border: "1px solid #334155",
    fontSize: 15,
    cursor: "pointer",
  },
  micBtnActive: {
    background: "#ef4444",
    border: "1px solid #fca5a5",
    animation: "chatbot-pulse 1.2s infinite",
  },
  sendBtn: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: "50%",
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
  },
};
