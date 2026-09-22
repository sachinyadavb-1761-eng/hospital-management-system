// src/pages/Home.jsx
// Redesign notes:
// 1. Same logic, hooks, routes, translations (t()) — only presentation layer changed
// 2. Visual language: deep-navy glass surfaces + layered "embossed" 3D shadows
//    instead of flat SaaS cards. One bold moment: the hero appointment card,
//    which tilts in 3D based on cursor position (perspective + rotateX/rotateY).
// 3. Palette moved from single blue to teal (clinical/calm) + a sparing coral
//    accent used only for live/status indicators, so it reads intentional.
// 4. Space Grotesk for headings (distinct from Inter body) for real typographic
//    identity instead of one default family doing every job.
// 5. Removed tracked-out ALL-CAPS eyebrow labels; replaced with a small dot+label.

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getUser, logout, getDashboardPath } from "../utils/auth";
import { useLanguage, LanguageSwitcher } from "../context/LanguageSwitcher";

const DOCTORS = [
  {
    name: "Dr. Aryan Mehta",
    spec: "Cardiologist",
    exp: "12 yrs",
    img: "AM",
    color: "#2DD4BF",
  },
  {
    name: "Dr. Priya Sharma",
    spec: "Neurologist",
    exp: "9 yrs",
    img: "PS",
    color: "#A78BFA",
  },
  {
    name: "Dr. Rohan Verma",
    spec: "Orthopedic",
    exp: "15 yrs",
    img: "RV",
    color: "#34D399",
  },
  {
    name: "Dr. Sneha Gupta",
    spec: "Pediatrician",
    exp: "7 yrs",
    img: "SG",
    color: "#FBBF24",
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

  // 3D tilt for the hero card — the one deliberately "showy" element on the page
  const heroCardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

  const handleHeroMove = (e) => {
    const card = heroCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 14 });
  };
  const resetHeroTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div style={s.root}>
      {/* ── Navbar (glass) ── */}
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoMark}>✚</div>
            <span style={s.logoText}>MediCore</span>
          </div>

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

          <div style={s.navActions} className="nav-actions-desktop">
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

          <button
            style={s.hamburger}
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

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
        <div style={s.heroOrbTeal} />
        <div style={s.heroOrbCoral} />
        <div style={s.heroGrid} />

        <div style={s.heroContent}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowDot} />
            {t("tagline")}
          </div>
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
          <div
            ref={heroCardRef}
            onMouseMove={handleHeroMove}
            onMouseLeave={resetHeroTilt}
            style={{
              ...s.heroCard,
              transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
            }}
          >
            <div style={s.heroCardShine} />
            <div style={s.heroCardHeader}>
              <span style={s.heroCardLiveDot} />
              <span style={s.heroCardTitle}>{t("nextAppointment")}</span>
            </div>
            <div style={s.heroCardDoctor}>
              <div style={{ ...s.heroCardAvatar, background: "#2DD4BF" }}>
                AM
              </div>
              <div>
                <div style={s.heroCardName}>Dr. Aryan Mehta</div>
                <div style={s.heroCardSpec}>Cardiologist</div>
              </div>
            </div>
            <div style={s.heroCardStatus}>{t("confirmed")}</div>
          </div>
          <div style={s.heroCardFloor} />
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" style={{ ...s.section, background: s.tone.a }}>
        <div style={s.sectionInner}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowDot} />
            {t("whatWeOffer")}
          </div>
          <h2 style={s.sectionTitle}>
            {t("ourSpecializations").split(" ").slice(0, -1).join(" ")}{" "}
            <span style={s.accent}>
              {t("ourSpecializations").split(" ").slice(-1)}
            </span>
          </h2>
          <div style={s.serviceGrid}>
            {SERVICES_DATA.map((sv) => (
              <div
                key={sv.titleKey}
                style={s.serviceCard}
                className="lift-card"
              >
                <div style={s.serviceIconBadge}>
                  <span style={s.serviceIconGlyph}>{sv.icon}</span>
                </div>
                <h3 style={s.serviceTitle}>{sv.titleKey}</h3>
                <p style={s.serviceDesc}>{sv.descKey}</p>
                <button
                  style={s.serviceBtn}
                  onClick={() => navigate("/register")}
                >
                  {t("bookNow")} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ── */}
      <section id="doctors" style={{ ...s.section, background: s.tone.b }}>
        <div style={s.sectionInner}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowDot} />
            {t("meetTheTeam")}
          </div>
          <h2 style={s.sectionTitle}>
            {t("ourTopDoctors").split(" ").slice(0, -2).join(" ")}{" "}
            <span style={s.accent}>
              {t("ourTopDoctors").split(" ").slice(-2).join(" ")}
            </span>
          </h2>
          <div style={s.doctorGrid}>
            {DOCTORS.map((doc) => (
              <div key={doc.name} style={s.doctorCard} className="lift-card">
                <div style={s.doctorAvatarRing}>
                  <div style={{ ...s.doctorAvatar, background: doc.color }}>
                    {doc.img}
                  </div>
                </div>
                <h3 style={s.doctorName}>{doc.name}</h3>
                <div style={s.doctorSpec}>
                  {doc.spec} · {doc.exp}
                </div>
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
      <section style={{ ...s.section, background: s.tone.a }}>
        <div style={s.sectionInner}>
          <h2 style={{ ...s.sectionTitle, textAlign: "center" }}>
            {t("allPaymentMethods")}
          </h2>
          <div style={s.paymentGrid}>
            {PAYMENT_METHODS.map((pm) => (
              <div key={pm.name} style={s.paymentCard}>
                <span style={s.paymentIconBadge}>{pm.icon}</span>
                <span style={s.paymentName}>{pm.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ ...s.section, background: s.tone.b }}>
        <div style={s.sectionInner}>
          <div style={s.contactGrid}>
            <div style={s.contactInfo}>
              <h2 style={s.sectionTitle}>
                {t("contactUs").split(" ")[0]}{" "}
                <span style={s.accent}>
                  {t("contactUs").split(" ").slice(1).join(" ")}
                </span>
              </h2>
              <p style={s.contactInfoText}>{t("address")}</p>
              <p style={s.contactInfoText}>{t("phone")}</p>
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
                style={{ ...s.contactInput, height: 100, resize: "vertical" }}
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
          <span style={s.footerLogo}>MediCore</span>
          <p style={s.footerCopy}>© 2026 MediCore. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-actions-desktop { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 641px) {
          .hamburger { display: none !important; }
        }

        .lift-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .lift-card:hover {
          transform: translateY(-6px);
          border-color: rgba(45,212,191,0.35) !important;
          box-shadow:
            0 24px 48px -20px rgba(0,0,0,0.65),
            0 0 0 1px rgba(45,212,191,0.08) inset !important;
        }

        @keyframes driftTeal {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -24px); }
        }
        @keyframes driftCoral {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-16px, 18px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .lift-card, .lift-card:hover { transition: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

const tone = {
  bg: "#0A0E17", // base
  a: "#0A0E17", // section tone A
  b: "#0D1420", // section tone B (slightly lifted)
  glass: "rgba(255,255,255,0.045)",
  glassBorder: "rgba(255,255,255,0.08)",
  text: "#EEF2F7",
  muted: "#8CA0B8",
  teal: "#2DD4BF",
  tealDeep: "#0F766E",
  coral: "#FF7A7A",
};

const shadowLift =
  "0 20px 44px -22px rgba(2,6,15,0.75), 0 2px 0 rgba(255,255,255,0.03) inset";

const s = {
  tone,
  root: {
    fontFamily: "'Inter', sans-serif",
    background: tone.bg,
    overflowX: "hidden",
    color: tone.text,
  },

  // ── Navbar ──
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "18px 0",
    transition: "all 0.3s",
  },
  navScrolled: {
    background: "rgba(10,14,23,0.75)",
    backdropFilter: "blur(16px) saturate(140%)",
    WebkitBackdropFilter: "blur(16px) saturate(140%)",
    boxShadow:
      "0 1px 0 rgba(255,255,255,0.06), 0 20px 40px -24px rgba(0,0,0,0.8)",
    padding: "12px 0",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 clamp(16px, 4vw, 40px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logo: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#04201c",
    fontWeight: 900,
    boxShadow:
      "0 8px 16px -6px rgba(45,212,191,0.5), 0 1px 0 rgba(255,255,255,0.4) inset",
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(16px, 2vw, 20px)",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  navLinks: { display: "flex", gap: 4 },
  navLink: {
    padding: "8px 14px",
    border: "none",
    background: "transparent",
    color: tone.muted,
    fontSize: "clamp(13px, 1.2vw, 15px)",
    cursor: "pointer",
    borderRadius: 8,
  },
  navLinkActive: {
    color: tone.teal,
    fontWeight: 600,
    background: "rgba(45,212,191,0.08)",
  },
  navActions: { display: "flex", gap: 8, alignItems: "center" },
  loginBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1.5px solid rgba(255,255,255,0.14)",
    background: "transparent",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  registerBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
    whiteSpace: "nowrap",
    boxShadow: "0 6px 14px -4px rgba(45,212,191,0.5)",
  },
  navUserName: { fontSize: 13, fontWeight: 600, color: "#fff" },
  navRoleBadge: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "capitalize",
    background: "rgba(45,212,191,0.14)",
    color: tone.teal,
    padding: "3px 10px",
    borderRadius: 20,
  },
  dashboardBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    background: tone.teal,
    color: "#04201c",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  navLogoutBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1.5px solid rgba(255,122,122,0.35)",
    background: "transparent",
    color: tone.coral,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  },

  hamburger: {
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    border: "1.5px solid rgba(255,255,255,0.16)",
    borderRadius: 10,
    background: "transparent",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    flexShrink: 0,
  },

  mobileMenu: {
    background: "rgba(10,14,23,0.97)",
    backdropFilter: "blur(14px)",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  mobileNavLink: {
    padding: "12px 16px",
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: 500,
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
  },
  mobileDivider: {
    height: 1,
    background: "rgba(255,255,255,0.08)",
    margin: "8px 0",
  },
  mobileLoginBtn: {
    padding: "12px",
    border: "1.5px solid rgba(255,255,255,0.16)",
    background: "transparent",
    color: "#fff",
    fontWeight: 600,
    borderRadius: 10,
    cursor: "pointer",
  },
  mobileRegisterBtn: {
    padding: "12px",
    border: "none",
    background: tone.teal,
    color: "#04201c",
    fontWeight: 700,
    borderRadius: 10,
    cursor: "pointer",
  },
  mobileDashBtn: {
    padding: "12px",
    border: "none",
    background: tone.teal,
    color: "#04201c",
    fontWeight: 700,
    borderRadius: 10,
    cursor: "pointer",
  },
  mobileLogoutBtn: {
    padding: "12px",
    border: "1.5px solid rgba(255,122,122,0.35)",
    background: "transparent",
    color: tone.coral,
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
    background: tone.bg,
    padding:
      "clamp(100px, 12vw, 140px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 80px)",
    gap: 40,
  },
  heroOrbTeal: {
    position: "absolute",
    top: "8%",
    left: "2%",
    width: 420,
    height: 420,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(45,212,191,0.16), transparent 70%)",
    filter: "blur(10px)",
    animation: "driftTeal 14s ease-in-out infinite",
  },
  heroOrbCoral: {
    position: "absolute",
    bottom: "4%",
    right: "6%",
    width: 320,
    height: 320,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,122,122,0.10), transparent 70%)",
    filter: "blur(10px)",
    animation: "driftCoral 17s ease-in-out infinite",
  },
  heroGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    maskImage: "linear-gradient(to bottom, black, transparent 85%)",
  },
  heroContent: {
    flex: "1 1 300px",
    position: "relative",
    zIndex: 1,
    minWidth: 0,
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: tone.muted,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 18,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: tone.teal,
    boxShadow: `0 0 0 4px rgba(45,212,191,0.15)`,
  },

  heroTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(34px, 6vw, 62px)",
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.08,
    marginBottom: 20,
    letterSpacing: "-0.02em",
  },
  heroAccent: { color: tone.teal },
  heroDesc: {
    fontSize: "clamp(14px, 1.5vw, 18px)",
    color: tone.muted,
    marginBottom: 30,
    maxWidth: 500,
    lineHeight: 1.6,
  },
  heroBtns: { display: "flex", gap: 15, marginBottom: 40, flexWrap: "wrap" },
  heroCtaPrimary: {
    padding: "13px 26px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "clamp(13px, 1.2vw, 15px)",
    boxShadow:
      "0 14px 28px -10px rgba(45,212,191,0.45), 0 1px 0 rgba(255,255,255,0.4) inset",
  },
  heroCtaSecondary: {
    padding: "13px 26px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.03)",
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
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(19px, 2.5vw, 26px)",
    fontWeight: 700,
    color: "#fff",
    display: "block",
  },
  heroStatLabel: { fontSize: 12, color: tone.muted },

  heroVisual: {
    flex: "0 1 320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
    perspective: "900px",
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 22,
    width: "min(260px, 82vw)",
    transition: "transform 0.15s ease-out",
    boxShadow:
      "0 30px 60px -24px rgba(2,6,15,0.85), 0 1px 0 rgba(255,255,255,0.1) inset",
  },
  heroCardShine: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 140,
    height: 140,
    background:
      "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
    pointerEvents: "none",
  },
  heroCardFloor: {
    width: "60%",
    height: 22,
    marginTop: 18,
    borderRadius: "50%",
    background:
      "radial-gradient(ellipse, rgba(45,212,191,0.18), transparent 70%)",
    filter: "blur(4px)",
  },
  heroCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    position: "relative",
  },
  heroCardLiveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: tone.teal,
    boxShadow: `0 0 0 4px rgba(45,212,191,0.18)`,
  },
  heroCardTitle: { color: tone.muted, fontSize: 12, fontWeight: 500 },
  heroCardDoctor: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    position: "relative",
  },
  heroCardAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#04201c",
    fontWeight: 800,
    flexShrink: 0,
    boxShadow: "0 6px 14px -4px rgba(45,212,191,0.5)",
  },
  heroCardName: { color: "#fff", fontSize: 14, fontWeight: 600 },
  heroCardSpec: { color: tone.muted, fontSize: 12 },
  heroCardStatus: {
    color: tone.teal,
    fontSize: 12,
    fontWeight: 600,
    position: "relative",
  },

  // ── Sections ──
  section: { padding: "clamp(50px, 8vw, 80px) clamp(16px, 4vw, 40px)" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(25px, 3.5vw, 38px)",
    fontWeight: 700,
    color: "#fff",
    marginBottom: 40,
    letterSpacing: "-0.01em",
  },
  accent: { color: tone.teal },

  // ── Services ──
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
    gap: 20,
  },
  serviceCard: {
    padding: "clamp(24px, 3vw, 30px)",
    borderRadius: 20,
    border: `1px solid ${tone.glassBorder}`,
    background: tone.glass,
    boxShadow: shadowLift,
  },
  serviceIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(150deg, rgba(45,212,191,0.22), rgba(45,212,191,0.04))",
    border: "1px solid rgba(45,212,191,0.25)",
    boxShadow:
      "0 10px 22px -10px rgba(45,212,191,0.35), 0 1px 0 rgba(255,255,255,0.12) inset",
  },
  serviceIconGlyph: { fontSize: 26 },
  serviceTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(16px, 1.5vw, 20px)",
    fontWeight: 600,
    marginBottom: 10,
    color: "#fff",
  },
  serviceDesc: {
    color: tone.muted,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 1.6,
  },
  serviceBtn: {
    background: "transparent",
    border: "none",
    color: tone.teal,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
  },

  // ── Doctors ──
  doctorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(190px, 100%), 1fr))",
    gap: 20,
  },
  doctorCard: {
    background: tone.glass,
    padding: 24,
    borderRadius: 20,
    textAlign: "center",
    border: `1px solid ${tone.glassBorder}`,
    boxShadow: shadowLift,
  },
  doctorAvatarRing: {
    width: 76,
    height: 76,
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#04201c",
    fontWeight: 800,
    boxShadow:
      "0 10px 20px -8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.3) inset",
  },
  doctorName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(14px, 1.2vw, 16px)",
    fontWeight: 600,
    marginBottom: 5,
    color: "#fff",
  },
  doctorSpec: { color: tone.muted, fontSize: 13, marginBottom: 18 },
  doctorBtn: {
    width: "100%",
    padding: 11,
    borderRadius: 10,
    border: "none",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "clamp(12px, 1vw, 14px)",
    boxShadow: "0 8px 16px -6px rgba(45,212,191,0.4)",
  },

  // ── Payment ──
  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 45%), 1fr))",
    gap: 14,
  },
  paymentCard: {
    background: tone.glass,
    padding: "14px 16px",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: `1px solid ${tone.glassBorder}`,
  },
  paymentIconBadge: {
    fontSize: 18,
    width: 34,
    height: 34,
    borderRadius: 10,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  paymentName: { color: "#fff", fontSize: "clamp(12px, 1vw, 14px)" },

  // ── Contact ──
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
    gap: "clamp(24px, 4vw, 50px)",
  },
  contactInfo: { display: "flex", flexDirection: "column", gap: 12 },
  contactInfoText: { color: tone.muted, lineHeight: 1.6 },
  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    background: tone.glass,
    padding: 24,
    borderRadius: 20,
    border: `1px solid ${tone.glassBorder}`,
    boxShadow: shadowLift,
  },
  contactInput: {
    padding: "13px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    outline: "none",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(0,0,0,0.22)",
    color: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3) inset",
  },
  contactBtn: {
    padding: "13px",
    borderRadius: 10,
    border: "none",
    background: `linear-gradient(145deg, ${tone.teal}, ${tone.tealDeep})`,
    color: "#04201c",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 20px -8px rgba(45,212,191,0.45)",
  },
  successBox: {
    background: "rgba(52,211,153,0.14)",
    border: "1px solid rgba(52,211,153,0.3)",
    color: "#6ee7b7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    fontSize: 13,
  },

  // ── Footer ──
  footer: {
    background: "#070A11",
    padding: "clamp(24px, 4vw, 40px)",
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  footerInner: {},
  footerLogo: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#fff",
    fontWeight: 700,
  },
  footerCopy: { color: "#5B6B80", fontSize: 12, marginTop: 10 },
};
