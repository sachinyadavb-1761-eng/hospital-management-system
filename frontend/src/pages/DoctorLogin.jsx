// src/pages/DoctorLogin.jsx
// Changes:
// 1. Password eye icon — show/hide toggle
// 2. useLanguage — translations
// 3. Responsive — mobile friendly

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, departmentsAPI } from "../services/api";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";

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
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
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
    <div style={styles.page}>
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .doctor-left { display: none !important; }
          .doctor-right { padding: 24px 16px !important; }
          .doctor-card { padding: 28px 20px !important; }
          .doctor-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .doctor-left { flex: 0 0 42% !important; padding: 32px 24px !important; }
        }
      `}</style>

      {/* LEFT */}
      <div style={styles.left} className="doctor-left">
        <div style={styles.brand}>
          <div style={styles.brandIcon}>🩺</div>
          <span style={styles.brandName}>MediCore</span>
        </div>
        <div style={styles.heroText}>
          <h1 style={styles.heroHeading}>
            {t("doctorPortal").split(" ")[0]}
            <br />
            {t("doctorPortal").split(" ").slice(1).join(" ")}
          </h1>
          <p style={styles.heroSub}>
            Manage your appointments, patients and schedule.
          </p>
        </div>
        <div style={styles.features}>
          {[
            ["📅", "View today's schedule"],
            ["👤", "Manage patient records"],
            ["✅", "Update appointment status"],
          ].map(([icon, text]) => (
            <div key={text} style={styles.featureItem}>
              <span style={styles.featureIcon}>{icon}</span>
              <span style={styles.featureText}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right} className="doctor-right">
        {/* Language switcher */}
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          <LanguageSwitcher />
        </div>

        <div style={styles.card} className="doctor-card">
          <div style={styles.cardBadge}>{t("doctorAccess")}</div>

          {/* Toggle */}
          <div style={styles.toggleRow}>
            <button
              style={{
                ...styles.toggleBtn,
                ...(mode === "login" ? styles.toggleActive : {}),
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
                ...styles.toggleBtn,
                ...(mode === "register" ? styles.toggleActive : {}),
              }}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              {t("register")}
            </button>
          </div>

          <h2 style={styles.cardTitle}>
            {mode === "login" ? t("doctorSignIn") : t("doctorRegistration")}
          </h2>
          <p style={styles.cardSub}>
            {mode === "login"
              ? t("enterDoctorCredentials")
              : t("fillDetailsToRegister")}
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Register: Name */}
            {mode === "register" && (
              <div style={styles.field}>
                <label style={styles.label}>{t("fullName")}</label>
                <input
                  style={styles.input}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label}>{t("email")}</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="doctor@hospital.com"
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

            {/* Register only - Doctor fields */}
            {mode === "register" && (
              <>
                <div style={styles.row} className="doctor-row">
                  <div style={styles.field}>
                    <label style={styles.label}>{t("phone2")}</label>
                    <input
                      style={styles.input}
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>{t("experienceYears")}</label>
                    <input
                      style={styles.input}
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
                <div style={styles.field}>
                  <label style={styles.label}>{t("department")}</label>
                  <select
                    style={styles.input}
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
                <div style={styles.row} className="doctor-row">
                  <div style={styles.field}>
                    <label style={styles.label}>{t("specialization")}</label>
                    <input
                      style={styles.input}
                      type="text"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Cardiologist"
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>{t("consultationFee")}</label>
                    <input
                      style={styles.input}
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
              style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
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
    background: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 52px",
    color: "#fff",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandIcon: {
    fontSize: 24,
    background: "rgba(255,255,255,0.2)",
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 22, fontWeight: 700 },
  heroText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heroHeading: {
    fontSize: "clamp(32px, 4vw, 52px)",
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 16,
  },
  heroSub: { fontSize: 16, opacity: 0.85 },
  features: { display: "flex", flexDirection: "column", gap: 12 },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 14px",
  },
  featureIcon: { fontSize: 18 },
  featureText: { fontSize: 14, fontWeight: 500 },

  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    overflowY: "auto",
    position: "relative",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "44px 44px",
    width: "100%",
    maxWidth: 460,
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    boxSizing: "border-box",
  },
  cardBadge: {
    display: "inline-block",
    background: "#d1fae5",
    color: "#065f46",
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: 20,
    marginBottom: 16,
  },
  toggleRow: {
    display: "flex",
    gap: 8,
    background: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    padding: "9px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  toggleActive: {
    background: "#fff",
    color: "#0f172a",
    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 4px",
  },
  cardSub: { color: "#64748b", marginBottom: 24 },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: "10px 12px",
    marginBottom: 16,
    fontSize: 13,
  },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "12px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    background: "#f8fafc",
    width: "100%",
    boxSizing: "border-box",
  },

  // Eye icon
  passwordWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputPassword: {
    padding: "12px 44px 12px 12px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    background: "#f8fafc",
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
    marginTop: 6,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #065f46, #10b981)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  btnDisabled: { opacity: 0.6 },
};
