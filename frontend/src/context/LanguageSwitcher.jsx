// src/context/LanguageContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Ek baar language switch karo → poori app mein apply ho jaye
// localStorage mein save hota hai → page refresh pe bhi yaad rahe
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState } from "react";

// ── Translations ──────────────────────────────────────────────────────────────
export const translations = {
  en: {
    // Navbar
    home: "Home",
    services: "Services",
    doctors: "Doctors",
    about: "About",
    contact: "Contact",
    login: "Login",
    registerFree: "Register Free",
    myDashboard: "My Dashboard →",
    logout: "Logout",

    // Hero
    tagline: "India's #1 Hospital Management Platform",
    heroTitle1: "Your Health,",
    heroTitle2: "Our Priority",
    heroDesc:
      "Book appointments, consult top doctors, and manage your health journey — all in one place.",
    bookAppointment: "Book Appointment →",
    exploreServices: "Explore Services",
    statDoctors: "Doctors",
    statPatients: "Patients",
    statSatisfaction: "Satisfaction",

    // Sections
    whatWeOffer: "What We Offer",
    ourSpecializations: "Our Specializations",
    bookNow: "Book Now →",
    meetTheTeam: "Meet The Team",
    ourTopDoctors: "Our Top Doctors",
    allPaymentMethods: "All Payment Methods",
    contactUs: "Contact Us",
    address: "📍 123 Medical Hub, New Delhi, India",
    phone: "📞 +91 98765 43210",
    yourName: "Your Name",
    yourEmail: "Your Email",
    message: "Message",
    sendMessage: "Send Message",
    messageSent: "✅ Message sent!",
    nextAppointment: "Next Appointment",
    confirmed: "✅ Confirmed",

    // Login pages
    signIn: "Sign In",
    signingIn: "Signing in…",
    patientLogin: "Patient Login",
    accessYourAccount: "Access your account and manage your health.",
    email: "Email",
    password: "Password",
    dontHaveAccount: "Don't have an account?",
    register: "Register",
    loginFailed: "Login failed. Please try again.",

    // Doctor Login
    doctorPortal: "Doctor Portal",
    doctorAccess: "🩺 Doctor Access",
    doctorSignIn: "Doctor Sign In",
    doctorRegistration: "Doctor Registration",
    enterDoctorCredentials: "Enter your doctor credentials",
    fillDetailsToRegister: "Fill in details to register",
    fullName: "Full Name",
    phone2: "Phone",
    experienceYears: "Experience (years)",
    department: "Department",
    selectDepartment: "— Select Department —",
    specialization: "Specialization",
    consultationFee: "Consultation Fee (₹)",
    accessDoctorDashboard: "Access Doctor Dashboard →",
    pleaseWait: "Please wait…",
    registerArrow: "Register →",
    registrationSuccess: "Registration successful! Please login.",

    // Admin Login
    adminControl: "Admin Control Panel",
    adminAccess: "🔐 Admin Access",
    adminSignIn: "Admin Sign In",
    restrictedToAdmins: "Restricted to administrators only",
    adminEmail: "Admin Email",
    verifying: "Verifying…",
    accessAdminPanel: "Access Admin Panel →",

    // Register
    joinMedicore: "Join MediCore Today",
    createPatientAccount: "Create Patient Account",
    alreadyHaveAccount: "Already have an account?",
    registering: "Registering…",
    registrationFailed: "Registration failed. Try again.",

    // Password
    showPassword: "Show password",
    hidePassword: "Hide password",

    // Language
    language: "Language",
  },

  hi: {
    // Navbar
    home: "होम",
    services: "सेवाएं",
    doctors: "डॉक्टर",
    about: "हमारे बारे में",
    contact: "संपर्क",
    login: "लॉगिन",
    registerFree: "मुफ्त रजिस्टर करें",
    myDashboard: "मेरा डैशबोर्ड →",
    logout: "लॉगआउट",

    // Hero
    tagline: "भारत का #1 अस्पताल प्रबंधन प्लेटफॉर्म",
    heroTitle1: "आपका स्वास्थ्य,",
    heroTitle2: "हमारी प्राथमिकता",
    heroDesc: "अपॉइंटमेंट बुक करें, शीर्ष डॉक्टरों से परामर्श लें — सब एक जगह।",
    bookAppointment: "अपॉइंटमेंट बुक करें →",
    exploreServices: "सेवाएं देखें",
    statDoctors: "डॉक्टर",
    statPatients: "मरीज़",
    statSatisfaction: "संतुष्टि",

    // Sections
    whatWeOffer: "हम क्या प्रदान करते हैं",
    ourSpecializations: "हमारी विशेषज्ञताएं",
    bookNow: "अभी बुक करें →",
    meetTheTeam: "हमारी टीम से मिलें",
    ourTopDoctors: "हमारे शीर्ष डॉक्टर",
    allPaymentMethods: "सभी भुगतान विधियां",
    contactUs: "हमसे संपर्क करें",
    address: "📍 123 मेडिकल हब, नई दिल्ली, भारत",
    phone: "📞 +91 98765 43210",
    yourName: "आपका नाम",
    yourEmail: "आपका ईमेल",
    message: "संदेश",
    sendMessage: "संदेश भेजें",
    messageSent: "✅ संदेश भेज दिया गया!",
    nextAppointment: "अगला अपॉइंटमेंट",
    confirmed: "✅ पुष्टि हुई",

    // Login pages
    signIn: "साइन इन",
    signingIn: "साइन इन हो रहा है…",
    patientLogin: "मरीज़ लॉगिन",
    accessYourAccount: "अपना खाता एक्सेस करें और स्वास्थ्य प्रबंधित करें।",
    email: "ईमेल",
    password: "पासवर्ड",
    dontHaveAccount: "खाता नहीं है?",
    register: "रजिस्टर करें",
    loginFailed: "लॉगिन विफल। कृपया पुनः प्रयास करें।",

    // Doctor Login
    doctorPortal: "डॉक्टर पोर्टल",
    doctorAccess: "🩺 डॉक्टर एक्सेस",
    doctorSignIn: "डॉक्टर साइन इन",
    doctorRegistration: "डॉक्टर पंजीकरण",
    enterDoctorCredentials: "अपनी डॉक्टर लॉगिन जानकारी दर्ज करें",
    fillDetailsToRegister: "पंजीकरण के लिए विवरण भरें",
    fullName: "पूरा नाम",
    phone2: "फोन",
    experienceYears: "अनुभव (वर्ष)",
    department: "विभाग",
    selectDepartment: "— विभाग चुनें —",
    specialization: "विशेषज्ञता",
    consultationFee: "परामर्श शुल्क (₹)",
    accessDoctorDashboard: "डॉक्टर डैशबोर्ड एक्सेस करें →",
    pleaseWait: "कृपया प्रतीक्षा करें…",
    registerArrow: "रजिस्टर करें →",
    registrationSuccess: "पंजीकरण सफल! कृपया लॉगिन करें।",

    // Admin Login
    adminControl: "एडमिन कंट्रोल पैनल",
    adminAccess: "🔐 एडमिन एक्सेस",
    adminSignIn: "एडमिन साइन इन",
    restrictedToAdmins: "केवल प्रशासकों के लिए",
    adminEmail: "एडमिन ईमेल",
    verifying: "सत्यापन हो रहा है…",
    accessAdminPanel: "एडमिन पैनल एक्सेस करें →",

    // Register
    joinMedicore: "आज MediCore से जुड़ें",
    createPatientAccount: "मरीज़ खाता बनाएं",
    alreadyHaveAccount: "पहले से खाता है?",
    registering: "रजिस्टर हो रहा है…",
    registrationFailed: "पंजीकरण विफल। पुनः प्रयास करें।",

    // Password
    showPassword: "पासवर्ड दिखाएं",
    hidePassword: "पासवर्ड छुपाएं",

    // Language
    language: "भाषा",
  },
};

