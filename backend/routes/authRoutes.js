import express from "express";
import {
  registerUser,
  loginUser,
  loginDoctor,
  loginAdmin,
  loginStaff,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser); // Patient only
router.post("/doctor-login", loginDoctor); // Doctor only
router.post("/staff-login", loginStaff); // Receptionist only
router.post("/admin-login", loginAdmin); // Superadmin + Department admin

// OTP based forgot/reset password — email ya phone dono support karta hai
router.post("/forgot-password", forgotPassword); // Step 1: send OTP
router.post("/reset-password", resetPassword); // Step 2: verify OTP + set new password

export default router;
