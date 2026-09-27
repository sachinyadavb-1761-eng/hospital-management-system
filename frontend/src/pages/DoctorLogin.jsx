// src/pages/DoctorLogin.jsx
// Redesign: same logic/hooks/API — only presentation layer changed.
// Visual language matches Home.jsx: deep-navy glass + embossed 3D shadows.
// Doctor area uses an emerald accent (kept close to original green identity).

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, departmentsAPI } from "../services/api";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";
import { setAuthData } from "../utils/auth";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
    phone: "",
    specialization: "",
    experience: "",
    department: "",
    fee: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    departmentsAPI
      .getAll()
      .then((res) => setDepartments(res.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        const res = await authAPI.loginDoctor({
          email: form.email,
          password: form.password,
        });
        const { token, user } = res.data;
        setAuthData(token, user);
        navigate("/doctor-dashboard");
      } else {
        await authAPI.register(form);
        setMode("login");
        setError("");
        alert(t("registrationSuccess"));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again.",
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
          .doctor-left { display: none !important; }
          .doctor-right { padding: 24px 16px !important; }
          .doctor-row { grid-template-columns: 1fr !important; }
        }
        .doctor-card { animation: floatIn 0.5s ease; }
        @keyframes floatIn { from{opacity:0;transform:translateY(14px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes driftA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(18px,-20px)} }
        @keyframes driftB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-14px,16px)} }
        .in-focus:focus { border-color: rgba(52,211,153,0.55) !important; box-shadow: 0 0 0 4px rgba(52,211,153,0.12), 0 2px 6px rgba(0,0,0,0.3) inset !important; }
      `}</style>

      {/* LEFT */}
      <div style={s.left} className="doctor-left">
        <div style={s.orbA} />
        <div style={s.orbB} />
        <div style={s.grid} />
        <div style={s.brand}>
          <div style={s.brandIcon}>🩺</div>
          <span style={s.brandName}>MediCore</span>
        </div>
        <div style={s.heroText}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowDot} />
            {t("doctorAccess")}
          </div>
          <h1 style={s.heroHeading}>
            {t("doctorPortal").split(" ")[0]}
            <br />
            <span style={s.accent}>
              {t("doctorPortal").split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p style={s.heroSub}>
            Manage your appointments, patients and schedule.
          </p>
        </div>
        <div style={s.features}>
          {[
            ["📅", "View today's schedule"],
            ["👤", "Manage patient records"],
            ["✅", "Update appointment status"],
          ].map(([icon, text]) => (
            <div key={text} style={s.featureItem}>
              <span style={s.featureIcon}>{icon}</span>
              <span style={s.featureText}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={s.right} className="doctor-right">
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
          <LanguageSwitcher />
        </div>

        <div style={s.card} className="doctor-card">
          <div style={s.cardBadge}>{t("doctorAccess")}</div>

          <div style={s.toggleRow}>
            <button
              style={{
                ...s.toggleBtn,
                ...(mode === "login" ? s.toggleActive : {}),
              }}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              {t("signIn")}
            </button>
            <button
              style={{
                ...s.toggleBtn,
                ...(mode === "register" ? s.toggleActive : {}),
              }}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              {t("register")}
            </button>
          </div>

          <h2 style={s.cardTitle}>
            {mode === "login" ? t("doctorSignIn") : t("doctorRegistration")}
          </h2>
          <p style={s.cardSub}>
            {mode === "login"
              ? t("enterDoctorCredentials")
              : t("fillDetailsToRegister")}
          </p>

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            {mode === "register" && (
              <div style={s.field}>
                <label style={s.label}>{t("fullName")}</label>
                <input
                  style={s.input}
                  className="in-focus"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
            )}

            <div style={s.field}>
              <label style={s.label}>{t("email")}</label>
              <input
                style={s.input}
                className="in-focus"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="doctor@hospital.com"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>{t("password")}</label>
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

            {mode === "register" && (
              <>
                <div style={s.row} className="doctor-row">
                  <div style={s.field}>
                    <label style={s.label}>{t("phone2")}</label>
                    <input
                      style={s.input}
                      className="in-focus"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>{t("experienceYears")}</label>
                    <input
                      style={s.input}
                      className="in-focus"
                      type="number"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      placeholder="5"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>{t("department")}</label>
                  <select
                    style={s.input}
                    className="in-focus"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t("selectDepartment")}</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.icon} {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.row} className="doctor-row">
                  <div style={s.field}>
                    <label style={s.label}>{t("specialization")}</label>
                    <input
                      style={s.input}
                      className="in-focus"
                      type="text"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Cardiologist"
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>{t("consultationFee")}</label>
                    <input
                      style={s.input}
                      className="in-focus"
                      type="number"
                      name="fee"
                      value={form.fee}
                      onChange={handleChange}
                      placeholder="500"
                      min="0"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
              disabled={loading}
            >
              {loading
                ? t("pleaseWait")
                : mode === "login"
                  ? t("accessDoctorDashboard")
                  : t("registerArrow")}
            </button>
          </form>
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
  emerald: "#34D399",
  emeraldDeep: "#047857",
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
    background: `linear-gradient(160deg, ${tone.bg} 0%, #0e1c17 100%)`,
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
      "radial-gradient(circle, rgba(52,211,153,0.18), transparent 70%)",
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
      "radial-gradient(circle, rgba(45,212,191,0.10), transparent 70%)",
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
    background: `linear-gradient(145deg, ${tone.emerald}, ${tone.emeraldDeep})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    boxShadow:
      "0 8px 16px -6px rgba(52,211,153,0.5), 0 1px 0 rgba(255,255,255,0.4) inset",
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
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: tone.emerald,
    boxShadow: "0 0 0 4px rgba(52,211,153,0.15)",
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
  accent: { color: tone.emerald },
  heroSub: { fontSize: 15, color: tone.muted, maxWidth: 380, lineHeight: 1.6 },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    position: "relative",
    zIndex: 1,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: tone.glass,
    borderRadius: 12,
    padding: "12px 14px",
    border: `1px solid ${tone.glassBorder}`,
    boxShadow: "0 14px 28px -18px rgba(2,6,15,0.7)",
  },
  featureIcon: { fontSize: 18 },
  featureText: { fontSize: 13.5, fontWeight: 500, color: "#cbd5e1" },

  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    position: "relative",
    overflowY: "auto",
    background: tone.bg,
  },
  card: {
    background:
      "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderRadius: 22,
    padding: "40px 40px",
    width: "100%",
    maxWidth: 460,
    border: `1px solid ${tone.glassBorder}`,
    boxShadow:
      "0 30px 60px -24px rgba(2,6,15,0.85), 0 1px 0 rgba(255,255,255,0.07) inset",
  },
  cardBadge: {
    display: "inline-block",
    background: "rgba(52,211,153,0.14)",
    color: tone.emerald,
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: 20,
    marginBottom: 16,
  },
  toggleRow: {
    display: "flex",
    gap: 6,
    background: "rgba(0,0,0,0.25)",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    border: `1px solid ${tone.glassBorder}`,
  },
  toggleBtn: {
    flex: 1,
    padding: "9px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: tone.muted,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  toggleActive: {
    background: tone.emerald,
    color: "#052e21",
    boxShadow: "0 4px 10px -2px rgba(52,211,153,0.4)",
  },
  cardTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 25,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 4px",
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
  form: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
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
    background: `linear-gradient(145deg, ${tone.emerald}, ${tone.emeraldDeep})`,
    color: "#052e21",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    boxShadow:
      "0 14px 28px -10px rgba(52,211,153,0.45), 0 1px 0 rgba(255,255,255,0.4) inset",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
};
