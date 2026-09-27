// src/pages/Login.jsx
// Redesign: same logic/hooks/API — only presentation layer changed.
// Matches Home.jsx: deep-navy glass, teal accent, Space Grotesk headings.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";
import { clearAuthData, setAuthData } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data;
      setAuthData(token, user);

      if (user.role !== "patient") {
        setError(
          user.role === "doctor"
            ? "Doctors must use the Doctor Login page."
            : "Admins must use the Admin Login page.",
        );
        clearAuthData();
        return;
      }
      navigate("/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || t("loginFailed"));
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
          .login-left { display: none !important; }
          .login-right { padding: 24px 16px !important; }
        }
        .login-card { animation: floatIn 0.5s ease; }
        @keyframes floatIn { from{opacity:0;transform:translateY(14px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes driftA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(18px,-20px)} }
        @keyframes driftB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-14px,16px)} }
        .in-focus:focus { border-color: rgba(45,212,191,0.55) !important; box-shadow: 0 0 0 4px rgba(45,212,191,0.12), 0 2px 6px rgba(0,0,0,0.3) inset !important; }
      `}</style>

      {/* LEFT */}
      <div style={s.left} className="login-left">
        <div style={s.orbA} />
        <div style={s.orbB} />
        <div style={s.grid} />
        <div style={s.brand}>
          <div style={s.brandIcon}>✚</div>
          <span style={s.brandName}>MediCore</span>
        </div>
        <div style={s.heroText}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowDot} />
            {t("patientLogin")}
          </div>
          <h1 style={s.heroHeading}>
            {t("patientLogin").split(" ")[0]}
            <br />
            <span style={s.accent}>
              {t("patientLogin").split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p style={s.heroSub}>{t("accessYourAccount")}</p>
        </div>
        <div style={s.stats}>
          {[
            ["120+", t("statDoctors")],
            ["5,400+", t("statPatients")],
            ["98%", "Uptime"],
          ].map(([val, label]) => (
            <div key={label} style={s.statItem}>
              <span style={s.statVal}>{val}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={s.right} className="login-right">
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
          <LanguageSwitcher />
        </div>

        <div style={s.card} className="login-card">
          <h2 style={s.cardTitle}>{t("signIn")}</h2>
          <p style={s.cardSub}>{t("accessYourAccount")}</p>

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>{t("email")}</label>
              <input
                style={s.input}
                className="in-focus"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div style={s.field}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={s.label}>{t("password")}</label>
                <span
                  style={s.forgotLink}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>
              </div>
              <div style={s.passwordWrap}>
                <input
                  style={s.inputPassword}
                  className="in-focus"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  style={s.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                  title={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
              disabled={loading}
            >
              {loading ? t("signingIn") : `${t("signIn")} →`}
            </button>
          </form>

          <p style={s.footer}>
            {t("dontHaveAccount")}{" "}
            <span style={s.link} onClick={() => navigate("/register")}>
              {t("register")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const tone = {
  bg: "#0A0E17",
  glass: "rgba(255,255,255,0.045)",
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
    background: `linear-gradient(160deg, ${tone.bg} 0%, #0d1a1a 100%)`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "clamp(32px, 4vw, 52px)",
    borderRight: `1px solid ${tone.glassBorder}`,
  },
  orbA: {
    position: "absolute",
    top: "6%",
    left: "0%",
    width: 380,
    height: 380,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(45,212,191,0.18), transparent 70%)",
    filter: "blur(10px)",
    animation: "driftA 15s ease-in-out infinite",
  },
  orbB: {
    position: "absolute",
    bottom: "0%",
    right: "0%",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,122,122,0.08), transparent 70%)",
    filter: "blur(10px)",
    animation: "driftB 18s ease-in-out infinite",
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
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: tone.muted,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
    width: "fit-content",
    textTransform: "capitalize",
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: tone.teal,
    boxShadow: "0 0 0 4px rgba(45,212,191,0.15)",
  },
  heroHeading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(30px, 3.6vw, 46px)",
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: 16,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  accent: { color: tone.teal },
  heroSub: { fontSize: 15, color: tone.muted, maxWidth: 380, lineHeight: 1.6 },
  stats: {
    display: "flex",
    gap: 32,
    flexWrap: "wrap",
    position: "relative",
    zIndex: 1,
  },
  statItem: { display: "flex", flexDirection: "column" },
  statVal: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: "#fff",
  },
  statLabel: { fontSize: 12.5, color: tone.muted },

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
    fontSize: 26,
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
    padding: "10px 12px",
    marginBottom: 16,
    fontSize: 13,
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#cbd5e1" },
  forgotLink: {
    fontSize: 13,
    color: tone.teal,
    cursor: "pointer",
    fontWeight: 600,
  },
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
    color: tone.muted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderRadius: 6,
  },
  btn: {
    marginTop: 6,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    boxShadow:
      "0 14px 28px -10px rgba(45,212,191,0.45), 0 1px 0 rgba(255,255,255,0.4) inset",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  footer: {
    textAlign: "center",
    marginTop: 20,
    color: tone.muted,
    fontSize: 14,
  },
  link: { color: tone.teal, cursor: "pointer", fontWeight: 600 },
};
