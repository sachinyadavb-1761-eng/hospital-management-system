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

// ✅ Analytics route (admin only)
router.get("/analytics", protect, authorizeRoles("admin"), getAnalytics);

// ✅ Patient/Doctor/Admin — appointment book kar sakte hain
router.post("/", protect, createAppointment);

// ✅ Admin: saare | Doctor: ?doctorId=xxx | Patient: ?patientId=xxx
router.get("/", protect, getAllAppointments);
router.get("/:id", protect, getAppointmentById);

// ✅ Admin aur Doctor dono update kar sakte hain (status change etc.)
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  updateAppointment,
);

// ✅ Sirf admin delete kar sakta hai
router.delete("/:id", protect, authorizeRoles("admin"), deleteAppointment);

export default router;
