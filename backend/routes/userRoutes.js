import express from "express";
import { getProfile, getAllUsers } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Sirf logged-in user apna profile dekh sakta hai
router.get("/profile", protect, getProfile);

// Sirf admin sabke users dekh sakta hai
router.get("/all", protect, authorizeRoles("admin"), getAllUsers);

export default router;
