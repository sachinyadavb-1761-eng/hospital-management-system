import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, appointmentsAPI } from "../services/api";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getAll();
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.date || a.appointmentDate);
    return d.toDateString() === new Date().toDateString();
  });

  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span style={s.logoIcon}>✚</span>
          <span style={s.logoText}>MediCore</span>
        </div>
        <nav style={s.nav}>
          <div style={{ ...s.navBtn, ...s.navActive }}>
            <span>📅</span> My Appointments
          </div>
        </nav>
        <div style={s.sideFooter}>
          <div style={s.userBadge}>
            <div style={s.avatar}>{(user.name || "D")[0].toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user.name || "Doctor"}</div>
              <div style={s.userRole}>Doctor</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Doctor Dashboard</h1>
            <p style={s.pageDate}>{new Date().toDateString()}</p>
          </div>
          <button style={s.refreshBtn} onClick={fetchAppointments}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={s.statGrid}>
          <div style={{ ...s.statCard, borderTop: "4px solid #1a73e8" }}>
            <div style={s.statIcon}>📅</div>
            <div style={{ ...s.statVal, color: "#1a73e8" }}>
              {appointments.length}
            </div>
            <div style={s.statLabel}>Total Appointments</div>
          </div>
          <div style={{ ...s.statCard, borderTop: "4px solid #10b981" }}>
            <div style={s.statIcon}>📆</div>
            <div style={{ ...s.statVal, color: "#10b981" }}>
              {todayAppts.length}
            </div>
            <div style={s.statLabel}>Today's Appointments</div>
          </div>
          <div style={{ ...s.statCard, borderTop: "4px solid #f59e0b" }}>
            <div style={s.statIcon}>⏳</div>
            <div style={{ ...s.statVal, color: "#f59e0b" }}>
              {appointments.filter((a) => a.status === "pending").length}
            </div>
            <div style={s.statLabel}>Pending</div>
          </div>
          <div style={{ ...s.statCard, borderTop: "4px solid #8b5cf6" }}>
            <div style={s.statIcon}>✅</div>
            <div style={{ ...s.statVal, color: "#8b5cf6" }}>
              {appointments.filter((a) => a.status === "completed").length}
            </div>
            <div style={s.statLabel}>Completed</div>
          </div>
        </div>

        {/* Appointments Table */}
        <h2 style={s.sectionTitle}>All Appointments</h2>
        {loading ? (
          <div style={s.loader}>Loading…</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Patient", "Date", "Time", "Status", "Notes"].map((c) => (
                    <th key={c} style={s.th}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={s.emptyCell}>
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a, i) => (
                    <tr key={a._id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                      <td style={s.td}>
                        {a.patient?.name || a.patientName || "—"}
                      </td>
                      <td style={s.td}>
                        {a.date ? new Date(a.date).toLocaleDateString() : "—"}
                      </td>
                      <td style={s.td}>{a.time || "—"}</td>
                      <td style={s.td}>
                        <StatusBadge status={a.status} />
                      </td>
                      <td style={s.td}>{a.notes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    confirmed: { bg: "#d1fae5", color: "#065f46" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
    completed: { bg: "#dbeafe", color: "#1e40af" },
  };
  const style = map[status?.toLowerCase()] || {
    bg: "#f1f5f9",
    color: "#475569",
  };
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {status || "Unknown"}
    </span>
  );
}

const s = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f8fafc",
  },
  sidebar: {
    width: 240,
    background: "#0f172a",
    display: "flex",
    flexDirection: "column",
    padding: "28px 16px",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 8px 32px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 22,
    background: "#1a73e8",
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#fff",
  },
  logoText: { color: "#fff", fontSize: 18, fontWeight: 700 },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 14px",
    borderRadius: 10,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500,
  },
  navActive: { background: "#1e293b", color: "#fff" },
  sideFooter: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  userBadge: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#10b981",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
  },
  userName: { color: "#e2e8f0", fontSize: 13, fontWeight: 600 },
  userRole: { color: "#64748b", fontSize: 12 },
  logoutBtn: {
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid #1e293b",
    background: "transparent",
    color: "#ef4444",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
    textAlign: "left",
  },
  main: { flex: 1, padding: "36px 40px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  pageTitle: { margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a" },
  pageDate: { color: "#94a3b8", fontSize: 13, margin: "4px 0 0" },
  refreshBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "24px 20px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  },
  statIcon: { fontSize: 26, marginBottom: 10 },
  statVal: { fontSize: 36, fontWeight: 800, lineHeight: 1 },
  statLabel: { color: "#64748b", fontSize: 13, marginTop: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 16,
  },
  loader: { textAlign: "center", padding: 80, color: "#94a3b8" },
  tableWrap: {
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "14px 18px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    background: "#f8fafc",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "14px 18px",
    fontSize: 14,
    color: "#0f172a",
    borderBottom: "1px solid #f1f5f9",
  },
  rowEven: { background: "#fff" },
  rowOdd: { background: "#fafafa" },
  emptyCell: {
    padding: "48px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
  },
};
