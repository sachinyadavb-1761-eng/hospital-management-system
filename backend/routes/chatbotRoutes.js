import express from "express";
import { sendMessage } from "../controllers/chatbotController.js";

const router = express.Router();

// Public route — patient can use the chatbot without logging in
router.post("/message", sendMessage);

export default router;
