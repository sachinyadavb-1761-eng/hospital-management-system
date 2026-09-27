// src/pages/ResetPassword.jsx
// Redesign: same logic/hooks/API — only presentation layer changed.

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../services/api";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, newPassword);
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Link is invalid or has expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #5B6B80; }
        @media (max-width: 900px) {
          .rp-left { display: none !important; }
          .rp-right { padding: 24px 16px !important; }
        }
        .rp-card { animation: floatIn 0.5s ease; }
        @keyframes floatIn { from{opacity:0;transform:translateY(14px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes driftA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(18px,-20px)} }
        .in-focus:focus { border-color: rgba(45,212,191,0.55) !important; box-shadow: 0 0 0 4px rgba(45,212,191,0.12), 0 2px 6px rgba(0,0,0,0.3) inset !important; }
      `}</style>

      <div style={s.left} className="rp-left">
        <div style={s.orbA} />
        <div style={s.grid} />
        <div style={s.brand}>
          <div style={s.brandIcon}>✚</div>
          <span style={s.brandName}>MediCore</span>
        </div>
        <div style={s.heroText}>
          <h1 style={s.heroHeading}>
            Set a <span style={s.accent}>New Password</span>
          </h1>
        </div>
      </div>

      <div style={s.right} className="rp-right">
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 100 }}>
          <LanguageSwitcher />
        </div>

        <div style={s.card} className="rp-card">
          <h2 style={s.cardTitle}>Reset Password</h2>
          <p style={s.cardSub}>Enter your new password below.</p>

          {error && <div style={s.errorBox}>⚠ {error}</div>}
          {message && (
            <div style={s.successBox}>
              ✓ {message} Redirecting to login page...
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>New Password</label>
                <div style={s.passwordWrap}>
                  <input
                    style={s.inputPassword}
                    className="in-focus"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    style={s.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Confirm Password</label>
                <input
                  style={s.input}
                  className="in-focus"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
                disabled={loading}
              >
                {loading ? "Setting..." : "Set Password →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const tone = {
  bg: "#0A0E17",
  glassBorder: "rgba(255,255,255,0.09)",
  text: "#EEF2F7",
  muted: "#8CA0B8",
  teal: "#2DD4BF",
  tealDeep: "#0F766E",
};

const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: tone.bg,
    position: "relative",
    color: tone.text,
  },
  left: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${tone.bg} 0%, #0d1a1a 100%)`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "clamp(32px, 4vw, 52px)",
    borderRight: `1px solid ${tone.glassBorder}`,
  },
  orbA: {
    position: "absolute",
    top: "10%",
    left: "5%",
    width: 360,
    height: 360,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(45,212,191,0.16), transparent 70%)",
    filter: "blur(10px)",
    animation: "driftA 15s ease-in-out infinite",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
    backgroundSize: "38px 38px",
    maskImage: "linear-gradient(to bottom, black, transparent 88%)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 1,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#04201c",
    fontWeight: 900,
    fontSize: 18,
    boxShadow:
      "0 8px 16px -6px rgba(45,212,191,0.5), 0 1px 0 rgba(255,255,255,0.4) inset",
  },
  brandName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 21,
    fontWeight: 700,
    color: "#fff",
  },
  heroText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  heroHeading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(30px, 3.6vw, 44px)",
    fontWeight: 700,
    lineHeight: 1.15,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  accent: { color: tone.teal },

  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    position: "relative",
    background: tone.bg,
  },
  card: {
    background:
      "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderRadius: 22,
    padding: "44px 42px",
    width: "100%",
    maxWidth: 420,
    border: `1px solid ${tone.glassBorder}`,
    boxShadow:
      "0 30px 60px -24px rgba(2,6,15,0.85), 0 1px 0 rgba(255,255,255,0.07) inset",
  },
  cardTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 25,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
  },
  cardSub: { color: tone.muted, marginBottom: 24, fontSize: 14 },
  errorBox: {
    background: "rgba(255,122,122,0.1)",
    border: "1px solid rgba(255,122,122,0.3)",
    color: "#ffb4b4",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    fontSize: 13,
  },
  successBox: {
    background: "rgba(52,211,153,0.1)",
    border: "1px solid rgba(52,211,153,0.3)",
    color: "#86efac",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    fontSize: 13,
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#cbd5e1" },
  input: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: 14,
    outline: "none",
    width: "100%",
    background: "rgba(0,0,0,0.22)",
    color: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3) inset",
    transition: "all 0.2s",
  },
  passwordWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputPassword: {
    padding: "12px 44px 12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: 14,
    outline: "none",
    width: "100%",
    background: "rgba(0,0,0,0.22)",
    color: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3) inset",
    transition: "all 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: tone.muted,
  },
  btn: {
    marginTop: 10,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 15,
    boxShadow:
      "0 14px 28px -10px rgba(45,212,191,0.45), 0 1px 0 rgba(255,255,255,0.4) inset",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
};
