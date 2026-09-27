// src/pages/Dashboard.jsx (Admin)
// Redesign notes:
// 1. Same logic, state, API calls, CRUD flows — only presentation layer changed.
// 2. Dark glass sidebar (matches auth pages) + soft off-white content area
//    with embossed 3D card shadows — keeps dense tables readable while
//    staying visually consistent with the rest of the app.
// 3. Space Grotesk headings, teal accent, rounded generous corners.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  authAPI,
  doctorsAPI,
  patientsAPI,
  appointmentsAPI,
  departmentsAPI,
} from "../services/api";
import { getUser } from "../utils/auth";

const NAV = [
  { key: "overview", icon: "⊞", label: "Overview" },
  { key: "departments", icon: "🏥", label: "Departments" },
  { key: "doctors", icon: "🩺", label: "Doctors" },
  { key: "patients", icon: "👤", label: "Patients" },
  { key: "appointments", icon: "📅", label: "Appointments" },
];

const DOCTOR_INIT = {
  name: "",
  email: "",
  phone: "",
  department: "",
  specialization: "",
  experience: "",
  fee: "",
};
const DEPT_INIT = { name: "", description: "", icon: "🏥", isActive: true };
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
  const user = getUser() || {};

  const [activeTab, setActiveTab] = useState("overview");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [defaultPasswordMsg, setDefaultPasswordMsg] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, p, a, dept] = await Promise.all([
        doctorsAPI.getAll(),
        patientsAPI.getAll(),
        appointmentsAPI.getAll(),
        departmentsAPI.getAll(),
      ]);
      setDoctors(d.data || []);
      setPatients(p.data || []);
      setAppointments(a.data || []);
      setDepartments(dept.data || []);
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

  const openAdd = (type) => {
    const init =
      type === "doctor"
        ? DOCTOR_INIT
        : type === "patient"
          ? PATIENT_INIT
          : type === "department"
            ? DEPT_INIT
            : APPT_INIT;
    setFormData(init);
    setFormError("");
    setDefaultPasswordMsg("");
    setModal({ type, mode: "add" });
  };

  const openEdit = (type, data) => {
    let editData = { ...data };
    if (type === "appointment") {
      editData.patientId = data.patient?._id || data.patient || "";
      editData.doctorId = data.doctor?._id || data.doctor || "";
    }
    if (type === "doctor") {
      editData.department = data.department?._id || data.department || "";
    }
    setFormData(editData);
    setFormError("");
    setDefaultPasswordMsg("");
    setModal({ type, mode: "edit" });
  };

  const closeModal = () => {
    setModal(null);
    setFormData({});
    setFormError("");
    setDefaultPasswordMsg("");
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError("");
    try {
      const { type, mode } = modal;

      if (type === "department") {
        if (mode === "add") {
          await departmentsAPI.create(formData);
        } else {
          await departmentsAPI.update(formData._id, formData);
        }
      } else {
        const api =
          type === "doctor"
            ? doctorsAPI
            : type === "patient"
              ? patientsAPI
              : appointmentsAPI;

        let payload = { ...formData };
        if (type === "appointment") {
          payload.patient = formData.patientId;
          payload.doctor = formData.doctorId;
          delete payload.patientId;
          delete payload.doctorId;
        }

        if (mode === "add") {
          const res = await api.create(payload);
          if (type === "doctor" && res.data?.defaultPassword) {
            setDefaultPasswordMsg(
              `✅ Doctor added! Default Login Password: ${res.data.defaultPassword}`,
            );
            await fetchAll();
            setSaving(false);
            return;
          }
        } else {
          await api.update(payload._id, payload);
        }
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

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      const { type, id } = deleteConfirm;
      if (type === "department") {
        await departmentsAPI.delete(id);
      } else {
        const api =
          type === "doctor"
            ? doctorsAPI
            : type === "patient"
              ? patientsAPI
              : appointmentsAPI;
        await api.delete(id);
      }
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

  const stats = [
    {
      label: "Total Doctors",
      value: doctors.length,
      color: "#2DD4BF",
      icon: "🩺",
    },
    {
      label: "Departments",
      value: departments.length,
      color: "#A78BFA",
      icon: "🏥",
    },
    {
      label: "Total Patients",
      value: patients.length,
      color: "#34D399",
      icon: "👤",
    },
    {
      label: "Appointments",
      value: appointments.length,
      color: "#FBBF24",
      icon: "📅",
    },
  ];

  const doctorCountByDept = (deptId) =>
    doctors.filter((d) => (d.department?._id || d.department) === deptId)
      .length;

  return (
    <div style={s.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body, .shell-root { font-family: 'Inter', sans-serif; }
        .lift:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -18px rgba(15,23,42,0.18) !important; }
        .lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; color: #fff !important; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarGlow} />
        <div style={s.logo}>
          <span style={s.logoIcon}>✚</span>
          <span style={s.logoText}>MediCore</span>
        </div>
        <nav style={s.nav}>
          {NAV.map(({ key, icon, label }) => (
            <button
              key={key}
              className="nav-btn"
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
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {activeTab === "departments" && (
              <AddBtn
                onClick={() => openAdd("department")}
                label="Add Department"
              />
            )}
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
                    <div key={label} style={s.statCard} className="lift">
                      <div style={{ ...s.statAccent, background: color }} />
                      <div style={s.statIcon}>{icon}</div>
                      <div style={{ ...s.statVal, color }}>{value}</div>
                      <div style={s.statLabel}>{label}</div>
                    </div>
                  ))}
                </div>
                <h2 style={s.sectionTitle}>Recent Appointments</h2>
                <Table
                  columns={[
                    "Patient",
                    "Doctor",
                    "Department",
                    "Date",
                    "Status",
                  ]}
                  rows={appointments
                    .slice(0, 6)
                    .map((a) => [
                      a.patient?.name || "—",
                      a.doctor?.name || "—",
                      a.doctor?.department?.name || "—",
                      a.date ? new Date(a.date).toLocaleDateString() : "—",
                      <StatusBadge key={a._id} status={a.status} />,
                    ])}
                  empty="No appointments found"
                />
              </div>
            )}

            {/* DEPARTMENTS */}
            {activeTab === "departments" && (
              <div style={s.deptGrid}>
                {departments.length === 0 ? (
                  <div style={s.emptyState}>
                    No departments found. Click &quot;Add Department&quot; to
                    create one.
                  </div>
                ) : (
                  departments.map((dept) => {
                    const count = doctorCountByDept(dept._id);
                    return (
                      <div key={dept._id} style={s.deptCard} className="lift">
                        <div style={s.deptIconWrap}>{dept.icon || "🏥"}</div>
                        <div style={s.deptInfo}>
                          <div style={s.deptName}>{dept.name}</div>
                          <div style={s.deptDesc}>
                            {dept.description || "No description"}
                          </div>
                          <div style={s.deptCount}>
                            <span style={s.deptCountBadge}>
                              🩺 {count} Doctor{count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div style={s.deptActions}>
                          <button
                            style={s.editBtn}
                            onClick={() => openEdit("department", dept)}
                          >
                            ✏ Edit
                          </button>
                          <button
                            style={s.deleteBtn}
                            onClick={() =>
                              setDeleteConfirm({
                                type: "department",
                                id: dept._id,
                                name: dept.name,
                              })
                            }
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* DOCTORS — grouped by department */}
            {activeTab === "doctors" && (
              <div>
                {departments.length > 0
                  ? departments.map((dept) => {
                      const deptDoctors = doctors.filter(
                        (d) => (d.department?._id || d.department) === dept._id,
                      );
                      if (deptDoctors.length === 0) return null;
                      return (
                        <div key={dept._id} style={{ marginBottom: 32 }}>
                          <div style={s.deptGroupHeader}>
                            <span>{dept.icon}</span>
                            <span>{dept.name}</span>
                            <span style={s.deptGroupCount}>
                              {deptDoctors.length} doctor
                              {deptDoctors.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <Table
                            columns={[
                              "Name",
                              "Specialization",
                              "Email",
                              "Phone",
                              "Fee",
                              "Actions",
                            ]}
                            rows={deptDoctors.map((d) => [
                              d.name,
                              d.specialization || "—",
                              d.email || "—",
                              d.phone || "—",
                              d.fee ? `₹${d.fee}` : "—",
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
                            empty=""
                          />
                        </div>
                      );
                    })
                  : null}
                {(() => {
                  const unassigned = doctors.filter((d) => !d.department);
                  if (unassigned.length === 0) return null;
                  return (
                    <div style={{ marginBottom: 32 }}>
                      <div style={s.deptGroupHeader}>
                        <span>📋</span>
                        <span>Unassigned</span>
                        <span style={s.deptGroupCount}>
                          {unassigned.length} doctor
                          {unassigned.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <Table
                        columns={[
                          "Name",
                          "Specialization",
                          "Email",
                          "Phone",
                          "Fee",
                          "Actions",
                        ]}
                        rows={unassigned.map((d) => [
                          d.name,
                          d.specialization || "—",
                          d.email || "—",
                          d.phone || "—",
                          d.fee ? `₹${d.fee}` : "—",
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
                        empty=""
                      />
                    </div>
                  );
                })()}
                {doctors.length === 0 && (
                  <div style={s.loader}>
                    No doctors found. Click &quot;Add Doctor&quot; to get
                    started.
                  </div>
                )}
              </div>
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
                  "Department",
                  "Date",
                  "Time",
                  "Status",
                  "Actions",
                ]}
                rows={appointments.map((a) => [
                  a.patient?.name || "—",
                  a.doctor?.name || "—",
                  a.doctor?.department?.name || "—",
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
                empty="No appointments found."
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

            {defaultPasswordMsg && (
              <div style={s.successBox}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                  {defaultPasswordMsg}
                </div>
                <div style={{ fontSize: 12, color: "#065f46" }}>
                  ℹ️ Yeh password doctor ko share karo. Woh login karke baad
                  mein change kar sakta hai.
                </div>
              </div>
            )}

            <div style={s.modalBody}>
              {modal.type === "department" && (
                <>
                  <FormRow>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Icon (emoji)</label>
                      <input
                        name="icon"
                        value={formData.icon || ""}
                        onChange={handleFormChange}
                        placeholder="🏥"
                        style={s.input}
                      />
                    </div>
                    <FormField
                      label="Department Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Cardiology"
                    />
                  </FormRow>
                  <FormField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Short description of this department"
                  />
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Status</label>
                    <select
                      name="isActive"
                      value={formData.isActive ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === "true",
                        })
                      }
                      style={s.select}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </>
              )}

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
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Department *</label>
                      <select
                        name="department"
                        value={formData.department || ""}
                        onChange={handleFormChange}
                        style={s.select}
                      >
                        <option value="">— Select Department —</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.icon} {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FormRow>
                  <FormRow>
                    <FormField
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleFormChange}
                      placeholder="e.g. Cardiologist"
                    />
                    <FormField
                      label="Experience (years)"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleFormChange}
                      placeholder="5"
                    />
                  </FormRow>
                  <FormRow>
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
                            {d.name} —{" "}
                            {d.department?.name ||
                              d.specialization ||
                              "General"}
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
              {defaultPasswordMsg ? (
                <button style={s.saveBtn} onClick={closeModal}>
                  Close
                </button>
              ) : (
                <button
                  style={s.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : modal.mode === "add"
                      ? "Add"
                      : "Save Changes"}
                </button>
              )}
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
                style={{
                  ...s.saveBtn,
                  background: "#ef4444",
                  boxShadow: "0 10px 20px -8px rgba(239,68,68,0.45)",
                }}
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
        onFocus={(e) => (e.target.style.borderColor = "#2DD4BF")}
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
const tone = {
  navy: "#0A0E17",
  navyPanel: "#0D1420",
  teal: "#2DD4BF",
  tealDeep: "#0F766E",
};

const s = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "#F3F6FA",
  },
  sidebar: {
    width: 250,
    background: `linear-gradient(180deg, ${tone.navy} 0%, #0c1220 100%)`,
    display: "flex",
    flexDirection: "column",
    padding: "28px 18px",
    position: "sticky",
    top: 0,
    height: "100vh",
    position: "relative",
    overflow: "hidden",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  sidebarGlow: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(45,212,191,0.14), transparent 70%)",
    filter: "blur(6px)",
    pointerEvents: "none",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 8px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 22,
    position: "relative",
    zIndex: 1,
  },
  logoIcon: {
    fontSize: 20,
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    width: 38,
    height: 38,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#04201c",
    boxShadow:
      "0 8px 16px -6px rgba(45,212,191,0.5), 0 1px 0 rgba(255,255,255,0.4) inset",
  },
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 14px",
    borderRadius: 11,
    border: "none",
    background: "transparent",
    color: "#8CA0B8",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
  },
  navActive: {
    background: "rgba(45,212,191,0.12)",
    color: "#fff",
    boxShadow: "inset 3px 0 0 #2DD4BF",
  },
  navIcon: { fontSize: 16 },
  sideFooter: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    position: "relative",
    zIndex: 1,
  },
  userBadge: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
  },
  userName: { color: "#e2e8f0", fontSize: 13, fontWeight: 600 },
  userRole: { color: "#64748b", fontSize: 12, textTransform: "capitalize" },
  logoutBtn: {
    padding: "9px 14px",
    borderRadius: 9,
    border: "1px solid rgba(255,122,122,0.3)",
    background: "transparent",
    color: "#FF7A7A",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
    textAlign: "left",
  },
  main: { flex: 1, padding: "36px 40px", maxWidth: "calc(100vw - 250px)" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 16,
  },
  pageTitle: {
    margin: 0,
    fontSize: 27,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    fontFamily: "'Space Grotesk', sans-serif",
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
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 20px -8px rgba(45,212,191,0.4)",
  },
  loader: { textAlign: "center", padding: 80, color: "#94a3b8", fontSize: 16 },
  emptyState: {
    textAlign: "center",
    padding: 60,
    color: "#94a3b8",
    fontSize: 15,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    background: "#fff",
    borderRadius: 18,
    padding: "26px 22px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 14px 32px -18px rgba(15,23,42,0.14)",
    border: "1px solid #eef2f7",
  },
  statAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 4 },
  statIcon: { fontSize: 26, marginBottom: 10 },
  statVal: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  statLabel: { color: "#64748b", fontSize: 13, marginTop: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 16,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  deptGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
  },
  deptCard: {
    background: "#fff",
    borderRadius: 18,
    padding: "20px 20px",
    boxShadow: "0 14px 32px -18px rgba(15,23,42,0.14)",
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    border: "1px solid #eef2f7",
  },
  deptIconWrap: {
    fontSize: 30,
    minWidth: 52,
    height: 52,
    borderRadius: 14,
    background: "rgba(45,212,191,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deptInfo: { flex: 1 },
  deptName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 4,
  },
  deptDesc: { fontSize: 13, color: "#64748b", marginBottom: 8 },
  deptCount: {},
  deptCountBadge: {
    display: "inline-block",
    background: "rgba(45,212,191,0.12)",
    color: "#0F766E",
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
  },
  deptActions: { display: "flex", flexDirection: "column", gap: 6 },
  deptGroupHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 12,
    padding: "10px 0",
    borderBottom: "2px solid #e2e8f0",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  deptGroupCount: {
    fontSize: 12,
    fontWeight: 600,
    background: "#f1f5f9",
    color: "#64748b",
    padding: "2px 10px",
    borderRadius: 20,
  },
  tableWrap: {
    background: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 14px 32px -18px rgba(15,23,42,0.14)",
    border: "1px solid #eef2f7",
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
  rowOdd: { background: "#fafbfd" },
  emptyCell: {
    padding: "48px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
  },
  editBtn: {
    padding: "5px 12px",
    borderRadius: 7,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#0F766E",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "5px 12px",
    borderRadius: 7,
    border: "1.5px solid #fee2e2",
    background: "#fff",
    color: "#ef4444",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,14,23,0.6)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 22,
    width: "100%",
    maxWidth: 600,
    boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
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
  modalTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    fontFamily: "'Space Grotesk', sans-serif",
  },
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
  successBox: {
    margin: "12px 24px 0",
    background: "#d1fae5",
    color: "#065f46",
    padding: "14px 16px",
    borderRadius: 10,
    fontSize: 13,
    border: "1.5px solid #6ee7b7",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "10px 13px",
    borderRadius: 9,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#f8fafc",
  },
  select: {
    padding: "10px 13px",
    borderRadius: 9,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    background: "#f8fafc",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 9,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  saveBtn: {
    padding: "10px 24px",
    borderRadius: 9,
    border: "none",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 20px -8px rgba(45,212,191,0.4)",
  },
};
