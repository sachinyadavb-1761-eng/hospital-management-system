import axios from "axios";
import { clearAuthData, getToken } from "../utils/auth";

const BASE_URL = "https://hospital-management-system-wlog.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: JWT token attach ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: 401 pe logout ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials), // patient
  loginDoctor: (credentials) => api.post("/auth/doctor-login", credentials), // doctor
  loginStaff: (credentials) => api.post("/auth/staff-login", credentials), // receptionist
  loginAdmin: (credentials) => api.post("/auth/admin-login", credentials), // superadmin + dept admin
  register: (userData) => api.post("/auth/register", userData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    api.put(`/auth/reset-password/${token}`, { newPassword }),
  logout: () => {
    clearAuthData();
  },
};

// ══════════════════════════════════════════════════════════════
// DOCTORS
// ══════════════════════════════════════════════════════════════
export const doctorsAPI = {
  getAll: () => api.get("/doctors"),
  getById: (id) => api.get(`/doctors/${id}`),
  getMyProfile: () => api.get("/doctors/profile"),
  create: (data) => api.post("/doctors", data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

// ══════════════════════════════════════════════════════════════
// PATIENTS
// ══════════════════════════════════════════════════════════════
export const patientsAPI = {
  getAll: () => api.get("/patients"),
  getMe: () => api.get("/patients/me"),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post("/patients", data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// ══════════════════════════════════════════════════════════════
// DEPARTMENTS
// ══════════════════════════════════════════════════════════════
export const departmentsAPI = {
  getAll: () => api.get("/departments"),
  getById: (id) => api.get(`/departments/${id}`),
  getDoctors: (id) => api.get(`/departments/${id}/doctors`),
  create: (data) => api.post("/departments", data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// ══════════════════════════════════════════════════════════════
// APPOINTMENTS
// ══════════════════════════════════════════════════════════════
export const appointmentsAPI = {
  getAll: () => api.get("/appointments"),
  // ✅ Doctor ke liye filtered appointments
  getByDoctor: (doctorId) => api.get(`/appointments?doctorId=${doctorId}`),
  // ✅ Patient ke liye filtered appointments
  getByPatient: (patientId) => api.get(`/appointments?patientId=${patientId}`),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post("/appointments", data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  // ✅ Admin analytics
  getAnalytics: () => api.get("/appointments/analytics"),
};

export default api;
