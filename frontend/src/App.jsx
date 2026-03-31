import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login"; // Patient Login
import Register from "./pages/Register"; // Patient Register
import StaffLogin from "./pages/StaffLogin"; // Doctor + Admin Login
import Dashboard from "./pages/Dashboard"; // Admin
import DoctorDashboard from "./pages/DoctorDashboard"; // Doctor

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Patient Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Staff Routes (Hidden) */}
        <Route path="/staff/login" element={<StaffLogin />} />

        {/* ✅ Admin */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute role="admin">
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ Doctor */}
        <Route
          path="/doctor/dashboard"
          element={
            <PrivateRoute role="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
