// backend/fixMissingDoctorUsers.js
// (backend folder ke ROOT mein rakho — index.js ke bagal mein, subfolder mein NAHI)
//
// Ye script un saare Doctor documents ko dhoondta hai jinka koi
// matching User document (login ke liye) exist nahi karta,
// aur unke liye ek naya User document bana deta hai
// (role: "doctor", default password: "Doctor@123").
//
// CHALANE KA TARIKA:
//   1. Ye file "backend/fixMissingDoctorUsers.js" path pe save karo
//      (index.js, package.json ke bagal mein — root level)
//   2. .env file mein MONGO_URI already hai (jaisa index.js mein use hota hai)
//   3. Terminal mein backend folder ke ANDAR jaake ye command chalao:
//        node fixMissingDoctorUsers.js
//   4. Script khatam hote hi ek list dikhayega kis-kis doctor ke liye
//      naya User bana, aur unka default password kya hai.
//   5. Wo password doctor ko de do login ke liye (baad mein change kar sakte hain
//      — agar tumhare paas "change password" feature hai; nahi hai to bata dena,
//      wo bhi bana denge).

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Doctor from "./models/Doctor.js";
import User from "./models/User.js";

dotenv.config();

const DEFAULT_PASSWORD = "Doctor@123";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const doctors = await Doctor.find();
  console.log(`Found ${doctors.length} doctor(s) in the Doctor collection.\n`);

  const fixed = [];
  const skipped = [];

  for (const doctor of doctors) {
    if (!doctor.email) {
      skipped.push({ name: doctor.name, reason: "No email on Doctor record" });
      continue;
    }

    const existingUser = await User.findOne({ email: doctor.email });

    if (existingUser) {
      // User already exists — sirf role sahi hai ya nahi check karo
      if (existingUser.role !== "doctor") {
        existingUser.role = "doctor";
        await existingUser.save();
        fixed.push({
          name: doctor.name,
          email: doctor.email,
          action: "role corrected to 'doctor' (User already existed)",
        });
      } else {
        skipped.push({
          name: doctor.name,
          email: doctor.email,
          reason: "User already exists and role is correct — no action needed",
        });
      }
      continue;
    }

    // User missing — naya bana do
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const newUser = await User.create({
      name: doctor.name,
      email: doctor.email,
      password: hashedPassword,
      role: "doctor",
      department: doctor.department || null,
    });

    // Doctor document ko is naye User se link bhi kar do (agar userId field hai)
    if (doctor.userId === undefined || doctor.userId === null) {
      doctor.userId = newUser._id;
      await doctor.save();
    }

    fixed.push({
      name: doctor.name,
      email: doctor.email,
      defaultPassword: DEFAULT_PASSWORD,
      action: "New User document created",
    });
  }

  console.log("═══════════════════════════════════════");
  console.log(`✅ FIXED (${fixed.length}):`);
  console.table(fixed);
  console.log(`⏭️  SKIPPED (${skipped.length}):`);
  console.table(skipped);
  console.log("═══════════════════════════════════════");
  console.log(
    "\n⚠️  New password of doctors set as a  default password : " +
      DEFAULT_PASSWORD,
  );

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
