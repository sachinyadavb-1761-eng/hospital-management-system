import express from "express";
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public — koi bhi doctors dekh sakta hai (booking ke liye)
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// ✅ Sirf admin add/edit/delete kar sakta hai
router.post("/", protect, authorizeRoles("admin"), createDoctor);
router.put("/:id", protect, authorizeRoles("admin"), updateDoctor);
router.delete("/:id", protect, authorizeRoles("admin"), deleteDoctor);

export default router;
