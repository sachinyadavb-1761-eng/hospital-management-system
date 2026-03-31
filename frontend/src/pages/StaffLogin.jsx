import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function StaffLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data;

      // ✅ Allow only admin & doctor
      if (user.role !== "admin" && user.role !== "doctor") {
        setError("Access Denied: Not a staff member.");
        return;
      }

      // ✅ Save only if valid staff
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/doctor/dashboard"); // ✅ fixed
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Staff Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: 40,
          borderRadius: 20,
          width: 400,
          color: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center" }}>🛡️ Staff Portal</h2>
        <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: 20 }}>
          Doctors & Admins Only
        </p>

        {error && (
          <div style={{ color: "#ef4444", marginBottom: 15 }}>{error}</div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 15 }}
        >
          <input
            type="email"
            placeholder="Staff Email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ padding: 12, borderRadius: 8, border: "none" }}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ padding: 12, borderRadius: 8, border: "none" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 12,
              background: "#0ea5e9",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Logging in..." : "Login to Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}
