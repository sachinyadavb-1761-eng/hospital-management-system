import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Login() {
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
      const res = await authAPI.login(form);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      // ✅ Backend se actual user object save ho raha hai
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Role ke hisaab se redirect
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/doctor-dashboard");
      }
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
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>✚</div>
          <span style={styles.brandName}>MediCore</span>
        </div>
        <div style={styles.heroText}>
          <h1 style={styles.heroHeading}>
            Hospital
            <br />
            Management
            <br />
            System
          </h1>
          <p style={styles.heroSub}>Streamlining care, one click at a time.</p>
        </div>
        <div style={styles.stats}>
          {[
            ["120+", "Doctors"],
            ["5,400+", "Patients"],
            ["98%", "Uptime"],
          ].map(([val, label]) => (
            <div key={label} style={styles.statItem}>
              <span style={styles.statVal}>{val}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Welcome back</h2>
          <p style={styles.cardSub}>Sign in to your account</p>

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
                autoComplete="email"
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
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p style={styles.footer}>
            Don't have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/register")}>
              Register
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
    background: "linear-gradient(135deg, #0f4c81 0%, #1a73e8 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 52px",
    color: "#fff",
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
  brandName: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" },
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
    letterSpacing: "-1px",
    margin: 0,
    marginBottom: 16,
  },
  heroSub: { fontSize: 17, opacity: 0.8, margin: 0 },
  stats: { display: "flex", gap: 40 },
  statItem: { display: "flex", flexDirection: "column" },
  statVal: { fontSize: 28, fontWeight: 800 },
  statLabel: { fontSize: 13, opacity: 0.7, marginTop: 2 },
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
    padding: "48px 44px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  cardSub: { color: "#64748b", fontSize: 15, margin: "6px 0 28px" },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    marginBottom: 20,
  },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 15,
    outline: "none",
    color: "#0f172a",
    transition: "border-color 0.2s",
  },
  btn: {
    marginTop: 8,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #0f4c81, #1a73e8)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.2px",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  footer: {
    textAlign: "center",
    marginTop: 24,
    color: "#64748b",
    fontSize: 14,
  },
  link: { color: "#1a73e8", fontWeight: 600, cursor: "pointer" },
};
