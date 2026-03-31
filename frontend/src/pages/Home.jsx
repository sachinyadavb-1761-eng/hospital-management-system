import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
            <button style={s.loginBtn} onClick={() => navigate("/login")}>
              Login
            </button>
            <button style={s.registerBtn} onClick={() => navigate("/register")}>
              Register Free
            </button>
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
            Your Health,
            <br />
            <span style={s.heroAccent}>Our Priority</span>
          </h1>
          <p style={s.heroDesc}>
            Book appointments, consult top doctors, and manage your health
            journey — all in one place. Fast, reliable, and always available.
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
              ["24/7", "Support"],
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
            <div style={s.heroCardTime}>📅 Today, 3:00 PM</div>
            <div style={s.heroCardStatus}>✅ Confirmed</div>
          </div>
          <div style={s.heroFloatCard}>
            <span style={{ fontSize: 24 }}>💊</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                Prescription Ready
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Download anytime
              </div>
            </div>
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
          <p style={s.sectionDesc}>
            World-class medical care across all major specializations, delivered
            by experienced professionals.
          </p>
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
          <p style={s.sectionDesc}>
            Experienced, compassionate, and always available to help you feel
            better.
          </p>
          <div style={s.doctorGrid}>
            {DOCTORS.map((doc) => (
              <div key={doc.name} style={s.doctorCard}>
                <div style={{ ...s.doctorAvatar, background: doc.color }}>
                  {doc.img}
                </div>
                <h3 style={s.doctorName}>{doc.name}</h3>
                <div style={s.doctorSpec}>{doc.spec}</div>
                <div style={s.doctorExp}>⭐ {doc.exp} Experience</div>
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
          <div
            style={{
              ...s.sectionTag,
              background: "rgba(255,255,255,0.1)",
              color: "#94a3b8",
            }}
          >
            Payments
          </div>
          <h2 style={{ ...s.sectionTitle, color: "#fff" }}>
            All Payment <span style={s.accent}>Methods Accepted</span>
          </h2>
          <p style={{ ...s.sectionDesc, color: "#94a3b8" }}>
            Pay your way — we accept all major payment methods for your
            convenience.
          </p>
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

      {/* ── About ── */}
      <section id="about" style={s.section}>
        <div style={s.aboutInner}>
          <div style={s.aboutLeft}>
            <div style={s.sectionTag}>About Us</div>
            <h2 style={s.sectionTitle}>
              Why Choose <span style={s.accent}>MediCore?</span>
            </h2>
            <p
              style={{
                color: "#475569",
                fontSize: 16,
                lineHeight: 1.8,
                marginBottom: 32,
              }}
            >
              MediCore is India's leading hospital management platform,
              connecting patients with top doctors across specializations. We
              believe healthcare should be accessible, transparent, and
              efficient.
            </p>
            {[
              [
                "🏥",
                "50+ Hospitals",
                "Partnered with top hospitals across India",
              ],
              ["👨‍⚕️", "500+ Doctors", "Verified specialists in every field"],
              ["🔒", "100% Secure", "Your health data is always protected"],
              [
                "⚡",
                "Instant Booking",
                "Book appointments in under 60 seconds",
              ],
            ].map(([icon, title, desc]) => (
              <div key={title} style={s.aboutFeature}>
                <div style={s.aboutFeatureIcon}>{icon}</div>
                <div>
                  <div style={s.aboutFeatureTitle}>{title}</div>
                  <div style={s.aboutFeatureDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={s.aboutRight}>
            <div style={s.aboutCard}>
              <div style={s.aboutCardStat}>50,000+</div>
              <div style={s.aboutCardLabel}>Happy Patients</div>
              <div style={s.aboutCardDivider} />
              <div style={s.aboutCardStat}>500+</div>
              <div style={s.aboutCardLabel}>Expert Doctors</div>
              <div style={s.aboutCardDivider} />
              <div style={s.aboutCardStat}>98%</div>
              <div style={s.aboutCardLabel}>Patient Satisfaction</div>
              <button style={s.aboutCta} onClick={() => navigate("/register")}>
                Join MediCore Today →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ ...s.section, background: "#f8fafc" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionTag}>Get In Touch</div>
          <h2 style={s.sectionTitle}>
            Contact <span style={s.accent}>Us</span>
          </h2>
          <p style={s.sectionDesc}>Have questions? We're here to help 24/7.</p>
          <div style={s.contactGrid}>
            <div style={s.contactInfo}>
              {[
                ["📍", "Address", "123 Medical Hub, New Delhi, India - 110001"],
                ["📞", "Phone", "+91 98765 43210"],
                ["📧", "Email", "support@medicore.in"],
                ["🕐", "Hours", "24/7 — Always Available"],
              ].map(([icon, label, val]) => (
                <div key={label} style={s.contactItem}>
                  <div style={s.contactIcon}>{icon}</div>
                  <div>
                    <div style={s.contactLabel}>{label}</div>
                    <div style={s.contactVal}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleContact} style={s.contactForm}>
              {submitted && (
                <div style={s.successBox}>
                  ✅ Message sent! We'll reply soon.
                </div>
              )}
              <input
                style={s.contactInput}
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
                required
              />
              <input
                style={s.contactInput}
                type="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
                required
              />
              <textarea
                style={{ ...s.contactInput, height: 120, resize: "none" }}
                placeholder="Your Message"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                required
              />
              <button type="submit" style={s.contactBtn}>
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.logo}>
            <div style={s.logoMark}>✚</div>
            <span style={{ ...s.logoText, color: "#fff" }}>MediCore</span>
          </div>
          <p style={s.footerDesc}>
            India's most trusted hospital management platform.
          </p>
          <p style={s.footerCopy}>© 2026 MediCore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'Georgia', serif",
    background: "#fff",
    overflowX: "hidden",
  },
  // Navbar
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
    backdropFilter: "blur(12px)",
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
    fontSize: 18,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  navLinks: { display: "flex", gap: 4 },
  navLink: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#475569",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
  },
  navLinkActive: { color: "#0ea5e9", fontWeight: 700 },
  navActions: { display: "flex", gap: 10 },
  loginBtn: {
    padding: "9px 20px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "transparent",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  registerBtn: {
    padding: "9px 20px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  // Hero
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background: "#0f172a",
    padding: "120px 40px 80px",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at 30% 50%, rgba(14,165,233,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)",
  },
  heroGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
  },
  heroContent: { flex: 1, maxWidth: 600, position: "relative", zIndex: 1 },
  heroTag: {
    display: "inline-block",
    background: "rgba(14,165,233,0.15)",
    color: "#38bdf8",
    padding: "8px 16px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24,
    border: "1px solid rgba(14,165,233,0.2)",
  },
  heroTitle: {
    fontSize: 68,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.05,
    margin: "0 0 24px",
    letterSpacing: "-2px",
  },
  heroAccent: { color: "#0ea5e9" },
  heroDesc: {
    fontSize: 18,
    color: "#94a3b8",
    lineHeight: 1.7,
    marginBottom: 40,
    maxWidth: 480,
  },
  heroBtns: { display: "flex", gap: 14, marginBottom: 56 },
  heroCtaPrimary: {
    padding: "16px 32px",
    borderRadius: 12,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  heroCtaSecondary: {
    padding: "16px 32px",
    borderRadius: 12,
    border: "1.5px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  heroStats: { display: "flex", gap: 40 },
  heroStat: { display: "flex", flexDirection: "column" },
  heroStatVal: { fontSize: 28, fontWeight: 900, color: "#fff" },
  heroStatLabel: { fontSize: 13, color: "#64748b", marginTop: 2 },
  heroVisual: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    position: "relative",
    zIndex: 1,
  },
  heroCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 28,
    width: 280,
  },
  heroCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  heroCardDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10b981",
  },
  heroCardTitle: { color: "#94a3b8", fontSize: 13, fontWeight: 600 },
  heroCardDoctor: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  heroCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 14,
  },
  heroCardName: { color: "#fff", fontWeight: 700, fontSize: 15 },
  heroCardSpec: { color: "#64748b", fontSize: 13 },
  heroCardTime: { color: "#94a3b8", fontSize: 13, marginBottom: 10 },
  heroCardStatus: { color: "#10b981", fontSize: 13, fontWeight: 600 },
  heroFloatCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  },
  // Sections
  section: { padding: "100px 40px" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  sectionTag: {
    display: "inline-block",
    background: "#e0f2fe",
    color: "#0284c7",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  sectionTitle: {
    fontSize: 44,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 16,
    letterSpacing: "-1px",
  },
  sectionDesc: {
    fontSize: 17,
    color: "#64748b",
    marginBottom: 60,
    maxWidth: 560,
  },
  accent: { color: "#0ea5e9" },
  // Services
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  },
  serviceCard: {
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 20,
    padding: 32,
    transition: "all 0.2s",
  },
  serviceIcon: { fontSize: 40, marginBottom: 16 },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 10px",
  },
  serviceDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.7,
    marginBottom: 20,
  },
  serviceBtn: {
    padding: "9px 18px",
    borderRadius: 8,
    border: "none",
    background: "#f0f9ff",
    color: "#0284c7",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  // Doctors
  doctorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 24,
  },
  doctorCard: {
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 20,
    padding: "32px 24px",
    textAlign: "center",
  },
  doctorAvatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 900,
    fontSize: 20,
    margin: "0 auto 16px",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 6px",
  },
  doctorSpec: {
    fontSize: 13,
    color: "#0ea5e9",
    fontWeight: 600,
    marginBottom: 8,
  },
  doctorExp: { fontSize: 12, color: "#94a3b8", marginBottom: 20 },
  doctorBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: 10,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  // Payment
  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    maxWidth: 700,
    margin: "0 auto",
  },
  paymentCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  paymentIcon: { fontSize: 28 },
  paymentName: { color: "#e2e8f0", fontSize: 15, fontWeight: 600 },
  // About
  aboutInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 80,
    alignItems: "center",
  },
  aboutLeft: {},
  aboutFeature: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
  },
  aboutFeatureIcon: {
    width: 44,
    height: 44,
    background: "#f0f9ff",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  aboutFeatureTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 2,
  },
  aboutFeatureDesc: { fontSize: 13, color: "#64748b" },
  aboutRight: {},
  aboutCard: {
    background: "#0f172a",
    borderRadius: 24,
    padding: 48,
    textAlign: "center",
  },
  aboutCardStat: {
    fontSize: 48,
    fontWeight: 900,
    color: "#0ea5e9",
    lineHeight: 1,
  },
  aboutCardLabel: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 24,
  },
  aboutCardDivider: {
    height: 1,
    background: "rgba(255,255,255,0.08)",
    marginBottom: 24,
  },
  aboutCta: {
    width: "100%",
    padding: "16px",
    borderRadius: 12,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 16,
  },
  // Contact
  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 },
  contactInfo: { display: "flex", flexDirection: "column", gap: 28 },
  contactItem: { display: "flex", alignItems: "flex-start", gap: 16 },
  contactIcon: {
    width: 44,
    height: 44,
    background: "#e0f2fe",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: 2,
  },
  contactVal: { fontSize: 15, color: "#0f172a", fontWeight: 500 },
  contactForm: { display: "flex", flexDirection: "column", gap: 16 },
  contactInput: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    fontSize: 15,
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    fontFamily: "inherit",
  },
  contactBtn: {
    padding: "16px",
    borderRadius: 12,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  successBox: {
    background: "#d1fae5",
    color: "#065f46",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
  },
  // Footer
  footer: { background: "#0f172a", padding: "48px 40px" },
  footerInner: { maxWidth: 1200, margin: "0 auto", textAlign: "center" },
  footerDesc: { color: "#64748b", fontSize: 14, margin: "12px 0 8px" },
  footerCopy: { color: "#334155", fontSize: 13 },
};
