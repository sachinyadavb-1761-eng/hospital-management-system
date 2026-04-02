import { useNavigate } from "react-router-dom";
import { getUser, getDashboardPath, isLoggedIn } from "../utils/auth";

export default function Unauthorized() {
  const navigate = useNavigate();
  const user = getUser();

  const handleGoBack = () => {
    if (isLoggedIn() && user?.role) {
      navigate(getDashboardPath(user.role));
    } else {
      navigate("/login");
    }
  };

  const roleLabels = {
    admin: "Admin Dashboard",
    doctor: "Doctor Dashboard",
    patient: "Patient Dashboard",
  };

  const destinationLabel = user?.role
    ? roleLabels[user.role] || "Dashboard"
    : "Login";

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Icon */}
        <div style={s.iconWrap}>
          <span style={s.icon}>🚫</span>
        </div>

        {/* Heading */}
        <h1 style={s.title}>Access Denied</h1>
        <p style={s.subtitle}>
          You don&apos;t have permission to view this page.
        </p>

        {/* Role info */}
        {user?.role && (
          <div style={s.roleBox}>
            <span style={s.roleLabel}>Your role:</span>
            <span style={s.roleBadge}>{user.role}</span>
          </div>
        )}

        {/* Divider */}
        <div style={s.divider} />

        <p style={s.hint}>
          This section is restricted. Please go back to your correct area.
        </p>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.primaryBtn} onClick={handleGoBack}>
            → Go to {destinationLabel}
          </button>
          <button style={s.secondaryBtn} onClick={() => navigate("/")}>
            ✚ MediCore Home
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "'Segoe UI', sans-serif",
    padding: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "52px 48px",
    maxWidth: 440,
    width: "100%",
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    textAlign: "center",
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    margin: "0 0 20px",
  },
  roleBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "#f1f5f9",
    borderRadius: 10,
    padding: "8px 16px",
    marginBottom: 20,
  },
  roleLabel: { fontSize: 13, color: "#64748b", fontWeight: 500 },
  roleBadge: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
    background: "#e2e8f0",
    padding: "2px 10px",
    borderRadius: 20,
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    background: "#f1f5f9",
    margin: "0 0 20px",
  },
  hint: {
    fontSize: 14,
    color: "#94a3b8",
    margin: "0 0 28px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  primaryBtn: {
    padding: "13px 24px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #0f4c81, #1a73e8)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "13px 24px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
};
