import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Home from "./pages/Home";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function RoleRoute() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role === "admin" ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/doctor-dashboard" />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public Landing Page */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Doctor Dashboard */}
        <Route
          path="/doctor-dashboard"
          element={
            <PrivateRoute>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />

        <Route path="/home" element={<RoleRoute />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
