import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import Department from "./models/Department.js";

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

// 4. Database Connection — returns promise for chaining
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

// ─── Seed default departments if none exist ───────────────────────────────────
const seedDepartments = async () => {
  const count = await Department.countDocuments();
  if (count > 0) return;
  const defaults = [
    { name: "Cardiology", icon: "❤️", description: "Heart and cardiovascular system" },
    { name: "Neurology", icon: "🧠", description: "Brain, spinal cord and nervous system" },
    { name: "Orthopedics", icon: "🦴", description: "Bones, joints and musculoskeletal system" },
    { name: "Pediatrics", icon: "👶", description: "Medical care for infants, children and adolescents" },
    { name: "Dermatology", icon: "🔬", description: "Skin, hair and nail disorders" },
    { name: "General Medicine", icon: "🏥", description: "Primary care and internal medicine" },
    { name: "ENT", icon: "👂", description: "Ear, nose and throat disorders" },
    { name: "Gynecology", icon: "🌸", description: "Women's reproductive health" },
  ];
  await Department.insertMany(defaults);
  console.log("✅ Default departments seeded");
};

connectDB().then(seedDepartments);

// 5. Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/departments", departmentRoutes);

app.get("/", (req, res) => {
  res.send("Hospital Management System backend running! ✅");
});

// 6. Port
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
