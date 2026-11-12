import express from "express";
import { sendMessage, textToSpeech } from "../controllers/chatbotController.js";

const router = express.Router();

// Public route — patient can use the chatbot without logging in
router.post("/message", sendMessage);

// Public route — natural-sounding voice for bot replies (Gemini TTS)
router.post("/speak", textToSpeech);

export default router;
