// src/pages/Home.jsx
// Changes:
// 1. useLanguage hook — t() se saare texts translate hote hain
// 2. LanguageSwitcher component navbar mein add kiya
// 3. Responsive CSS — mobile/tablet/desktop sab handle
// 4. Password eye icon yahan nahi (login pages mein hai)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getUser, logout, getDashboardPath } from "../utils/auth";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";

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

const SERVICES_DATA = [
  {
    icon: "🫀",
    titleKey: "Cardiology",
    descKey: "Advanced heart care with cutting-edge diagnostics and treatment.",
  },
  {
    icon: "🧠",
    titleKey: "Neurology",
    descKey: "Expert brain & nervous system care for complex conditions.",
  },
  {
    icon: "🦴",
    titleKey: "Orthopedics",
    descKey: "Bone, joint and spine treatments with modern techniques.",
  },
  {
    icon: "👶",
    titleKey: "Pediatrics",
    descKey: "Compassionate healthcare for children of all ages.",
  },
  {
    icon: "👁️",
    titleKey: "Ophthalmology",
    descKey: "Complete eye care from routine checks to surgery.",
  },
  {
    icon: "🦷",
    titleKey: "Dentistry",
    descKey: "Full dental care including cosmetic and restorative work.",
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
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
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
          {/* Logo */}
          <div style={s.logo}>
            <div style={s.logoMark}>✚</div>
            <span style={s.logoText}>MediCore</span>
          </div>

          {/* Desktop Nav Links */}
          <div style={s.navLinks} className="nav-links-desktop">
            {["home", "services", "doctors", "about", "contact"].map((sec) => (
              <button
                key={sec}
                style={{
                  ...s.navLink,
                  ...(activeSection === sec ? s.navLinkActive : {}),
                }}
                onClick={() => scrollTo(sec)}
              >
                {t(sec)}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div style={s.navActions} className="nav-actions-desktop">
            {/* Language Switcher */}
            <LanguageSwitcher />

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
                  {t("myDashboard")}
                </button>
                <button style={s.navLogoutBtn} onClick={logout}>
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <button style={s.loginBtn} onClick={() => navigate("/login")}>
                  {t("login")}
                </button>
                <button
                  style={s.registerBtn}
                  onClick={() => navigate("/register")}
                >
                  {t("registerFree")}
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            style={s.hamburger}
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={s.mobileMenu}>
            {["home", "services", "doctors", "about", "contact"].map((sec) => (
              <button
                key={sec}
                style={s.mobileNavLink}
                onClick={() => scrollTo(sec)}
              >
                {t(sec)}
              </button>
            ))}
            <div style={s.mobileDivider} />
            <LanguageSwitcher
              style={{ justifyContent: "center", marginBottom: 8 }}
            />
            {loggedIn && authUser ? (
              <>
                <button
                  style={s.mobileDashBtn}
                  onClick={() => {
                    navigate(getDashboardPath(authUser.role));
                    setMenuOpen(false);
                  }}
                >
                  {t("myDashboard")}
                </button>
                <button style={s.mobileLogoutBtn} onClick={logout}>
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <button
                  style={s.mobileLoginBtn}
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                >
                  {t("login")}
                </button>
                <button
                  style={s.mobileRegisterBtn}
                  onClick={() => {
                    navigate("/register");
                    setMenuOpen(false);
                  }}
                >
                  {t("registerFree")}
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="home" style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroGrid} />
        <div style={s.heroContent}>
          <div style={s.heroTag}>🏥 {t("tagline")}</div>
          <h1 style={s.heroTitle}>
            {t("heroTitle1")} <br />
            <span style={s.heroAccent}>{t("heroTitle2")}</span>
          </h1>
          <p style={s.heroDesc}>{t("heroDesc")}</p>
          <div style={s.heroBtns}>
            <button
              style={s.heroCtaPrimary}
              onClick={() => navigate("/register")}
            >
              {t("bookAppointment")}
            </button>
            <button
              style={s.heroCtaSecondary}
              onClick={() => scrollTo("services")}
            >
              {t("exploreServices")}
            </button>
          </div>
          <div style={s.heroStats}>
            {[
              ["500+", t("statDoctors")],
              ["50K+", t("statPatients")],
              ["98%", t("statSatisfaction")],
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
              <span style={s.heroCardTitle}>{t("nextAppointment")}</span>
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
            <div style={s.heroCardStatus}>{t("confirmed")}</div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionTag}>{t("whatWeOffer")}</div>
          <h2 style={s.sectionTitle}>
            {t("ourSpecializations").split(" ").slice(0, -1).join(" ")}{" "}
            <span style={s.accent}>
              {t("ourSpecializations").split(" ").slice(-1)}
            </span>
          </h2>
          <div style={s.serviceGrid}>
            {SERVICES_DATA.map((sv) => (
              <div key={sv.titleKey} style={s.serviceCard}>
                <div style={s.serviceIcon}>{sv.icon}</div>
                <h3 style={s.serviceTitle}>{sv.titleKey}</h3>
                <p style={s.serviceDesc}>{sv.descKey}</p>
                <button
                  style={s.serviceBtn}
                  onClick={() => navigate("/register")}
                >
                  {t("bookNow")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ── */}
      <section id="doctors" style={{ ...s.section, background: "#f8fafc" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionTag}>{t("meetTheTeam")}</div>
          <h2 style={s.sectionTitle}>
            {t("ourTopDoctors").split(" ").slice(0, -2).join(" ")}{" "}
            <span style={s.accent}>
              {t("ourTopDoctors").split(" ").slice(-2).join(" ")}
            </span>
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
                  {t("bookAppointment")}
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
            {t("allPaymentMethods")}
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
                {t("contactUs").split(" ")[0]}{" "}
                <span style={s.accent}>
                  {t("contactUs").split(" ").slice(1).join(" ")}
                </span>
              </h2>
              <p>{t("address")}</p>
              <p>{t("phone")}</p>
            </div>
            <form onSubmit={handleContact} style={s.contactForm}>
              {submitted && <div style={s.successBox}>{t("messageSent")}</div>}
              <input
                style={s.contactInput}
                placeholder={t("yourName")}
                required
              />
              <input
                style={s.contactInput}
                type="email"
                placeholder={t("yourEmail")}
                required
              />
              <textarea
                style={{ ...s.contactInput, height: 100 }}
                placeholder={t("message")}
                required
              />
              <button type="submit" style={s.contactBtn}>
                {t("sendMessage")}
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
        </div>
      </footer>

      {/* ── Responsive Styles (CSS-in-JS via style tag) ── */}
      <style>{`
        /* ── Mobile (max 640px) ── */
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-actions-desktop { display: none !important; }
          .hamburger { display: flex !important; }
        }
        /* ── Tablet & Desktop ── */
        @media (min-width: 641px) {
          .hamburger { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'Inter', sans-serif",
    background: "#fff",
    overflowX: "hidden",
  },

  // ── Navbar ──
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
    padding: "0 clamp(16px, 4vw, 40px)", // responsive padding
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logo: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
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
  logoText: {
    fontSize: "clamp(16px, 2vw, 20px)",
    fontWeight: 800,
    color: "#0f172a",
  },
  navLinks: { display: "flex", gap: 4 },
  navLink: {
    padding: "8px 14px",
    border: "none",
    background: "transparent",
    color: "#475569",
    fontSize: "clamp(13px, 1.2vw, 15px)",
    cursor: "pointer",
  },
  navLinkActive: { color: "#0ea5e9", fontWeight: 700 },
  navActions: { display: "flex", gap: 8, alignItems: "center" },
  loginBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "transparent",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  registerBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  navUserName: { fontSize: 13, fontWeight: 600, color: "#0f172a" },
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
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  navLogoutBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "transparent",
    color: "#ef4444",
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  },

  // ── Hamburger ──
  hamburger: {
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    border: "1.5px solid rgba(255,255,255,0.3)",
    borderRadius: 10,
    background: "transparent",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    flexShrink: 0,
  },

  // ── Mobile Menu ──
  mobileMenu: {
    background: "rgba(15,23,42,0.97)",
    backdropFilter: "blur(12px)",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  mobileNavLink: {
    padding: "12px 16px",
    border: "none",
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: 500,
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
  },
  mobileDivider: {
    height: 1,
    background: "rgba(255,255,255,0.1)",
    margin: "8px 0",
  },
  mobileLoginBtn: {
    padding: "12px",
    border: "1.5px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
    fontWeight: 600,
    borderRadius: 10,
    cursor: "pointer",
  },
  mobileRegisterBtn: {
    padding: "12px",
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 700,
    borderRadius: 10,
    cursor: "pointer",
  },
  mobileDashBtn: {
    padding: "12px",
    border: "none",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    borderRadius: 10,
    cursor: "pointer",
  },
  mobileLogoutBtn: {
    padding: "12px",
    border: "1.5px solid rgba(239,68,68,0.4)",
    background: "transparent",
    color: "#f87171",
    fontWeight: 600,
    borderRadius: 10,
    cursor: "pointer",
  },

  // ── Hero ──
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    position: "relative",
    background: "#0f172a",
    padding:
      "clamp(100px, 12vw, 140px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 80px)",
    gap: 40,
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
  heroContent: {
    flex: "1 1 300px",
    position: "relative",
    zIndex: 1,
    minWidth: 0,
  },
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
    fontSize: "clamp(32px, 6vw, 64px)",
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.1,
    marginBottom: 20,
  },
  heroAccent: { color: "#0ea5e9" },
  heroDesc: {
    fontSize: "clamp(14px, 1.5vw, 18px)",
    color: "#94a3b8",
    marginBottom: 30,
    maxWidth: 500,
  },
  heroBtns: { display: "flex", gap: 15, marginBottom: 40, flexWrap: "wrap" },
  heroCtaPrimary: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "clamp(13px, 1.2vw, 15px)",
  },
  heroCtaSecondary: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: "clamp(13px, 1.2vw, 15px)",
  },
  heroStats: {
    display: "flex",
    gap: "clamp(16px, 3vw, 30px)",
    flexWrap: "wrap",
  },
  heroStat: {},
  heroStatVal: {
    fontSize: "clamp(18px, 2.5vw, 24px)",
    fontWeight: 800,
    color: "#fff",
    display: "block",
  },
  heroStatLabel: { fontSize: 12, color: "#64748b" },
  heroVisual: {
    flex: "0 1 300px",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  heroCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 20,
    width: "min(250px, 80vw)",
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
    flexShrink: 0,
  },
  heroCardName: { color: "#fff", fontSize: 14, fontWeight: 600 },
  heroCardSpec: { color: "#64748b", fontSize: 12 },
  heroCardStatus: { color: "#10b981", fontSize: 12, fontWeight: 600 },

  // ── Sections ──
  section: { padding: "clamp(50px, 8vw, 80px) clamp(16px, 4vw, 40px)" },
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
    fontSize: "clamp(24px, 3.5vw, 36px)",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 40,
  },
  accent: { color: "#0ea5e9" },

  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
    gap: 20,
  },
  serviceCard: {
    padding: "clamp(20px, 3vw, 30px)",
    borderRadius: 20,
    border: "1px solid #f1f5f9",
    background: "#fff",
  },
  serviceIcon: { fontSize: 40, marginBottom: 20 },
  serviceTitle: {
    fontSize: "clamp(16px, 1.5vw, 20px)",
    fontWeight: 700,
    marginBottom: 10,
  },
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
    gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))",
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
  doctorName: {
    fontSize: "clamp(14px, 1.2vw, 16px)",
    fontWeight: 700,
    marginBottom: 5,
  },
  doctorSpec: { color: "#0ea5e9", fontSize: 13, marginBottom: 15 },
  doctorBtn: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "clamp(12px, 1vw, 14px)",
  },

  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(140px, 45%), 1fr))",
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
  paymentIcon: { fontSize: 20, flexShrink: 0 },
  paymentName: { color: "#fff", fontSize: "clamp(12px, 1vw, 14px)" },

  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
    gap: "clamp(24px, 4vw, 50px)",
  },
  contactInfo: { display: "flex", flexDirection: "column", gap: 15 },
  contactForm: { display: "flex", flexDirection: "column", gap: 15 },
  contactInput: {
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
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
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  footer: {
    background: "#0f172a",
    padding: "clamp(24px, 4vw, 40px)",
    textAlign: "center",
  },
  footerInner: {},
  footerCopy: { color: "#64748b", fontSize: 12, marginTop: 10 },
};
