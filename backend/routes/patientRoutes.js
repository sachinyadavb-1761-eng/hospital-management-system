import express from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  getMyPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Patient apna record dekhe (before /:id to avoid conflict)
router.get("/me", protect, getMyPatient);

// Superadmin, departmentadmin aur doctor dono patients dekh sakte hain
router.get(
  "/",
  protect,
  authorizeRoles("superadmin", "departmentadmin", "doctor"),
  getAllPatients,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("superadmin", "departmentadmin", "doctor"),
  getPatientById,
);

// Superadmin, departmentadmin aur doctor patient add/edit/delete kar sakte hain
router.post(
  "/",
  protect,
  authorizeRoles("superadmin", "departmentadmin", "doctor"),
  createPatient,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("superadmin", "departmentadmin", "doctor"),
  updatePatient,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin", "departmentadmin", "doctor"),
  deletePatient,
);

export default router;
