// src/pages/Login.jsx
// Changes:
// 1. Password eye icon — show/hide toggle
// 2. useLanguage — translations
// 3. Responsive — mobile mein left panel hide, form full width

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";

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
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role !== "patient") {
        setError(
          user.role === "doctor"
            ? "Doctors must use the Doctor Login page."
            : "Admins must use the Admin Login page.",
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
    <div style={styles.page}>
      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 640px) {
          .login-left { display: none !important; }
          .login-right { padding: 24px 16px !important; }
          .login-card { padding: 32px 24px !important; }
        }
        @media (max-width: 900px) {
          .login-left { flex: 0 0 42% !important; padding: 32px 28px !important; }
        }
      `}</style>

      {/* LEFT */}
      <div style={styles.left} className="login-left">
        <div style={styles.brand}>
          <div style={styles.brandIcon}>✚</div>
          <span style={styles.brandName}>MediCore</span>
        </div>
        <div style={styles.heroText}>
          <h1 style={styles.heroHeading}>
            {t("patientLogin").split(" ")[0]}
            <br />
            {t("patientLogin").split(" ").slice(1).join(" ")}
          </h1>
          <p style={styles.heroSub}>{t("accessYourAccount")}</p>
        </div>
        <div style={styles.stats}>
          {[
            ["120+", t("statDoctors")],
            ["5,400+", t("statPatients")],
            ["98%", "Uptime"],
          ].map(([val, label]) => (
            <div key={label} style={styles.statItem}>
              <span style={styles.statVal}>{val}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right} className="login-right">
        {/* Language switcher at top */}
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          <LanguageSwitcher />
        </div>

        <div style={styles.card} className="login-card">
          <h2 style={styles.cardTitle}>{t("signIn")}</h2>
          <p style={styles.cardSub}>{t("accessYourAccount")}</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label}>{t("email")}</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password with Eye Icon */}
            <div style={styles.field}>
              <label style={styles.label}>{t("password")}</label>
              <div style={styles.passwordWrap}>
                <input
                  style={styles.inputPassword}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                  title={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? (
                    // Eye-off icon
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
                    // Eye icon
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
              style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
              disabled={loading}
            >
              {loading ? t("signingIn") : `${t("signIn")} →`}
            </button>
          </form>

          <p style={styles.footer}>
            {t("dontHaveAccount")}{" "}
            <span style={styles.link} onClick={() => navigate("/register")}>
              {t("register")}
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
  stats: { display: "flex", gap: 40, flexWrap: "wrap" },
  statItem: { display: "flex", flexDirection: "column" },
  statVal: { fontSize: 26, fontWeight: 800 },
  statLabel: { fontSize: 13, opacity: 0.7 },

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

  // Password field with eye icon
  passwordWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputPassword: {
    padding: "12px 44px 12px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderRadius: 6,
    transition: "color 0.2s",
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
