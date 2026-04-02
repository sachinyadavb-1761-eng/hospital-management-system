import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getUser, logout, getDashboardPath } from "../utils/auth";

const DOCTORS = [
  {
    name: "Dr. Aryan Mehta",
    spec: "Cardiologist",
    exp: "12 yrs",
    img: "AM",
    color: "#0ea5e9",
  },
  {
    name: "Dr. Priya Sharma",
    spec: "Neurologist",
    exp: "9 yrs",
    img: "PS",
    color: "#8b5cf6",
  },
  {
    name: "Dr. Rohan Verma",
    spec: "Orthopedic",
    exp: "15 yrs",
    img: "RV",
    color: "#10b981",
  },
  {
    name: "Dr. Sneha Gupta",
    spec: "Pediatrician",
    exp: "7 yrs",
    img: "SG",
    color: "#f59e0b",
  },
];

const SERVICES = [
  {
    icon: "🫀",
    title: "Cardiology",
    desc: "Advanced heart care with cutting-edge diagnostics and treatment.",
  },
  {
    icon: "🧠",
    title: "Neurology",
    desc: "Expert brain & nervous system care for complex conditions.",
  },
  {
    icon: "🦴",
    title: "Orthopedics",
    desc: "Bone, joint and spine treatments with modern techniques.",
  },
  {
    icon: "👶",
    title: "Pediatrics",
    desc: "Compassionate healthcare for children of all ages.",
  },
  {
    icon: "👁️",
    title: "Ophthalmology",
    desc: "Complete eye care from routine checks to surgery.",
  },
  {
    icon: "🦷",
    title: "Dentistry",
    desc: "Full dental care including cosmetic and restorative work.",
  },
];