// ── Context ───────────────────────────────────────────────────────────────────
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // localStorage se pehli baar language lo, warna English
  const [lang, setLang] = useState(
    () => localStorage.getItem("medicore_lang") || "en",
  );

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("medicore_lang", newLang);
  };

  const t = (key) =>
    translations[lang]?.[key] || translations["en"][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

// ── Language Switcher Component (navbar mein use karo) ───────────────────────
export function LanguageSwitcher({ style = {} }) {
  const { lang, switchLanguage } = useLanguage();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, ...style }}>
      <button
        onClick={() => switchLanguage("en")}
        title="English"
        style={{
          padding: "5px 10px",
          borderRadius: 8,
          border: lang === "en" ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0",
          background: lang === "en" ? "#e0f2fe" : "transparent",
          color: lang === "en" ? "#0369a1" : "#64748b",
          fontWeight: lang === "en" ? 700 : 500,
          fontSize: 13,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage("hi")}
        title="हिंदी"
        style={{
          padding: "5px 10px",
          borderRadius: 8,
          border: lang === "hi" ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0",
          background: lang === "hi" ? "#e0f2fe" : "transparent",
          color: lang === "hi" ? "#0369a1" : "#64748b",
          fontWeight: lang === "hi" ? 700 : 500,
          fontSize: 13,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        हि
      </button>
    </div>
  );
}
