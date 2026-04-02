import { Navigate } from "react-router-dom";
import { isLoggedIn, getUser } from "../utils/auth";

/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * Props:
 *   roles   — array of allowed role strings, e.g. ["admin"] or ["doctor","admin"]
 *             If omitted / empty, any logged-in user is allowed.
 *   children — the page component to render when access is granted
 *
 * Behaviour:
 *   Not logged in          → redirect to /login
 *   Logged in, wrong role  → redirect to /unauthorized
 *   Logged in, correct role → render children
 */
export default function ProtectedRoute({ children, roles = [] }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
