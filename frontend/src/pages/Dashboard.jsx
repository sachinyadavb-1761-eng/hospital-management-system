import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  authAPI,
  doctorsAPI,
  patientsAPI,
  appointmentsAPI,
} from "../services/api";

const NAV = [
  { key: "overview", icon: "⊞", label: "Overview" },
  { key: "doctors", icon: "🩺", label: "Doctors" },
  { key: "patients", icon: "👤", label: "Patients" },
  { key: "appointments", icon: "📅", label: "Appointments" },
];

// ─── Initial Form States ──────────────────────────────────────────────────────
const DOCTOR_INIT = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  experience: "",
  fee: "",
};
const PATIENT_INIT = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "male",
  bloodGroup: "",
  address: "",
};
const APPT_INIT = {
  patientId: "",
  doctorId: "",
  date: "",
  time: "",
  status: "pending",
  notes: "",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("overview");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState(null); // { type: 'doctor'|'patient'|'appointment', mode: 'add'|'edit', data: {} }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name }
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, p, a] = await Promise.all([
        doctorsAPI.getAll(),
        patientsAPI.getAll(),
        appointmentsAPI.getAll(),
      ]);
      setDoctors(d.data || []);
      setPatients(p.data || []);
      setAppointments(a.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  // ── Open Modals ──
  const openAdd = (type) => {
    const init =
      type === "doctor"
        ? DOCTOR_INIT
        : type === "patient"
          ? PATIENT_INIT
          : APPT_INIT;
    setFormData(init);
    setFormError("");
    setModal({ type, mode: "add" });
  };

  const openEdit = (type, data) => {
    setFormData({ ...data });
    setFormError("");
    setModal({ type, mode: "edit" });
  };

  const closeModal = () => {
    setModal(null);
    setFormData({});
    setFormError("");
  };

  // ── Save (Add/Edit) ──
  const handleSave = async () => {
    setSaving(true);
    setFormError("");
    try {
      const { type, mode } = modal;
      const api =
        type === "doctor"
          ? doctorsAPI
          : type === "patient"
            ? patientsAPI
            : appointmentsAPI;

      // Appointment ke liye patientId/doctorId → patient/doctor rename karo
      let payload = { ...formData };
      if (type === "appointment") {
        payload.patient = formData.patientId;
        payload.doctor = formData.doctorId;
        delete payload.patientId;
        delete payload.doctorId;
      }

      if (mode === "add") {
        await api.create(payload);
      } else {
        await api.update(payload._id, payload);
      }
      await fetchAll();
      closeModal();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      const { type, id } = deleteConfirm;
      const api =
        type === "doctor"
          ? doctorsAPI
          : type === "patient"
            ? patientsAPI
            : appointmentsAPI;
      await api.delete(id);
      await fetchAll();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Stats ──
  const stats = [
    {
      label: "Total Doctors",
      value: doctors.length,
      color: "#1a73e8",
      icon: "🩺",
    },
    {
      label: "Total Patients",
      value: patients.length,
      color: "#10b981",
      icon: "👤",
    },
    {
      label: "Appointments",
      value: appointments.length,
      color: "#f59e0b",
      icon: "📅",
    },
    {
      label: "Today",
      value: appointments.filter((a) => {
        const d = new Date(a.date || a.appointmentDate);
        return d.toDateString() === new Date().toDateString();
      }).length,
      color: "#8b5cf6",
      icon: "📆",
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
              <span style={s.navIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div style={s.sideFooter}>
          <div style={s.userBadge}>
            <div style={s.avatar}>{(user.name || "U")[0].toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user.name || "Admin"}</div>
              <div style={s.userRole}>{user.role || "Staff"}</div>
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
              {NAV.find((n) => n.key === activeTab)?.label}
            </h1>
            <p style={s.pageDate}>{new Date().toDateString()}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {activeTab === "doctors" && (
              <AddBtn onClick={() => openAdd("doctor")} label="Add Doctor" />
            )}
            {activeTab === "patients" && (
              <AddBtn onClick={() => openAdd("patient")} label="Add Patient" />
            )}
            {activeTab === "appointments" && (
              <AddBtn
                onClick={() => openAdd("appointment")}
                label="Add Appointment"
              />
            )}
            <button style={s.refreshBtn} onClick={fetchAll}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={s.loader}>Loading data…</div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div>
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
                <h2 style={s.sectionTitle}>Recent Appointments</h2>
                <Table
                  columns={["Patient", "Doctor", "Date", "Status"]}
                  rows={appointments
                    .slice(0, 6)
                    .map((a) => [
                      a.patientName || a.patient?.name || a.patientId,
                      a.doctorName || a.doctor?.name || a.doctorId,
                      a.date
                        ? new Date(a.date).toLocaleDateString()
                        : a.appointmentDate || "—",
                      <StatusBadge key={a._id} status={a.status} />,
                    ])}
                  empty="No appointments found"
                />
              </div>
            )}

            {/* DOCTORS */}
            {activeTab === "doctors" && (
              <Table
                columns={[
                  "Name",
                  "Specialization",
                  "Email",
                  "Phone",
                  "Actions",
                ]}
                rows={doctors.map((d) => [
                  d.name,
                  d.specialization || d.specialty || "—",
                  d.email || "—",
                  d.phone || "—",
                  <ActionBtns
                    key={d._id}
                    onEdit={() => openEdit("doctor", d)}
                    onDelete={() =>
                      setDeleteConfirm({
                        type: "doctor",
                        id: d._id,
                        name: d.name,
                      })
                    }
                  />,
                ])}
                empty="No doctors found. Click 'Add Doctor' to get started."
              />
            )}

            {/* PATIENTS */}
            {activeTab === "patients" && (
              <Table
                columns={["Name", "Age", "Gender", "Email", "Phone", "Actions"]}
                rows={patients.map((p) => [
                  p.name,
                  p.age || "—",
                  p.gender || "—",
                  p.email || "—",
                  p.phone || "—",
                  <ActionBtns
                    key={p._id}
                    onEdit={() => openEdit("patient", p)}
                    onDelete={() =>
                      setDeleteConfirm({
                        type: "patient",
                        id: p._id,
                        name: p.name,
                      })
                    }
                  />,
                ])}
                empty="No patients found. Click 'Add Patient' to get started."
              />
            )}

            {/* APPOINTMENTS */}
            {activeTab === "appointments" && (
              <Table
                columns={[
                  "Patient",
                  "Doctor",
                  "Date",
                  "Time",
                  "Status",
                  "Actions",
                ]}
                rows={appointments.map((a) => [
                  a.patientName || a.patient?.name || a.patientId,
                  a.doctorName || a.doctor?.name || a.doctorId,
                  a.date ? new Date(a.date).toLocaleDateString() : "—",
                  a.time || "—",
                  <StatusBadge key={a._id} status={a.status} />,
                  <ActionBtns
                    key={a._id}
                    onEdit={() => openEdit("appointment", a)}
                    onDelete={() =>
                      setDeleteConfirm({
                        type: "appointment",
                        id: a._id,
                        name: `appointment on ${a.date ? new Date(a.date).toLocaleDateString() : "—"}`,
                      })
                    }
                  />,
                ])}
                empty="No appointments found. Click 'Add Appointment' to get started."
              />
            )}
          </>
        )}
      </main>

      {/* ── ADD/EDIT MODAL ── */}
      {modal && (
        <Overlay onClick={closeModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>
                {modal.mode === "add" ? "Add" : "Edit"}{" "}
                {modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}
              </h3>
              <button style={s.modalClose} onClick={closeModal}>
                ✕
              </button>
            </div>

            {formError && <div style={s.errorBox}>⚠ {formError}</div>}

            <div style={s.modalBody}>
              {/* Doctor Form */}
              {modal.type === "doctor" && (
                <>
                  <FormRow>
                    <FormField
                      label="Full Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Dr. John Smith"
                    />
                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="doctor@hospital.com"
                    />
                  </FormRow>
                  <FormRow>
                    <FormField
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+91 98765 43210"
                    />
                    <FormField
                      label="Specialization *"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleFormChange}
                      placeholder="Cardiology"
                    />
                  </FormRow>
                  <FormRow>
                    <FormField
                      label="Experience (years)"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleFormChange}
                      placeholder="5"
                    />
                    <FormField
                      label="Consultation Fee"
                      name="fee"
                      type="number"
                      value={formData.fee}
                      onChange={handleFormChange}
                      placeholder="500"
                    />
                  </FormRow>
                </>
              )}

              {/* Patient Form */}
              {modal.type === "patient" && (
                <>
                  <FormRow>
                    <FormField
                      label="Full Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Jane Doe"
                    />
                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="patient@email.com"
                    />
                  </FormRow>
                  <FormRow>
                    <FormField
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+91 98765 43210"
                    />
                    <FormField
                      label="Age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleFormChange}
                      placeholder="30"
                    />
                  </FormRow>
                  <FormRow>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        style={s.select}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <FormField
                      label="Blood Group"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleFormChange}
                      placeholder="A+"
                    />
                  </FormRow>
                  <FormField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="123 Main St, City"
                  />
                </>
              )}

              {/* Appointment Form */}
              {modal.type === "appointment" && (
                <>
                  <FormRow>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Patient *</label>
                      <select
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleFormChange}
                        style={s.select}
                      >
                        <option value="">Select Patient</option>
                        {patients.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Doctor *</label>
                      <select
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleFormChange}
                        style={s.select}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name} — {d.specialization || d.specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FormRow>
                  <FormRow>
                    <FormField
                      label="Date *"
                      name="date"
                      type="date"
                      value={formData.date?.slice(0, 10)}
                      onChange={handleFormChange}
                    />
                    <FormField
                      label="Time *"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleFormChange}
                    />
                  </FormRow>
                  <FormRow>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        style={s.select}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <FormField
                      label="Notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      placeholder="Optional notes..."
                    />
                  </FormRow>
                </>
              )}
            </div>

            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={closeModal}>
                Cancel
              </button>
              <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                {saving
                  ? "Saving…"
                  : modal.mode === "add"
                    ? "Add"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <Overlay onClick={() => setDeleteConfirm(null)}>
          <div
            style={{ ...s.modal, maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <h3 style={{ ...s.modalTitle, color: "#ef4444" }}>
                Confirm Delete
              </h3>
              <button
                style={s.modalClose}
                onClick={() => setDeleteConfirm(null)}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ color: "#374151", fontSize: 15, margin: 0 }}>
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.name}</strong>? This action cannot be
                undone.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button
                style={s.cancelBtn}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...s.saveBtn, background: "#ef4444" }}
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function Overlay({ children, onClick }) {
  return (
    <div style={s.overlay} onClick={onClick}>
      {children}
    </div>
  );
}

