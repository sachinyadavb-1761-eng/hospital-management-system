import express from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Sirf admin doctor add/update/delete kar sakta hai
router.post("/", protect, authorizeRoles("admin"), createDoctor);
router.put("/:id", protect, authorizeRoles("admin"), updateDoctor);
router.delete("/:id", protect, authorizeRoles("admin"), deleteDoctor);

// Koi bhi logged-in user doctors dekh sakta hai
router.get("/", protect, getAllDoctors);
router.get("/:id", protect, getDoctorById);

export default router;
