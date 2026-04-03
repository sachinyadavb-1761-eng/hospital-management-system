import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, departmentsAPI } from "../services/api";
import { useEffect } from "react";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" or "register"
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
        alert("Registration successful! Please login.");
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

          {/* Toggle Login/Register */}
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
              Sign In
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
              Register
            </button>
          </div>

          <h2 style={styles.cardTitle}>
            {mode === "login" ? "Doctor Sign In" : "Doctor Registration"}
          </h2>
          <p style={styles.cardSub}>
            {mode === "login"
              ? "Enter your doctor credentials"
              : "Fill in details to register"}
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Register only - Name */}
            {mode === "register" && (
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
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

            {/* Password */}
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

            {/* Register only - Doctor fields */}
            {mode === "register" && (
              <>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Phone</label>
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
                    <label style={styles.label}>Experience (years)</label>
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
                  <label style={styles.label}>Department</label>
                  <select
                    style={styles.input}
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">— Select Department —</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.icon} {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Specialization</label>
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
                    <label style={styles.label}>Consultation Fee (₹)</label>
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
                ? "Please wait…"
                : mode === "login"
                  ? "Access Doctor Dashboard →"
                  : "Register →"}
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
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "44px 44px",
    width: "100%",
    maxWidth: 460,
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
