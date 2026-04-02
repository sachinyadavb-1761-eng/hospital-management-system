import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  authAPI,
  doctorsAPI,
  patientsAPI,
  appointmentsAPI,
} from "../services/api";

const NAV = [
  { key: "book", icon: "📋", label: "Book Appointment" },
  { key: "myappointments", icon: "📅", label: "My Appointments" },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("book");
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myPatient, setMyPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking form
  const [bookForm, setBookForm] = useState({
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [bookError, setBookError] = useState("");
  const [bookSuccess, setBookSuccess] = useState("");
  const [booking, setBooking] = useState(false);

  // Receipt modal
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, patRes] = await Promise.all([
        doctorsAPI.getAll(),
        patientsAPI.getAll(),
      ]);
      setDoctors(docRes.data || []);

      // Apna patient record dhundo email se
      const patients = patRes.data || [];
      const me = patients.find(
        (p) => p.email === user.email || p.name === user.name,
      );
      setMyPatient(me || null);

      // Appointments
      if (me) {
        const apptRes = await appointmentsAPI.getByPatient(me._id);
        setMyAppointments(apptRes.data || []);
      }
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

  const selectedDoctor = doctors.find((d) => d._id === bookForm.doctorId);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookForm.doctorId || !bookForm.date || !bookForm.time) {
      setBookError("Doctor, date aur time select karna zaroori hai.");
      return;
    }
    if (!myPatient) {
      setBookError("Aapka patient record nahi mila. Admin se contact karein.");
      return;
    }

    setBooking(true);
    setBookError("");
    setBookSuccess("");

    try {
      const payload = {
        doctor: bookForm.doctorId,
        patient: myPatient._id,
        date: bookForm.date,
        time: bookForm.time,
        notes: bookForm.notes,
        fee: selectedDoctor?.fee || 0,
        status: "pending",
      };

      const res = await appointmentsAPI.create(payload);
      const appt = res.data.appointment;

      // ✅ Receipt generate karo
      setReceipt({
        appointmentId: appt._id,
        doctorName: selectedDoctor?.name,
        specialization: selectedDoctor?.specialization,
        date: bookForm.date,
        time: bookForm.time,
        fee: selectedDoctor?.fee || 0,
        patientName: myPatient.name,
        status: "Pending Confirmation",
      });

      setBookForm({ doctorId: "", date: "", time: "", notes: "" });
      await fetchData();
    } catch (err) {
      setBookError(err.response?.data?.message || "Booking failed. Try again.");
    } finally {
      setBooking(false);
    }
  };

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
            <div style={s.avatar}>{(user.name || "P")[0].toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user.name || "Patient"}</div>
              <div style={s.userRole}>Patient</div>
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
              {activeTab === "book" ? "Book Appointment" : "My Appointments"}
            </h1>
            <p style={s.pageDate}>{new Date().toDateString()}</p>
          </div>
        </div>

        {loading ? (
          <div style={s.loader}>Loading…</div>
        ) : (
          <>
            {/* ── BOOK APPOINTMENT ── */}
            {activeTab === "book" && (
              <div style={s.bookGrid}>
                {/* Form */}
                <div style={s.bookCard}>
                  <h2 style={s.cardTitle}>New Appointment</h2>

                  {bookError && <div style={s.errorBox}>⚠ {bookError}</div>}
                  {bookSuccess && (
                    <div style={s.successBox}>✅ {bookSuccess}</div>
                  )}

                  {!myPatient && (
                    <div style={s.warnBox}>
                      ⚠ Aapka patient profile nahi mila. Admin se request
                      karein.
                    </div>
                  )}

                  <form onSubmit={handleBook} style={s.form}>
                    {/* Doctor select */}
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Doctor Select Karein *</label>
                      <select
                        style={s.select}
                        value={bookForm.doctorId}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, doctorId: e.target.value })
                        }
                      >
                        <option value="">— Doctor chunein —</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name} — {d.specialization} (₹{d.fee || 500})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Doctor preview */}
                    {selectedDoctor && (
                      <div style={s.doctorPreview}>
                        <div style={s.doctorAvatar}>
                          {selectedDoctor.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {selectedDoctor.name}
                          </div>
                          <div style={{ fontSize: 13, color: "#64748b" }}>
                            {selectedDoctor.specialization} •{" "}
                            {selectedDoctor.experience} yrs exp
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#10b981",
                              fontWeight: 700,
                            }}
                          >
                            Consultation Fee: ₹{selectedDoctor.fee || 500}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={s.row}>
                      <div style={s.fieldGroup}>
                        <label style={s.label}>Date *</label>
                        <input
                          type="date"
                          style={s.input}
                          value={bookForm.date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            setBookForm({ ...bookForm, date: e.target.value })
                          }
                        />
                      </div>
                      <div style={s.fieldGroup}>
                        <label style={s.label}>Time *</label>
                        <input
                          type="time"
                          style={s.input}
                          value={bookForm.time}
                          onChange={(e) =>
                            setBookForm({ ...bookForm, time: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div style={s.fieldGroup}>
                      <label style={s.label}>Notes (Optional)</label>
                      <textarea
                        style={{ ...s.input, height: 80, resize: "vertical" }}
                        placeholder="Symptoms ya koi baat batao..."
                        value={bookForm.notes}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, notes: e.target.value })
                        }
                      />
                    </div>

                    <button type="submit" style={s.bookBtn} disabled={booking}>
                      {booking ? "Booking…" : "📅 Book Appointment"}
                    </button>
                  </form>
                </div>

                {/* Doctors list */}
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginBottom: 16,
                      color: "#0f172a",
                    }}
                  >
                    Available Doctors
                  </h3>
                  <div style={s.doctorList}>
                    {doctors.map((d) => (
                      <div
                        key={d._id}
                        style={{
                          ...s.doctorListCard,
                          ...(bookForm.doctorId === d._id
                            ? s.doctorListCardActive
                            : {}),
                        }}
                        onClick={() =>
                          setBookForm({ ...bookForm, doctorId: d._id })
                        }
                      >
                        <div style={{ ...s.docAvatar, background: "#0ea5e9" }}>
                          {d.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {d.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {d.specialization}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#10b981",
                              fontWeight: 600,
                            }}
                          >
                            ₹{d.fee || 500}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MY APPOINTMENTS ── */}
            {activeTab === "myappointments" && (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {[
                        "Doctor",
                        "Specialization",
                        "Date",
                        "Time",
                        "Fee",
                        "Status",
                      ].map((c) => (
                        <th key={c} style={s.th}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={s.emptyCell}>
                          Abhi tak koi appointment nahi hai.{" "}
                          <span
                            style={{ color: "#0ea5e9", cursor: "pointer" }}
                            onClick={() => setActiveTab("book")}
                          >
                            Book karein →
                          </span>
                        </td>
                      </tr>
                    ) : (
                      myAppointments.map((a, i) => (
                        <tr
                          key={a._id}
                          style={i % 2 === 0 ? s.rowEven : s.rowOdd}
                        >
                          <td style={s.td}>{a.doctor?.name || "—"}</td>
                          <td style={s.td}>
                            {a.doctor?.specialization || "—"}
                          </td>
                          <td style={s.td}>
                            {a.date
                              ? new Date(a.date).toLocaleDateString("en-IN")
                              : "—"}
                          </td>
                          <td style={s.td}>{a.time || "—"}</td>
                          <td style={s.td}>₹{a.fee || a.doctor?.fee || "—"}</td>
                          <td style={s.td}>
                            <StatusBadge status={a.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Receipt Modal ── */}
      {receipt && (
        <div style={s.overlay} onClick={() => setReceipt(null)}>
          <div style={s.receiptModal} onClick={(e) => e.stopPropagation()}>
            <div style={s.receiptHeader}>
              <div style={s.receiptIcon}>🎉</div>
              <h2 style={s.receiptTitle}>Appointment Booked!</h2>
              <p style={s.receiptSub}>Confirmation Receipt</p>
            </div>

            <div style={s.receiptBody}>
              <div style={s.receiptRow}>
                <span style={s.receiptKey}>Appointment ID</span>
                <span style={s.receiptVal}>
                  #{receipt.appointmentId?.slice(-8).toUpperCase()}
                </span>
              </div>
              <div style={s.receiptRow}>
                <span style={s.receiptKey}>Patient</span>
                <span style={s.receiptVal}>{receipt.patientName}</span>
              </div>
              <div style={s.receiptRow}>
                <span style={s.receiptKey}>Doctor</span>
                <span style={s.receiptVal}>{receipt.doctorName}</span>
              </div>
              <div style={s.receiptRow}>
                <span style={s.receiptKey}>Specialization</span>
                <span style={s.receiptVal}>{receipt.specialization}</span>
              </div>
              <div style={s.receiptRow}>
                <span style={s.receiptKey}>Date</span>
                <span style={s.receiptVal}>
                  {new Date(receipt.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div style={s.receiptRow}>
                <span style={s.receiptKey}>Time</span>
                <span style={s.receiptVal}>{receipt.time}</span>
              </div>
              <div
                style={{
                  ...s.receiptRow,
                  background: "#f0fdf4",
                  borderRadius: 8,
                  padding: "10px 0",
                }}
              >
                <span style={{ ...s.receiptKey, fontWeight: 700 }}>
                  Consultation Fee
                </span>
                <span
                  style={{
                    ...s.receiptVal,
                    color: "#10b981",
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  ₹{receipt.fee}
                </span>
              </div>
              <div style={s.receiptRow}>
                <span style={s.receiptKey}>Status</span>
                <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                  {receipt.status}
                </span>
              </div>
            </div>

            <div style={s.receiptNote}>
              📩 Please arrive 10 minutes early. Bring this confirmation.
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                style={s.receiptCloseBtn}
                onClick={() => setReceipt(null)}
              >
                Close
              </button>
              <button
                style={s.receiptViewBtn}
                onClick={() => {
                  setReceipt(null);
                  setActiveTab("myappointments");
                }}
              >
                View My Appointments →
              </button>
            </div>
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
  const st = map[status?.toLowerCase()] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span
      style={{
        background: st.bg,
        color: st.color,
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
    background: "#0ea5e9",
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
    background: "#0ea5e9",
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
  loader: { textAlign: "center", padding: 80, color: "#94a3b8" },
  bookGrid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32 },
  bookCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 32,
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  },
  cardTitle: {
    margin: "0 0 24px",
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "11px 13px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    background: "#f8fafc",
  },
  select: {
    padding: "11px 13px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    background: "#f8fafc",
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  doctorPreview: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#f0fdf4",
    border: "1.5px solid #bbf7d0",
    borderRadius: 12,
    padding: "14px 16px",
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "#0ea5e9",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 18,
  },
  bookBtn: {
    padding: "14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #0ea5e9, #1a73e8)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  doctorList: { display: "flex", flexDirection: "column", gap: 10 },
  doctorListCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  doctorListCardActive: {
    border: "1.5px solid #0ea5e9",
    background: "#f0f9ff",
  },
  docAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
  },
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
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 4,
  },
  successBox: {
    background: "#d1fae5",
    color: "#065f46",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 4,
  },
  warnBox: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 4,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  receiptModal: {
    background: "#fff",
    borderRadius: 24,
    padding: 32,
    maxWidth: 460,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  receiptHeader: { textAlign: "center", marginBottom: 24 },
  receiptIcon: { fontSize: 48, marginBottom: 8 },
  receiptTitle: { margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" },
  receiptSub: { color: "#64748b", fontSize: 14, margin: "4px 0 0" },
  receiptBody: { display: "flex", flexDirection: "column", gap: 12 },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  receiptKey: { color: "#64748b", fontSize: 14 },
  receiptVal: { color: "#0f172a", fontSize: 14, fontWeight: 600 },
  receiptNote: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "12px",
    borderRadius: 8,
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
  },
  receiptCloseBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },
  receiptViewBtn: {
    flex: 2,
    padding: "12px",
    borderRadius: 10,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};
