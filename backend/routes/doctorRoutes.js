import express from "express";
import {
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public — koi bhi doctors dekh sakta hai (booking ke liye)
router.get("/", getAllDoctors);

// ✅ Doctor's own profile (must be before /:id to avoid "profile" treated as id)
router.get("/profile", protect, authorizeRoles("doctor"), getDoctorProfile);

router.get("/:id", getDoctorById);

// ✅ Superadmin aur departmentadmin dono doctor add/edit/delete kar sakte hain
router.post(
  "/",
  protect,
  authorizeRoles("superadmin", "departmentadmin"),
  createDoctor,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("superadmin", "departmentadmin"),
  updateDoctor,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin", "departmentadmin"),
  deleteDoctor,
);

export default router;
