// src/pages/Patientdashboard.jsx
// Redesign: same logic/state/API/Razorpay flow — only presentation layer
// changed. Dark glass sidebar + soft light content area with embossed 3D
// card shadows. Sky-teal accent matches the patient-facing brand color.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  authAPI,
  doctorsAPI,
  patientsAPI,
  appointmentsAPI,
  paymentAPI,
  departmentsAPI,
} from "../services/api";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";
import { getUser } from "../utils/auth";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = getUser() || {};

  const [activeTab, setActiveTab] = useState("book");
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myPatient, setMyPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");

  const [bookForm, setBookForm] = useState({
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [bookError, setBookError] = useState("");
  const [booking, setBooking] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const NAV = [
    { key: "book", icon: "📋", label: t("bookAppointmentTab") },
    { key: "myappointments", icon: "📅", label: t("myAppointments") },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, patRes, deptRes] = await Promise.all([
        doctorsAPI.getAll(),
        patientsAPI.getMe(),
        departmentsAPI.getAll(),
      ]);
      setDoctors(docRes.data || []);
      setDepartments(deptRes.data || []);
      const me = patRes.data || null;
      setMyPatient(me);
      if (me) {
        const apptRes = await appointmentsAPI.getAll();
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

  const filteredDoctors =
    selectedDept === "all"
      ? doctors
      : doctors.filter(
          (d) => (d.department?._id || d.department) === selectedDept,
        );

  const selectedDoctor = doctors.find((d) => d._id === bookForm.doctorId);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookForm.doctorId || !bookForm.date || !bookForm.time) {
      setBookError("Please select a doctor, date and time.");
      return;
    }
    if (!myPatient) {
      setBookError(
        "Patient profile not found. Please logout and register again.",
      );
      return;
    }

    setBooking(true);
    setBookError("");

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

      let orderRes;
      try {
        orderRes = await paymentAPI.createOrder({
          amount: appt?.fee || payload.fee || 0,
          appointmentId: appt._id,
        });
      } catch (err) {
        setBookError(
          "Payment failed or cancelled. Your appointment is saved as pending — you can retry payment from My Appointments.",
        );
        setBookForm({ doctorId: "", date: "", time: "", notes: "" });
        await fetchData();
        setBooking(false);
        return;
      }

      const { order, key_id } = orderRes.data || {};

      const loadRzp = () =>
        new Promise((resolve) => {
          if (window.Razorpay) return resolve(true);
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      const loaded = await loadRzp();
      if (!loaded || !order) {
        setBookError(
          "Payment failed or cancelled. Your appointment is saved as pending — you can retry payment from My Appointments.",
        );
        setBookForm({ doctorId: "", date: "", time: "", notes: "" });
        await fetchData();
        setBooking(false);
        return;
      }

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "MediCore",
        description: "Appointment Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId: appt._id,
            });

            if (verifyRes.data?.success) {
              setReceipt({
                appointmentId: appt._id,
                doctorName: selectedDoctor?.name,
                department:
                  selectedDoctor?.department?.name ||
                  selectedDoctor?.specialization ||
                  "—",
                specialization: selectedDoctor?.specialization,
                date: bookForm.date,
                time: bookForm.time,
                fee: selectedDoctor?.fee || 0,
                patientName: myPatient.name,
              });
              setBookForm({ doctorId: "", date: "", time: "", notes: "" });
              await fetchData();
            } else {
              setBookError(
                "Payment failed or cancelled. Your appointment is saved as pending — you can retry payment from My Appointments.",
              );
            }
          } catch (err) {
            setBookError(
              "Payment failed or cancelled. Your appointment is saved as pending — you can retry payment from My Appointments.",
            );
          } finally {
            setBooking(false);
          }
        },
        modal: {
          ondismiss: function () {
            setBookError(
              "Payment failed or cancelled. Your appointment is saved as pending — you can retry payment from My Appointments.",
            );
            setBooking(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setBookError(err.response?.data?.message || "Booking failed. Try again.");
      setBooking(false);
    }
  };

  return (
    <div style={s.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .lift:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -18px rgba(15,23,42,0.18) !important; }
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
              <span>{icon}</span> {label}
            </button>
          ))}
        </nav>
        <div style={s.sideFooter}>
          <div style={{ marginBottom: 12 }}>
            <LanguageSwitcher style={{ width: "100%" }} />
          </div>
          <div style={s.userBadge}>
            <div style={s.avatar}>{(user.name || "P")[0].toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user.name || "Patient"}</div>
              <div style={s.userRole}>Patient</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>
            ↩ {t("logout")}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>
              {activeTab === "book"
                ? t("bookAppointmentTab")
                : t("myAppointments")}
            </h1>
            <p style={s.pageDate}>{new Date().toDateString()}</p>
          </div>
        </div>

        {loading ? (
          <div style={s.loader}>Loading…</div>
        ) : (
          <>
            {/* ── BOOK TAB ── */}
            {activeTab === "book" && (
              <div style={s.bookGrid}>
                <div style={s.bookCard}>
                  <h2 style={s.cardTitle}>{t("newAppointment")}</h2>

                  {bookError && <div style={s.errorBox}>⚠ {bookError}</div>}
                  {!myPatient && (
                    <div style={s.warnBox}>
                      ⚠ Patient profile not found. Please logout and register
                      again.
                    </div>
                  )}

                  <form onSubmit={handleBook} style={s.form}>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>{t("selectDoctor")} *</label>
                      <select
                        style={s.select}
                        value={bookForm.doctorId}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, doctorId: e.target.value })
                        }
                      >
                        <option value="">{t("chooseDoctor")}</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name} —{" "}
                            {d.department?.name ||
                              d.specialization ||
                              "General"}{" "}
                            (₹{d.fee || 500})
                          </option>
                        ))}
                      </select>
                    </div>

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
                            {selectedDoctor.department?.icon}{" "}
                            {selectedDoctor.department?.name ||
                              selectedDoctor.specialization}{" "}
                            · {selectedDoctor.experience} yrs
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#0F766E",
                              fontWeight: 700,
                            }}
                          >
                            Fee: ₹{selectedDoctor.fee || 500}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={s.row}>
                      <div style={s.fieldGroup}>
                        <label style={s.label}>{t("date")} *</label>
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
                        <label style={s.label}>{t("time")} *</label>
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
                      <label style={s.label}>{t("notes")}</label>
                      <textarea
                        style={{ ...s.input, height: 80, resize: "vertical" }}
                        placeholder={t("notesPlaceholder")}
                        value={bookForm.notes}
                        onChange={(e) =>
                          setBookForm({ ...bookForm, notes: e.target.value })
                        }
                      />
                    </div>

                    <button type="submit" style={s.bookBtn} disabled={booking}>
                      {booking ? t("booking") : t("bookingBtn")}
                    </button>
                  </form>
                </div>

                <div>
                  <h3 style={s.availTitle}>{t("availableDoctors")}</h3>
                  <div style={s.deptTabs}>
                    <button
                      style={{
                        ...s.deptTab,
                        ...(selectedDept === "all" ? s.deptTabActive : {}),
                      }}
                      onClick={() => setSelectedDept("all")}
                    >
                      All ({doctors.length})
                    </button>
                    {departments.map((dept) => {
                      const count = doctors.filter(
                        (d) => (d.department?._id || d.department) === dept._id,
                      ).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={dept._id}
                          style={{
                            ...s.deptTab,
                            ...(selectedDept === dept._id
                              ? s.deptTabActive
                              : {}),
                          }}
                          onClick={() => setSelectedDept(dept._id)}
                        >
                          {dept.icon} {dept.name} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {filteredDoctors.length === 0 ? (
                    <div style={s.emptyDoctors}>
                      No doctors available in this department.
                    </div>
                  ) : (
                    <div style={s.doctorList}>
                      {filteredDoctors.map((d) => (
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
                          <div style={s.docAvatar}>{d.name[0]}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                              {d.name}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                              {d.department
                                ? `${d.department.icon} ${d.department.name}`
                                : d.specialization || "General"}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#0F766E",
                                fontWeight: 600,
                              }}
                            >
                              ₹{d.fee || 500}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MY APPOINTMENTS TAB ── */}
            {activeTab === "myappointments" && (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {[
                        "Doctor",
                        "Department",
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
                          {t("noAppointmentsYet")}{" "}
                          <span
                            style={{
                              color: "#0F766E",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            onClick={() => setActiveTab("book")}
                          >
                            {t("bookNow") || "Book now →"}
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
                            {a.doctor?.department?.name ||
                              a.doctor?.specialization ||
                              "—"}
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
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <h2
                style={{
                  margin: "8px 0 4px",
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Appointment Booked!
              </h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Confirmation Receipt
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                [
                  "Appointment ID",
                  `#${receipt.appointmentId?.slice(-8).toUpperCase()}`,
                ],
                ["Patient", receipt.patientName],
                ["Doctor", receipt.doctorName],
                ["Department", receipt.department],
                [
                  "Date",
                  new Date(receipt.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                ],
                ["Time", receipt.time],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: 8,
                  }}
                >
                  <span style={{ color: "#64748b", fontSize: 14 }}>{k}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(45,212,191,0.1)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <span style={{ fontWeight: 700 }}>Consultation Fee</span>
                <span
                  style={{ color: "#0F766E", fontWeight: 800, fontSize: 18 }}
                >
                  ₹{receipt.fee}
                </span>
              </div>
            </div>
            <div
              style={{
                background: "#fef3c7",
                color: "#92400e",
                padding: 12,
                borderRadius: 10,
                fontSize: 13,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              📩 Please arrive 10 minutes early.
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

const tone = {
  navy: "#0A0E17",
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
    background: `linear-gradient(180deg, ${tone.navy} 0%, #0d1a1a 100%)`,
    display: "flex",
    flexDirection: "column",
    padding: "28px 18px",
    position: "sticky",
    top: 0,
    height: "100vh",
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
  userRole: { color: "#64748b", fontSize: 12 },
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
  main: { flex: 1, padding: "36px 40px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  pageTitle: {
    margin: 0,
    fontSize: 27,
    fontWeight: 800,
    color: "#0f172a",
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: "-0.02em",
  },
  pageDate: { color: "#94a3b8", fontSize: 13, margin: "4px 0 0" },
  loader: { textAlign: "center", padding: 80, color: "#94a3b8" },
  bookGrid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32 },
  bookCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 32,
    boxShadow: "0 14px 32px -18px rgba(15,23,42,0.14)",
    border: "1px solid #eef2f7",
  },
  cardTitle: {
    margin: "0 0 24px",
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "11px 13px",
    borderRadius: 9,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    background: "#f8fafc",
  },
  select: {
    padding: "11px 13px",
    borderRadius: 9,
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
    background: "rgba(45,212,191,0.08)",
    border: "1.5px solid rgba(45,212,191,0.3)",
    borderRadius: 14,
    padding: "14px 16px",
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(145deg,#2DD4BF,#0F766E)",
    color: "#04201c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 18,
  },
  bookBtn: {
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 14px 28px -10px rgba(45,212,191,0.45)",
  },
  availTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
    color: "#0f172a",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  deptTabs: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  deptTab: {
    padding: "6px 12px",
    borderRadius: 20,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  deptTabActive: {
    background: tone.teal,
    color: "#04201c",
    border: "1.5px solid transparent",
  },
  emptyDoctors: {
    padding: 20,
    textAlign: "center",
    color: "#94a3b8",
    background: "#fff",
    borderRadius: 14,
  },
  doctorList: { display: "flex", flexDirection: "column", gap: 10 },
  doctorListCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  doctorListCardActive: {
    border: `1.5px solid ${tone.teal}`,
    background: "rgba(45,212,191,0.06)",
  },
  docAvatar: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: "linear-gradient(145deg,#2DD4BF,#0F766E)",
    color: "#04201c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
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
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: 9,
    fontSize: 13,
    marginBottom: 4,
  },
  warnBox: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "10px 14px",
    borderRadius: 9,
    fontSize: 13,
    marginBottom: 4,
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
  receiptModal: {
    background: "#fff",
    borderRadius: 24,
    padding: 32,
    maxWidth: 460,
    width: "100%",
    boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
  },
  receiptCloseBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: 11,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },
  receiptViewBtn: {
    flex: 2,
    padding: "12px",
    borderRadius: 11,
    border: "none",
    background: tone.navy,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};