function AddBtn({ onClick, label }) {
  return (
    <button style={s.addBtn} onClick={onClick}>
      + {label}
    </button>
  );
}

function ActionBtns({ onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button style={s.editBtn} onClick={onEdit}>
        ✏ Edit
      </button>
      <button style={s.deleteBtn} onClick={onDelete}>
        🗑 Delete
      </button>
    </div>
  );
}

function FormRow({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {children}
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div style={s.fieldGroup}>
      <label style={s.label}>{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        style={s.input}
        onFocus={(e) => (e.target.style.borderColor = "#1a73e8")}
        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );
}

function Table({ columns, rows, empty }) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={s.th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={s.emptyCell}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                {row.map((cell, j) => (
                  <td key={j} style={s.td}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },
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
  navIcon: { fontSize: 16 },
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
    background: "#1a73e8",
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
  main: { flex: 1, padding: "36px 40px", maxWidth: "calc(100vw - 240px)" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  pageTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
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
  addBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "none",
    background: "#1a73e8",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  loader: { textAlign: "center", padding: 80, color: "#94a3b8", fontSize: 16 },
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
  editBtn: {
    padding: "5px 12px",
    borderRadius: 6,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#1a73e8",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "5px 12px",
    borderRadius: 6,
    border: "1.5px solid #fee2e2",
    background: "#fff",
    color: "#ef4444",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 600,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
  },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: 18,
    color: "#94a3b8",
    cursor: "pointer",
    lineHeight: 1,
  },
  modalBody: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 24px",
    borderTop: "1px solid #f1f5f9",
  },
  errorBox: {
    margin: "0 24px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "10px 13px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#f8fafc",
  },
  select: {
    padding: "10px 13px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    background: "#f8fafc",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  saveBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    background: "#1a73e8",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
