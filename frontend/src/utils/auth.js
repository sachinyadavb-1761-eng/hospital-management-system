function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// ✅ FIX: sirf sessionStorage use karo — ye har browser TAB ke liye ISOLATED hai.
// Pehle localStorage bhi use ho raha tha, jo saare tabs mein SHARED hota hai
// (same origin) — isi wajah se ek tab mein doctor login karne par
// dusre tab ka user session overwrite/logout ho raha tha.
function readStoredValue(key) {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(key);
}

function writeStoredValue(key, value) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, value);
}

function removeStoredValue(key) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
}

export function setAuthData(token, user) {
  if (!token) return;
  writeStoredValue("token", token);
  writeStoredValue("user", JSON.stringify(user ?? {}));
}

export function clearAuthData() {
  removeStoredValue("token");
  removeStoredValue("user");
}

export function getToken() {
  return readStoredValue("token") || null;
}

export function getUser() {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  const stored = JSON.parse(readStoredValue("user") || "null");
  return { ...stored, role: decoded.role, id: decoded.id };
}

export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded) return false;
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    logout();
    return false;
  }
  return true;
}

export function logout() {
  clearAuthData();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function getDashboardPath(role) {
  switch (role) {
    case "superadmin":
    case "departmentadmin":
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor-dashboard";
    case "receptionist":
      return "/staff-dashboard";
    case "patient":
      return "/patient/dashboard";
    default:
      return "/";
  }
}
