import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDoctorsByDepartment,
} from "../controllers/departmentController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);
router.get("/:id/doctors", getDoctorsByDepartment);

// Sirf superadmin department bana/edit/delete kar sakta hai
router.post("/", protect, authorizeRoles("superadmin"), createDepartment);
router.put("/:id", protect, authorizeRoles("superadmin"), updateDepartment);
router.delete("/:id", protect, authorizeRoles("superadmin"), deleteDepartment);

export default router;
