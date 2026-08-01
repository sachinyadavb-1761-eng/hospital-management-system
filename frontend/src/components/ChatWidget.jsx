// src/components/ChatWidget.jsx
// AI Receptionist — floating chat widget (MVP v1)
// Patient describes symptoms, gets department suggestion, doctor list, and a booking link

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatbotAPI } from "../services/api";
import { isLoggedIn } from "../utils/auth";

const GREETING = {
  role: "assistant",
  content:
    "Namaste! 🙏 Main aapka AI Receptionist hoon. Aap apne symptoms batayein, main aapko sahi department aur doctor tak pahunchane mein madad karunga.",
};

export default function ChatWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Only send role/content history (exclude extra metadata like doctors, isEmergency)
      const history = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await chatbotAPI.sendMessage(text, history.slice(0, -1));
      const { reply, suggestedDepartment, isEmergency, doctors } = res.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          suggestedDepartment,
          isEmergency,
          doctors,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
            <div>
              <div style={styles.headerTitle}>AI Receptionist</div>
              <div style={styles.headerSubtitle}>
                Tell me your symptoms, I'll help
              </div>
            </div>
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
          </div>

          <form onSubmit={handleSend} style={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your symptom..."
              style={styles.input}
              disabled={loading}
            />
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
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid #1e293b",
    background: "#0a0f1e",
  },
  input: {
    flex: 1,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 20,
    padding: "9px 14px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
  },
};
