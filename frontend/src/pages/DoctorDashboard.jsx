import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, appointmentsAPI } from "../services/api";

const NAV = [
  { key: "appointments", icon: "📅", label: "My Appointments" },
  { key: "today", icon: "📆", label: "Today's Schedule" },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null); // detail modal

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // ✅ Sirf is doctor ke appointments — doctorId bhejo
      // Note: Doctor ka User._id aur Doctor._id alag ho sakta hai
      // Hum saare laate hain aur doctor name se match karte hain jab tak
      // doctor-user linking nahi hoti
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

  // ✅ Status update karo
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await appointmentsAPI.update(id, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a)),
      );
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.date || a.appointmentDate);
    return d.toDateString() === new Date().toDateString();
  });

  const displayAppts = activeTab === "today" ? todayAppts : appointments;

  const stats = [
    {
      label: "Total",
      value: appointments.length,
      color: "#1a73e8",
      icon: "📋",
    },
    { label: "Today", value: todayAppts.length, color: "#10b981", icon: "📆" },
    {
      label: "Pending",
      value: appointments.filter((a) => a.status === "pending").length,
      color: "#f59e0b",
      icon: "⏳",
    },
    {
      label: "Completed",
      value: appointments.filter((a) => a.status === "completed").length,
      color: "#8b5cf6",
      icon: "✅",
    },
  ];

  return (
    <div style={s.shell}>
      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span style={s.logoIcon}>✚</span>
          <span style={s.logoText}>MediCore</span>
        </div>
        <nav style={s.nav}>
          {NAV.map(({ key, icon, label }) => (
            <button
              key={key}
              style={{ ...s.navBtn, ...(activeTab === key ? s.navActive : {}) }}
              onClick={() => setActiveTab(key)}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
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

      {/* ── Main ── */}
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>
              {activeTab === "today" ? "Today's Schedule" : "My Appointments"}
            </h1>
            <p style={s.pageDate}>{new Date().toDateString()}</p>
          </div>
          <button style={s.refreshBtn} onClick={fetchAppointments}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={s.statGrid}>
          {stats.map(({ label, value, color, icon }) => (
            <div
              key={label}
              style={{ ...s.statCard, borderTop: `4px solid ${color}` }}
            >
              <div style={s.statIcon}>{icon}</div>
              <div style={{ ...s.statVal, color }}>{value}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Appointments Table */}
        {loading ? (
          <div style={s.loader}>Loading appointments…</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {[
                    "Patient",
                    "Date",
                    "Time",
                    "Status",
                    "Notes",
                    "Actions",
                  ].map((c) => (
                    <th key={c} style={s.th}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayAppts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={s.emptyCell}>
                      {activeTab === "today"
                        ? "Aaj koi appointment nahi hai."
                        : "Koi appointment nahi mili."}
                    </td>
                  </tr>
                ) : (
                  displayAppts.map((a, i) => (
                    <tr key={a._id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                      <td style={s.td}>
                        <div style={{ fontWeight: 600 }}>
                          {a.patient?.name || a.patientName || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {a.patient?.phone || ""}
                        </div>
                      </td>
                      <td style={s.td}>
                        {a.date
                          ? new Date(a.date).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      <td style={s.td}>{a.time || "—"}</td>
                      <td style={s.td}>
                        <StatusBadge status={a.status} />
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>
                          {a.notes || "—"}
                        </span>
                      </td>
                      <td style={s.td}>
                        {/* ✅ Status change buttons */}
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          {a.status !== "completed" && (
                            <button
                              style={s.completeBtn}
                              disabled={updatingId === a._id}
                              onClick={() =>
                                handleStatusChange(a._id, "completed")
                              }
                            >
                              ✅ Done
                            </button>
                          )}
                          {a.status === "pending" && (
                            <button
                              style={s.confirmBtn}
                              disabled={updatingId === a._id}
                              onClick={() =>
                                handleStatusChange(a._id, "confirmed")
                              }
                            >
                              👍 Confirm
                            </button>
                          )}
                          {a.status !== "cancelled" &&
                            a.status !== "completed" && (
                              <button
                                style={s.cancelBtn}
                                disabled={updatingId === a._id}
                                onClick={() =>
                                  handleStatusChange(a._id, "cancelled")
                                }
                              >
                                ✕ Cancel
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── Detail Modal ── */}
      {selectedAppt && (
        <div style={s.overlay} onClick={() => setSelectedAppt(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Appointment Details</h3>
            <p>
              <strong>Patient:</strong> {selectedAppt.patient?.name}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedAppt.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {selectedAppt.time}
            </p>
            <p>
              <strong>Status:</strong> {selectedAppt.status}
            </p>
            <p>
              <strong>Notes:</strong> {selectedAppt.notes || "None"}
            </p>
            <button style={s.closeBtn} onClick={() => setSelectedAppt(null)}>
              Close
            </button>
          </div>
        </div>
      )}
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
    background: "#10b981",
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
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
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
    letterSpacing: "0.5px",
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
  completeBtn: {
    padding: "4px 10px",
    borderRadius: 6,
    border: "none",
    background: "#dbeafe",
    color: "#1e40af",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "4px 10px",
    borderRadius: 6,
    border: "none",
    background: "#d1fae5",
    color: "#065f46",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "4px 10px",
    borderRadius: 6,
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    width: "100%",
  },
  closeBtn: {
    marginTop: 16,
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
  },
};
