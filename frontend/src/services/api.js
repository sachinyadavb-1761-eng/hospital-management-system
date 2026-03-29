import axios from "axios";

const BASE_URL = "https://hospital-management-system-wlog.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: JWT token attach karo ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// ══════════════════════════════════════════════════════════════
// DOCTORS
// ══════════════════════════════════════════════════════════════
export const doctorsAPI = {
  getAll: () => api.get("/doctors"),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post("/doctors", data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

// ══════════════════════════════════════════════════════════════
// PATIENTS
// ══════════════════════════════════════════════════════════════
export const patientsAPI = {
  getAll: () => api.get("/patients"),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post("/patients", data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// ══════════════════════════════════════════════════════════════
// APPOINTMENTS
// ══════════════════════════════════════════════════════════════
export const appointmentsAPI = {
  getAll: () => api.get("/appointments"),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post("/appointments", data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  getByDoctor: (doctorId) => api.get(`/appointments?doctorId=${doctorId}`),
  getByPatient: (patientId) => api.get(`/appointments?patientId=${patientId}`),
};

export default api;
