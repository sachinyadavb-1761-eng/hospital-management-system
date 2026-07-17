import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ─── Protect: Token verify karo ───────────────────────────────────────────────
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user || req.user.isDeleted) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      if (!req.user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ─── Authorize Roles: Multiple roles support ──────────────────────────────────
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

// ─── Department Scope Check ───────────────────────────────────────────────────
// Department Admin sirf apne department ka data access kare — dusre department ka nahi
// Usage: router.get("/doctors/:deptId", protect, authorizeRoles("departmentadmin"), checkDepartmentScope, handler)
export const checkDepartmentScope = (req, res, next) => {
  if (req.user.role === "superadmin") return next(); // superadmin sabka access

  const targetDeptId = req.params.deptId || req.body.department;
  if (
    req.user.department &&
    targetDeptId &&
    req.user.department.toString() !== targetDeptId.toString()
  ) {
    return res.status(403).json({
      message: "Access denied. You can only manage your own department.",
    });
  }
  next();
};
