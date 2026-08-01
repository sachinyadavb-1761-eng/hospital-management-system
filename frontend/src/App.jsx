import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageSwitcher";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DoctorLogin from "./pages/DoctorLogin";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/Patientdashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* ══════════════════════════════════════════
              PUBLIC
          ══════════════════════════════════════════ */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ══════════════════════════════════════════
              DOCTOR & ADMIN — separate URLs
          ══════════════════════════════════════════ */}
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/staff/login"
            element={<Navigate to="/doctor-login" replace />}
          />
          <Route
            path="/staff-login"
            element={<Navigate to="/doctor-login" replace />}
          />

          {/* ══════════════════════════════════════════
              PATIENT only
          ══════════════════════════════════════════ */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute roles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute roles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={<Navigate to="/patient/dashboard" replace />}
          />
          <Route
            path="/my-appointments"
            element={<Navigate to="/patient/dashboard" replace />}
          />
          <Route
            path="/profile"
            element={<Navigate to="/patient/dashboard" replace />}
          />

          {/* ══════════════════════════════════════════
              DOCTOR only
          ══════════════════════════════════════════ */}
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={<Navigate to="/doctor-dashboard" replace />}
          />
          <Route
            path="/doctor-appointments"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-patients"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* ══════════════════════════════════════════
              ADMIN only
          ══════════════════════════════════════════ */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["superadmin", "departmentadmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute roles={["superadmin", "departmentadmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute roles={["superadmin", "departmentadmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute roles={["superadmin", "departmentadmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute roles={["superadmin", "departmentadmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ChatWidget />
      </BrowserRouter>
    </LanguageProvider>
  );
}
