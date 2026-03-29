import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "staff",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await authAPI.register(payload);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left Panel */}
      <div style={s.left}>
        <div style={s.brand}>
          <span style={s.brandIcon}>✚</span>
          <span style={s.brandName}>MediCore</span>
        </div>
        <div style={s.tagline}>
          <h1 style={s.tagH}>
            Hospital Management
            <br />
            Made Simple.
          </h1>
          <p style={s.tagP}>
            Join thousands of healthcare professionals managing their practice
            efficiently.
          </p>
        </div>
        <div style={s.featureList}>
          {[
            "Manage Doctors & Patients",
            "Track Appointments",
            "Real-time Dashboard",
            "Secure & HIPAA Ready",
          ].map((f) => (
            <div key={f} style={s.feature}>
              <span style={s.featureCheck}>✓</span>
              <span style={s.featureText}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Create Account</h2>
          <p style={s.cardSub}>Set up your MediCore account</p>

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <Field
              label="Full Name"
              name="name"
              type="text"
              placeholder="Dr. John Smith"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Field
              label="Email Address"
              name="email"
              type="email"
              placeholder="doctor@hospital.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <div style={s.row}>
              <Field
                label="Password"
                name="password"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Field
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={s.select}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? "Creating Account…" : "Create Account →"}
            </button>
          </form>

          <p style={s.loginLink}>
            Already have an account?{" "}
            <Link to="/login" style={s.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type, placeholder, value, onChange, required }) {
  return (
    <div style={s.fieldGroup}>
      <label style={s.label}>{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={s.input}
        onFocus={(e) => (e.target.style.borderColor = "#1a73e8")}
        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  // Left
  left: {
    width: "42%",
    background: "#0f172a",
    padding: "48px 52px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: {
    fontSize: 20,
    background: "#1a73e8",
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#fff",
  },
  brandName: { color: "#fff", fontSize: 20, fontWeight: 700 },
  tagline: { margin: "auto 0" },
  tagH: {
    color: "#fff",
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1.25,
    margin: "0 0 16px",
    letterSpacing: "-0.5px",
  },
  tagP: { color: "#94a3b8", fontSize: 15, lineHeight: 1.6, margin: 0 },
  featureList: { display: "flex", flexDirection: "column", gap: 12 },
  feature: { display: "flex", alignItems: "center", gap: 10 },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "rgba(26,115,232,0.15)",
    color: "#1a73e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  featureText: { color: "#cbd5e1", fontSize: 14 },
  // Right
  right: {
    flex: 1,
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "40px 40px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: 500,
  },
  cardTitle: {
    margin: "0 0 6px",
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },
  cardSub: { margin: "0 0 28px", color: "#64748b", fontSize: 14 },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 13,
    fontWeight: 500,
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#f8fafc",
  },
  select: {
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    background: "#f8fafc",
  },
  submitBtn: {
    padding: "13px",
    borderRadius: 10,
    border: "none",
    background: "#1a73e8",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
    letterSpacing: "-0.2px",
  },
  loginLink: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 13,
    color: "#64748b",
  },
  link: { color: "#1a73e8", fontWeight: 600, textDecoration: "none" },
};
