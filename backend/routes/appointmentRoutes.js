import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAnalytics,
} from "../controllers/appointmentController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Analytics route (superadmin, departmentadmin)
router.get(
  "/analytics",
  protect,
  authorizeRoles("superadmin", "departmentadmin"),
  getAnalytics,
);

// ✅ Patient/Doctor/Admin — appointment book kar sakte hain
router.post("/", protect, createAppointment);

// ✅ Superadmin/departmentadmin: saare | Doctor: ?doctorId=xxx | Patient: ?patientId=xxx
router.get("/", protect, getAllAppointments);
router.get("/:id", protect, getAppointmentById);

// ✅ Superadmin, departmentadmin aur doctor teeno update kar sakte hain (status change etc.)
router.put(
  "/:id",
  protect,
  authorizeRoles("superadmin", "departmentadmin", "doctor"),
  updateAppointment,
);

// ✅ Sirf superadmin aur departmentadmin delete kar sakte hain
router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin", "departmentadmin"),
  deleteAppointment,
);

export default router;
