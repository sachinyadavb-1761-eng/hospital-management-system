import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser); // ← "registeauthRoutes.js file coderUser" tha, fix kiya
router.post("/login", loginUser);

export default router;
