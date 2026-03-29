import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";

// 1. Configs
dotenv.config();
const app = express();

// 2. CORS — Vercel frontend allow karo
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hospital-management-system-liart-seven.vercel.app",
      /\.vercel\.app$/, // saare vercel domains allow
    ],
    credentials: true,
  }),
);

// 3. Middlewares
app.use(express.json());

// 4. Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// 5. Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);

app.get("/", (req, res) => {
  res.send("Hospital Management System backend running! ✅");
});

// 6. Port
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
