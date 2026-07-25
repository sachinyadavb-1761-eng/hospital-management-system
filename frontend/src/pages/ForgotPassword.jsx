// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await authAPI.forgotPassword(email);
      setMessage(res.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Kuch gadbad ho gayi, dobara try karo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 640px) {
          .fp-left { display: none !important; }
          .fp-right { padding: 24px 16px !important; }
          .fp-card { padding: 32px 24px !important; }
        }
        @media (max-width: 900px) {
          .fp-left { flex: 0 0 42% !important; padding: 32px 28px !important; }
        }
      `}</style>

      <div style={styles.left} className="fp-left">
        <div style={styles.brand}>
          <div style={styles.brandIcon}>✚</div>
          <span style={styles.brandName}>MediCore</span>
        </div>
        <div style={styles.heroText}>
          <h1 style={styles.heroHeading}>
            Password
            <br />
            Bhool Gaye?
          </h1>
          <p style={styles.heroSub}>
            Koi baat nahi, email daalo aur reset link paa lo.
          </p>
        </div>
      </div>

      <div style={styles.right} className="fp-right">
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 100 }}>
          <LanguageSwitcher />
        </div>

        <div style={styles.card} className="fp-card">
          <h2 style={styles.cardTitle}>Forgot Password</h2>
          <p style={styles.cardSub}>
            Apni registered email daalo, hum reset link bhej denge.
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}
          {message && <div style={styles.successBox}>{message}</div>}

          {!message && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>{t("email")}</label>
                <input
                  style={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.btn,
                  ...(loading ? styles.btnDisabled : {}),
                }}
                disabled={loading}
              >
                {loading ? "Bhej rahe hain..." : "Reset Link Bhejo →"}
              </button>
            </form>
          )}

          <p style={styles.footer}>
            Yaad aa gaya password?{" "}
            <span style={styles.link} onClick={() => navigate("/login")}>
              Login karo
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f0f4f8",
    position: "relative",
  },
  left: {
    flex: 1,
    background: "linear-gradient(135deg, #0f4c81 0%, #1a73e8 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 52px",
    color: "#fff",
    minHeight: "100vh",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandIcon: {
    fontSize: 28,
    background: "rgba(255,255,255,0.2)",
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  brandName: { fontSize: 22, fontWeight: 700 },
  heroText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heroHeading: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: 800,
    lineHeight: 1.1,
  },
  heroSub: { fontSize: 16, opacity: 0.8, marginTop: 10 },
  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    position: "relative",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "48px 44px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    boxSizing: "border-box",
  },
  cardTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a" },
  cardSub: { color: "#64748b", marginBottom: 24 },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  successBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    marginTop: 10,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #0f4c81, #1a73e8)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 15,
  },
  btnDisabled: { opacity: 0.6 },
  footer: { textAlign: "center", marginTop: 20 },
  link: { color: "#1a73e8", cursor: "pointer", fontWeight: 600 },
};