const PAYMENT_METHODS = [
  { icon: "💳", name: "Credit / Debit Card" },
  { icon: "📱", name: "UPI" },
  { icon: "🏦", name: "Net Banking" },
  { icon: "💰", name: "Cash" },
  { icon: "📲", name: "Paytm / PhonePe" },
  { icon: "🌐", name: "Razorpay" },
];

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const loggedIn = isLoggedIn();
  const authUser = loggedIn ? getUser() : null;
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  const handleContact = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <div style={s.root}>
      {/* ── Navbar ── */}
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoMark}>✚</div>
            <span style={s.logoText}>MediCore</span>
          </div>
          <div style={s.navLinks}>
            {["home", "services", "doctors", "about", "contact"].map((sec) => (
              <button
                key={sec}
                style={{
                  ...s.navLink,
                  ...(activeSection === sec ? s.navLinkActive : {}),
                }}
                onClick={() => scrollTo(sec)}
              >
                {sec.charAt(0).toUpperCase() + sec.slice(1)}
              </button>
            ))}
          </div>
          <div style={s.navActions}>
            {loggedIn && authUser ? (
              <>
                <span style={s.navUserName}>
                  👤 {authUser.name?.split(" ")[0] || authUser.email}
                </span>
                <span style={s.navRoleBadge}>{authUser.role}</span>
                <button
                  style={s.dashboardBtn}
                  onClick={() => navigate(getDashboardPath(authUser.role))}
                >
                  My Dashboard →
                </button>
                <button style={s.navLogoutBtn} onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button style={s.loginBtn} onClick={() => navigate("/login")}>
                  Login
                </button>
                <button
                  style={s.registerBtn}
                  onClick={() => navigate("/register")}
                >
                  Register Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="home" style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroGrid} />
        <div style={s.heroContent}>
          <div style={s.heroTag}>
            🏥 India's #1 Hospital Management Platform
          </div>
          <h1 style={s.heroTitle}>
            Your Health, <br />
            <span style={s.heroAccent}>Our Priority</span>
          </h1>
          <p style={s.heroDesc}>
            Book appointments, consult top doctors, and manage your health
            journey — all in one place.
          </p>
          <div style={s.heroBtns}>
            <button
              style={s.heroCtaPrimary}
              onClick={() => navigate("/register")}
            >
              Book Appointment →
            </button>
            <button
              style={s.heroCtaSecondary}
              onClick={() => scrollTo("services")}
            >
              Explore Services
            </button>
          </div>
          <div style={s.heroStats}>
            {[
              ["500+", "Doctors"],
              ["50K+", "Patients"],
              ["98%", "Satisfaction"],
            ].map(([val, label]) => (
              <div key={label} style={s.heroStat}>
                <span style={s.heroStatVal}>{val}</span>
                <span style={s.heroStatLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={s.heroVisual}>
          <div style={s.heroCard}>
            <div style={s.heroCardHeader}>
              <div style={s.heroCardDot} />
              <span style={s.heroCardTitle}>Next Appointment</span>
            </div>
            <div style={s.heroCardDoctor}>
              <div style={{ ...s.heroCardAvatar, background: "#0ea5e9" }}>
                AM
              </div>
              <div>
                <div style={s.heroCardName}>Dr. Aryan Mehta</div>
                <div style={s.heroCardSpec}>Cardiologist</div>
              </div>
            </div>
            <div style={s.heroCardStatus}>✅ Confirmed</div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionTag}>What We Offer</div>
          <h2 style={s.sectionTitle}>
            Our <span style={s.accent}>Specializations</span>
          </h2>
          <div style={s.serviceGrid}>
            {SERVICES.map((sv) => (
              <div key={sv.title} style={s.serviceCard}>
                <div style={s.serviceIcon}>{sv.icon}</div>
                <h3 style={s.serviceTitle}>{sv.title}</h3>
                <p style={s.serviceDesc}>{sv.desc}</p>
                <button
                  style={s.serviceBtn}
                  onClick={() => navigate("/register")}
                >
                  Book Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ── */}
      <section id="doctors" style={{ ...s.section, background: "#f8fafc" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionTag}>Meet The Team</div>
          <h2 style={s.sectionTitle}>
            Our <span style={s.accent}>Top Doctors</span>
          </h2>
          <div style={s.doctorGrid}>
            {DOCTORS.map((doc) => (
              <div key={doc.name} style={s.doctorCard}>
                <div style={{ ...s.doctorAvatar, background: doc.color }}>
                  {doc.img}
                </div>
                <h3 style={s.doctorName}>{doc.name}</h3>
                <div style={s.doctorSpec}>{doc.spec}</div>
                <button
                  style={s.doctorBtn}
                  onClick={() => navigate("/register")}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payment ── */}
      <section style={{ ...s.section, background: "#0f172a" }}>
        <div style={s.sectionInner}>
          <h2 style={{ ...s.sectionTitle, color: "#fff", textAlign: "center" }}>
            All Payment Methods
          </h2>
          <div style={s.paymentGrid}>
            {PAYMENT_METHODS.map((pm) => (
              <div key={pm.name} style={s.paymentCard}>
                <span style={s.paymentIcon}>{pm.icon}</span>
                <span style={s.paymentName}>{pm.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.contactGrid}>
            <div style={s.contactInfo}>
              <h2 style={s.sectionTitle}>
                Contact <span style={s.accent}>Us</span>
              </h2>
              <p>📍 123 Medical Hub, New Delhi, India</p>
              <p>📞 +91 98765 43210</p>
            </div>
            <form onSubmit={handleContact} style={s.contactForm}>
              {submitted && <div style={s.successBox}>✅ Message sent!</div>}
              <input style={s.contactInput} placeholder="Your Name" required />
              <input
                style={s.contactInput}
                type="email"
                placeholder="Your Email"
                required
              />
              <textarea
                style={{ ...s.contactInput, height: 100 }}
                placeholder="Message"
                required
              />
              <button type="submit" style={s.contactBtn}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={{ color: "#fff", fontWeight: 800 }}>MediCore</span>
          <p style={s.footerCopy}>© 2026 MediCore. All rights reserved.</p>
          <div style={s.footerStaffLinks}>
            <span style={s.footerStaffLabel}>Staff Access:</span>
            <button
              style={s.footerStaffBtn}
              onClick={() => navigate("/doctor-login")}
            >
              🩺 Doctor Login
            </button>
            <span style={{ color: "#334155" }}>·</span>
            <button
              style={s.footerStaffBtn}
              onClick={() => navigate("/admin-login")}
            >
              🔐 Admin Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'Inter', sans-serif",
    background: "#fff",
    overflowX: "hidden",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "20px 0",
    transition: "all 0.3s",
  },
  navScrolled: {
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
    padding: "14px 0",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: {
    width: 36,
    height: 36,
    background: "#0ea5e9",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 900,
  },
  logoText: { fontSize: 20, fontWeight: 800, color: "#0f172a" },
  navLinks: { display: "flex", gap: 4 },
  navLink: {
    padding: "8px 16px",
    border: "none",
    background: "transparent",
    color: "#475569",
    fontSize: 15,
    cursor: "pointer",
  },
  navLinkActive: { color: "#0ea5e9", fontWeight: 700 },
  navActions: { display: "flex", gap: 12, alignItems: "center" },

  // NEW: Staff Link Style
  staffLink: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
  },

  loginBtn: {
    padding: "9px 20px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "transparent",
    fontWeight: 600,
    cursor: "pointer",
  },
  registerBtn: {
    padding: "9px 20px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  // Auth-aware navbar items
  navUserName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
  },
  navRoleBadge: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "capitalize",
    background: "#dbeafe",
    color: "#1e40af",
    padding: "3px 10px",
    borderRadius: 20,
  },
  dashboardBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  navLogoutBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "transparent",
    color: "#ef4444",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    background: "#0f172a",
    padding: "120px 40px",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 20% 50%, rgba(14,165,233,0.15), transparent)",
  },
  heroGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  },
  heroContent: { flex: 1, position: "relative", zIndex: 1 },
  heroTag: {
    display: "inline-block",
    background: "rgba(14,165,233,0.1)",
    color: "#38bdf8",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 60,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.1,
    marginBottom: 20,
  },
  heroAccent: { color: "#0ea5e9" },
  heroDesc: { fontSize: 18, color: "#94a3b8", marginBottom: 30, maxWidth: 500 },
  heroBtns: { display: "flex", gap: 15, marginBottom: 40 },
  heroCtaPrimary: {
    padding: "14px 28px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  heroCtaSecondary: {
    padding: "14px 28px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
  heroStats: { display: "flex", gap: 30 },
  heroStatVal: {
    fontSize: 24,
    fontWeight: 800,
    color: "#fff",
    display: "block",
  },
  heroStatLabel: { fontSize: 12, color: "#64748b" },
  heroVisual: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    position: "relative",
  },
  heroCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 20,
    width: 250,
  },
  heroCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  heroCardDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10b981",
  },
  heroCardTitle: { color: "#94a3b8", fontSize: 12 },
  heroCardDoctor: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },
  heroCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
  },
  heroCardName: { color: "#fff", fontSize: 14, fontWeight: 600 },
  heroCardSpec: { color: "#64748b", fontSize: 12 },
  heroCardStatus: { color: "#10b981", fontSize: 12, fontWeight: 600 },
  section: { padding: "80px 40px" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  sectionTag: {
    color: "#0ea5e9",
    fontWeight: 700,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 10,
    display: "block",
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 40,
  },
  accent: { color: "#0ea5e9" },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
  },
  serviceCard: {
    padding: 30,
    borderRadius: 20,
    border: "1px solid #f1f5f9",
    background: "#fff",
  },
  serviceIcon: { fontSize: 40, marginBottom: 20 },
  serviceTitle: { fontSize: 20, fontWeight: 700, marginBottom: 10 },
  serviceDesc: { color: "#64748b", fontSize: 14, marginBottom: 20 },
  serviceBtn: {
    background: "transparent",
    border: "none",
    color: "#0ea5e9",
    fontWeight: 700,
    cursor: "pointer",
  },
  doctorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },
  doctorCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 20,
    textAlign: "center",
    border: "1px solid #f1f5f9",
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    margin: "0 auto 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
  },
  doctorName: { fontSize: 16, fontWeight: 700, marginBottom: 5 },
  doctorSpec: { color: "#0ea5e9", fontSize: 13, marginBottom: 15 },
  doctorBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 15,
  },
  paymentCard: {
    background: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  paymentIcon: { fontSize: 20 },
  paymentName: { color: "#fff", fontSize: 14 },
  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50 },
  contactInfo: { display: "flex", flexDirection: "column", gap: 15 },
  contactForm: { display: "flex", flexDirection: "column", gap: 15 },
  contactInput: {
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    outline: "none",
  },
  contactBtn: {
    padding: "12px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  successBox: {
    background: "#d1fae5",
    color: "#065f46",
    padding: "10px",
    borderRadius: 8,
    marginBottom: 10,
  },
  footer: { background: "#0f172a", padding: "40px", textAlign: "center" },
  footerCopy: { color: "#64748b", fontSize: 12, marginTop: 10 },
  footerStaffLinks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #1e293b",
  },
  footerStaffLabel: { color: "#475569", fontSize: 12 },
  footerStaffBtn: {
    background: "transparent",
    border: "1px solid #1e293b",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 20,
    cursor: "pointer",
  },
};
