import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

// ✅ Sirf login users ke liye
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

// ✅ Role ke hisaab se sahi dashboard pe bhejo
function RoleRoute() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role === "admin") {
    return <Navigate to="/dashboard" />;
  } else {
    return <Navigate to="/doctor-dashboard" />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        {/* Auto redirect based on role */}
        <Route path="/" element={<RoleRoute />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
