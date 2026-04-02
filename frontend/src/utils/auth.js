// ─── JWT decoder (no library needed — just base64 decode the payload) ─────────
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// ─── getToken ─────────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("token") || null;
}

// ─── getUser — merged from JWT payload + stored user object ───────────────────
// JWT payload has: { id, role, iat, exp }
// localStorage "user" has: { _id, name, email, role }
export function getUser() {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  // stored takes precedence for name/email; decoded is source of truth for role
  return { ...stored, role: decoded.role, id: decoded.id };
}

// ─── isLoggedIn — checks token exists and has not expired ────────────────────
export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded) return false;
  // exp is Unix timestamp in seconds
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    logout();
    return false;
  }
  return true;
}

// ─── logout ───────────────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

// ─── getDashboardPath — correct dashboard for each role ──────────────────────
export function getDashboardPath(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor-dashboard";
    case "patient":
      return "/patient/dashboard";
    default:
      return "/";
  }
}
