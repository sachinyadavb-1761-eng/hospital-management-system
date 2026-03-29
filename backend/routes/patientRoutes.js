import express from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
// Admin aur doctor dono patients dekh sakte hain
router.get("/", protect, authorizeRoles("admin", "doctor"), getAllPatients);
router.get("/:id", protect, authorizeRoles("admin", "doctor"), getPatientById);
 
// Admin aur doctor patient add/edit/delete kar sakte hain
router.post("/", protect, authorizeRoles("admin", "doctor"), createPatient);
router.put("/:id", protect, authorizeRoles("admin", "doctor"), updatePatient);
router.delete("/:id", protect, authorizeRoles("admin", "doctor"), deletePatient);
 
export default router;
 