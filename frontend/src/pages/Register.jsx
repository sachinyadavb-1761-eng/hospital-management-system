import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, departmentsAPI } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
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
    departmentsAPI.getAll().then((res) => setDepartments(res.data || [])).catch(() => {});
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
      await authAPI.register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = form.role === "doctor";

  return (
    <div style={styles.page}>
      {/* LEFT SIDE */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>✚</div>
          <span style={styles.brandName}>MediCore</span>
        </div>
        <div style={styles.heroText}>
          <h1 style={styles.heroHeading}>
            Join <br /> MediCore <br /> Today
          </h1>
          <p style={styles.heroSub}>
            {isDoctor
              ? "Register as a doctor and start managing patients."
              : "Create your patient account and get started."}
          </p>
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

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {isDoctor ? "Doctor Registration" : "Create Patient Account"}
          </h2>
          <p style={styles.cardSub}>Fill in details to register</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Role */}
            <div style={styles.field}>
              <label style={styles.label}>Register as</label>
              <div style={styles.roleToggle}>
                {["patient", "doctor"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    style={{
                      ...styles.roleBtn,
                      ...(form.role === r ? styles.roleBtnActive : {}),
                    }}
                    onClick={() => setForm({ ...form, role: r })}
                  >
                    {r === "patient" ? "👤 Patient" : "🩺 Doctor"}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
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

            {/* Doctor-only fields */}
            {isDoctor && (
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
                  <label style={styles.label}>Department *</label>
                  <select
                    style={styles.select}
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
              {loading ? "Registering…" : "Register →"}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/login")}>
              Sign In
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
  brandName: { fontSize: 22, fontWeight: 700 },
  heroText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heroHeading: {
    fontSize: 48,
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 16,
  },
  heroSub: { fontSize: 16, opacity: 0.8 },
  stats: { display: "flex", gap: 40 },
  statItem: { display: "flex", flexDirection: "column" },
  statVal: { fontSize: 26, fontWeight: 800 },
  statLabel: { fontSize: 13, opacity: 0.7 },
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
    padding: "40px 44px",
    width: "100%",
    maxWidth: 460,
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
  },
  cardTitle: { fontSize: 24, fontWeight: 800, color: "#0f172a" },
  cardSub: { color: "#64748b", marginBottom: 20, marginTop: 2 },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: "10px",
    marginBottom: 16,
    fontSize: 13,
  },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "11px 12px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    background: "#f8fafc",
  },
  select: {
    padding: "11px 12px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    background: "#f8fafc",
  },
  roleToggle: {
    display: "flex",
    gap: 8,
    background: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
  },
  roleBtn: {
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
  roleBtnActive: {
    background: "#fff",
    color: "#0f172a",
    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
  },
  btn: {
    marginTop: 6,
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
  footer: { textAlign: "center", marginTop: 18 },
  link: { color: "#1a73e8", cursor: "pointer", fontWeight: 600 },
};
