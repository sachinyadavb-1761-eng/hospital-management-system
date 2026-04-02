import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, appointmentsAPI, doctorsAPI } from "../services/api";

const NAV = [
  { key: "appointments", icon: "📅", label: "My Appointments" },
  { key: "today", icon: "📆", label: "Today's Schedule" },
  { key: "colleagues", icon: "👥", label: "My Department" },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apptRes, profileRes, doctorsRes] = await Promise.all([
        appointmentsAPI.getAll(),
        doctorsAPI.getMyProfile().catch(() => ({ data: null })),
        doctorsAPI.getAll(),
      ]);
      setAppointments(apptRes.data || []);
      setMyProfile(profileRes.data || null);
      setAllDoctors(doctorsRes.data || []);
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

  // Colleagues = doctors in the same department, excluding self
  const myDeptId = myProfile?.department?._id || myProfile?.department;
  const colleagues = allDoctors.filter(
    (d) =>
      d._id !== myProfile?._id &&
      (d.department?._id || d.department) === myDeptId &&
      myDeptId,
  );

  const stats = [
    { label: "Total", value: appointments.length, color: "#1a73e8", icon: "📋" },
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
          {/* Doctor's department badge */}
          {myProfile?.department && (
            <div style={s.deptBadge}>
              <span style={{ fontSize: 18 }}>
                {myProfile.department.icon || "🏥"}
              </span>
              <div>
                <div style={s.deptBadgeLabel}>Department</div>
                <div style={s.deptBadgeName}>
                  {myProfile.department.name}
                </div>
              </div>
            </div>
          )}
          <div style={s.userBadge}>
            <div style={s.avatar}>{(user.name || "D")[0].toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user.name || "Doctor"}</div>
              <div style={s.userRole}>
                {myProfile?.specialization || "Doctor"}
              </div>
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
              {activeTab === "today"
                ? "Today's Schedule"
                : activeTab === "colleagues"
                  ? `${myProfile?.department?.name || "My"} Department`
                  : "My Appointments"}
            </h1>
            <p style={s.pageDate}>{new Date().toDateString()}</p>
          </div>
          <button style={s.refreshBtn} onClick={fetchAll}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats (only on appointments tabs) */}
        {activeTab !== "colleagues" && (
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
        )}

        {loading ? (
          <div style={s.loader}>Loading…</div>
        ) : (
          <>
            {/* Appointments Table */}
            {(activeTab === "appointments" || activeTab === "today") && (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Patient", "Date", "Time", "Status", "Notes", "Actions"].map(
                        (c) => (
                          <th key={c} style={s.th}>
                            {c}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayAppts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={s.emptyCell}>
                          {activeTab === "today"
                            ? "No appointments today."
                            : "No appointments found."}
                        </td>
                      </tr>
                    ) : (
                      displayAppts.map((a, i) => (
                        <tr
                          key={a._id}
                          style={i % 2 === 0 ? s.rowEven : s.rowOdd}
                        >
                          <td style={s.td}>
                            <div style={{ fontWeight: 600 }}>
                              {a.patient?.name || "—"}
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
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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

            {/* My Department / Colleagues Tab */}
            {activeTab === "colleagues" && (
              <div>
                {/* My own profile card */}
                {myProfile && (
                  <div style={s.myProfileCard}>
                    <div style={s.myProfileAvatar}>
                      {(myProfile.name || "D")[0]}
                    </div>
                    <div style={s.myProfileInfo}>
                      <div style={s.myProfileName}>{myProfile.name}</div>
                      <div style={s.myProfileSpecialization}>
                        {myProfile.specialization || "Doctor"}
                      </div>
                      {myProfile.department && (
                        <div style={s.myProfileDept}>
                          <span>{myProfile.department.icon}</span>{" "}
                          {myProfile.department.name}
                        </div>
                      )}
                      <div style={s.myProfileMeta}>
                        <span>📞 {myProfile.phone}</span>
                        <span>💼 {myProfile.experience} yrs exp</span>
                        <span>💰 ₹{myProfile.fee}</span>
                      </div>
                    </div>
                    <div style={s.youBadge}>You</div>
                  </div>
                )}

                <h3 style={s.colleaguesTitle}>
                  Colleagues in{" "}
                  {myProfile?.department?.name || "your department"}
                </h3>

                {!myProfile?.department ? (
                  <div style={s.noDeptMsg}>
                    You are not assigned to any department yet. Contact admin.
                  </div>
                ) : colleagues.length === 0 ? (
                  <div style={s.noDeptMsg}>
                    No other doctors in your department yet.
                  </div>
                ) : (
                  <div style={s.colleagueGrid}>
                    {colleagues.map((doc) => (
                      <div key={doc._id} style={s.colleagueCard}>
                        <div style={s.colleagueAvatar}>{doc.name[0]}</div>
                        <div style={s.colleagueInfo}>
                          <div style={s.colleagueName}>{doc.name}</div>
                          <div style={s.colleagueSpec}>
                            {doc.specialization || "—"}
                          </div>
                          <div style={s.colleagueMeta}>
                            💼 {doc.experience} yrs · ₹{doc.fee}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
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
  const style = map[status?.toLowerCase()] || { bg: "#f1f5f9", color: "#475569" };
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
    paddingTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  deptBadge: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(16,185,129,0.12)",
    borderRadius: 10,
    padding: "10px 12px",
    marginBottom: 4,
  },
  deptBadgeLabel: { color: "#64748b", fontSize: 11, fontWeight: 600 },
  deptBadgeName: { color: "#d1fae5", fontSize: 13, fontWeight: 700 },
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
  emptyCell: { padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: 14 },
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
  // My Department tab styles
  myProfileCard: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    borderRadius: 20,
    padding: "24px 28px",
    marginBottom: 32,
    position: "relative",
    color: "#fff",
  },
  myProfileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 28,
    color: "#fff",
    flexShrink: 0,
  },
  myProfileInfo: { flex: 1 },
  myProfileName: { fontSize: 20, fontWeight: 800, marginBottom: 2 },
  myProfileSpecialization: { color: "#94a3b8", fontSize: 14, marginBottom: 6 },
  myProfileDept: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(16,185,129,0.2)",
    color: "#6ee7b7",
    fontSize: 13,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 20,
    marginBottom: 8,
  },
  myProfileMeta: {
    display: "flex",
    gap: 16,
    fontSize: 13,
    color: "#94a3b8",
  },
  youBadge: {
    position: "absolute",
    top: 16,
    right: 20,
    background: "#10b981",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "3px 12px",
    borderRadius: 20,
  },
  colleaguesTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 16,
  },
  noDeptMsg: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontSize: 14,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  },
  colleagueGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
  },
  colleagueCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#fff",
    borderRadius: 14,
    padding: "16px 18px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    border: "1.5px solid #f1f5f9",
  },
  colleagueAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#1a73e8",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 20,
    flexShrink: 0,
  },
  colleagueInfo: { flex: 1 },
  colleagueName: { fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 },
  colleagueSpec: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  colleagueMeta: { fontSize: 12, color: "#94a3b8" },
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
