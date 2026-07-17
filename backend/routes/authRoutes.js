import express from "express";
import {
  registerUser,
  loginUser,
  loginDoctor,
  loginAdmin,
  loginStaff,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser); // Patient only
router.post("/doctor-login", loginDoctor); // Doctor only
router.post("/staff-login", loginStaff); // Receptionist only
router.post("/admin-login", loginAdmin); // Superadmin + Department admin

export default router;
