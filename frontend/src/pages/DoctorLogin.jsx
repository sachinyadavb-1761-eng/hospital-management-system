import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await authAPI.loginDoctor(form);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/doctor-dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>🩺</div>
          <span style={styles.brandName}>MediCore</span>
        </div>
        <div style={styles.heroText}>
          <h1 style={styles.heroHeading}>
            Doctor
            <br />
            Portal
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
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardBadge}>🩺 Doctor Access</div>
          <h2 style={styles.cardTitle}>Doctor Sign In</h2>
          <p style={styles.cardSub}>Enter your doctor credentials</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
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
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Access Doctor Dashboard →"}
            </button>
          </form>

          <div style={styles.divider} />

          <p style={styles.footer}>
            Not a doctor?{" "}
            <span style={styles.link} onClick={() => navigate("/login")}>
              Patient Login
            </span>
            {" · "}
            <span style={styles.link} onClick={() => navigate("/admin-login")}>
              Admin Login
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
    fontSize: 52,
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 16,
  },
  heroSub: { fontSize: 16, opacity: 0.85 },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
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
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "44px 44px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
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
  cardTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
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
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "12px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
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
  divider: { height: 1, background: "#f1f5f9", margin: "20px 0" },
  footer: { textAlign: "center", fontSize: 13, color: "#64748b", margin: 0 },
  link: { color: "#10b981", cursor: "pointer", fontWeight: 600 },
};
