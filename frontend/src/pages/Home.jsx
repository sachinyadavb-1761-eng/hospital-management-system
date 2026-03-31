import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DOCTORS = [
  {
    name: "Dr. Aryan Mehta",
    spec: "Cardiologist",
    exp: "12 yrs",
    img: "AM",
    color: "#0ea5e9",
    fee: 800,
  },
  {
    name: "Dr. Priya Sharma",
    spec: "Neurologist",
    exp: "9 yrs",
    img: "PS",
    color: "#8b5cf6",
    fee: 1000,
  },
  {
    name: "Dr. Rohan Verma",
    spec: "Orthopedic",
    exp: "15 yrs",
    img: "RV",
    color: "#10b981",
    fee: 700,
  },
  {
    name: "Dr. Sneha Gupta",
    spec: "Pediatrician",
    exp: "7 yrs",
    img: "SG",
    color: "#f59e0b",
    fee: 600,
  },
];

const SERVICES = [
  {
    icon: "🫀",
    title: "Cardiology",
    desc: "Advanced heart care with cutting-edge diagnostics.",
  },
  {
    icon: "🧠",
    title: "Neurology",
    desc: "Expert brain & nervous system care.",
  },
  {
    icon: "🦴",
    title: "Orthopedics",
    desc: "Bone, joint and spine treatments.",
  },
  {
    icon: "👶",
    title: "Pediatrics",
    desc: "Compassionate healthcare for children.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Check if User is logged in
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBooking = (doctor) => {
    if (!user) {
      alert("Please login as a patient to book an appointment.");
      navigate("/login");
    } else {
      // Yaha hum payment gatewey par bhejenge (Next Step)
      console.log(`Processing payment of ₹${doctor.fee} for ${doctor.name}`);
      alert(`Redirecting to Payment Gateway for ${doctor.name}...`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={s.root}>
      {/* ── Navbar ── */}
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <div style={s.logo} onClick={() => navigate("/")}>
            <div style={s.logoMark}>✚</div>
            <span style={s.logoText}>MediCore</span>
          </div>

          <div style={s.navLinks}>
            <button style={s.navLink} onClick={() => scrollTo("home")}>
              Home
            </button>
            <button style={s.navLink} onClick={() => scrollTo("services")}>
              Services
            </button>
            <button style={s.navLink} onClick={() => scrollTo("doctors")}>
              Doctors
            </button>
          </div>

          <div style={s.navActions}>
            {/* Subtle Staff Link */}
            <button
              style={s.staffLink}
              onClick={() => navigate("/staff/login")}
            >
              Staff Portal
            </button>

            {user ? (
              <div style={s.userProfile}>
                <span style={s.userName}>Hi, {user.name.split(" ")[0]}</span>
                <button style={s.logoutBtn} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button style={s.loginBtn} onClick={() => navigate("/login")}>
                  Login
                </button>
                <button
                  style={s.registerBtn}
                  onClick={() => navigate("/register")}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="home" style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.heroTag}>👋 Welcome to MediCore</div>
          <h1 style={s.heroTitle}>
            Book Your <span style={s.heroAccent}>Doctor</span> <br />
            Appointment Online
          </h1>
          <p style={s.heroDesc}>
            Skip the queue. Select your specialist, pay securely, and get your
            confirmed slot instantly.
          </p>
          <div style={s.heroBtns}>
            <button
              style={s.heroCtaPrimary}
              onClick={() => scrollTo("doctors")}
            >
              Book Now →
            </button>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>Our Specializations</h2>
          <div style={s.serviceGrid}>
            {SERVICES.map((sv) => (
              <div key={sv.title} style={s.serviceCard}>
                <div style={s.serviceIcon}>{sv.icon}</div>
                <h3 style={s.serviceTitle}>{sv.title}</h3>
                <p style={s.serviceDesc}>{sv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors (Booking Logic Here) ── */}
      <section id="doctors" style={{ ...s.section, background: "#f8fafc" }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>Available Specialists</h2>
          <div style={s.doctorGrid}>
            {DOCTORS.map((doc) => (
              <div key={doc.name} style={s.doctorCard}>
                <div style={{ ...s.doctorAvatar, background: doc.color }}>
                  {doc.img}
                </div>
                <h3 style={s.doctorName}>{doc.name}</h3>
                <div style={s.doctorSpec}>
                  {doc.spec} • {doc.exp}
                </div>
                <div style={s.doctorFee}>
                  Consultation: <b>₹{doc.fee}</b>
                </div>
                <button style={s.doctorBtn} onClick={() => handleBooking(doc)}>
                  Confirm & Pay
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={s.footer}>
        <p>© 2026 MediCore Patient Portal. Designed for Excellence.</p>
      </footer>
    </div>
  );
}

const s = {
  root: { fontFamily: "'Inter', sans-serif", background: "#fff" },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "20px 0",
    transition: "0.3s",
  },
  navScrolled: {
    background: "#fff",
    boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
    padding: "12px 0",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logoMark: {
    width: 32,
    height: 32,
    background: "#0ea5e9",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 900,
  },
  logoText: { fontSize: 18, fontWeight: 800, color: "#0f172a" },
  navLinks: { display: "flex", gap: 20 },
  navLink: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#64748b",
    fontWeight: 500,
  },
  navActions: { display: "flex", gap: 15, alignItems: "center" },
  staffLink: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: 12,
    cursor: "pointer",
    textDecoration: "underline",
  },
  loginBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  registerBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  userProfile: { display: "flex", alignItems: "center", gap: 10 },
  userName: { fontWeight: 700, color: "#0ea5e9" },
  logoutBtn: {
    padding: "5px 10px",
    fontSize: 12,
    borderRadius: 5,
    border: "1px solid #ef4444",
    color: "#ef4444",
    background: "none",
    cursor: "pointer",
  },
  hero: {
    padding: "160px 20px 100px",
    textAlign: "center",
    background: "linear-gradient(to bottom, #f0f9ff, #fff)",
  },
  heroContent: { maxWidth: 800, margin: "0 auto" },
  heroTag: {
    color: "#0ea5e9",
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.2,
  },
  heroAccent: { color: "#0ea5e9" },
  heroDesc: { fontSize: 18, color: "#64748b", margin: "20px 0 30px" },
  heroCtaPrimary: {
    padding: "14px 30px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
  },
  section: { padding: "80px 20px" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 800,
    textAlign: "center",
    marginBottom: 50,
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 25,
  },
  serviceCard: {
    padding: "30px",
    borderRadius: 15,
    border: "1px solid #f1f5f9",
    textAlign: "center",
  },
  serviceIcon: { fontSize: 40, marginBottom: 15 },
  serviceTitle: { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  serviceDesc: { color: "#64748b", fontSize: 14 },
  doctorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 25,
  },
  doctorCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: 20,
    textAlign: "center",
    border: "1px solid #e2e8f0",
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
    fontSize: 20,
  },
  doctorName: { fontSize: 18, fontWeight: 700, marginBottom: 5 },
  doctorSpec: { color: "#0ea5e9", fontSize: 14, marginBottom: 10 },
  doctorFee: { marginBottom: 20, fontSize: 15, color: "#475569" },
  doctorBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  footer: {
    padding: "40px",
    textAlign: "center",
    background: "#0f172a",
    color: "#94a3b8",
    fontSize: 13,
  },
};
