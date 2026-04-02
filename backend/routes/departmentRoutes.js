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

// Admin only
router.post("/", protect, authorizeRoles("admin"), createDepartment);
router.put("/:id", protect, authorizeRoles("admin"), updateDepartment);
router.delete("/:id", protect, authorizeRoles("admin"), deleteDepartment);

export default router;
