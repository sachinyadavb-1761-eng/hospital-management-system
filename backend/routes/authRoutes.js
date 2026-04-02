import express from "express";
import {
  registerUser,
  loginUser,
  loginDoctor,
  loginAdmin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

// Role-specific login endpoints
router.post("/login", loginUser);          // Patient only
router.post("/doctor-login", loginDoctor); // Doctor only
router.post("/admin-login", loginAdmin);   // Admin only

export default router;
