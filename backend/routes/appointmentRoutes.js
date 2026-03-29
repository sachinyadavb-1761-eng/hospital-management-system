import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Koi bhi logged-in user appointment book kar sakta hai
router.post("/", protect, createAppointment);
router.get("/", protect, getAllAppointments);
router.get("/:id", protect, getAppointmentById);

// Sirf admin update/delete kar sakta hai
router.put("/:id", protect, authorizeRoles("admin"), updateAppointment);
router.delete("/:id", protect, authorizeRoles("admin"), deleteAppointment);

export default router;
