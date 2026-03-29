// resetPassword.js
// Backend folder mein ye file rakho aur run karo

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    const newPassword = "admin123"; // naya password
    const hashed = await bcrypt.hash(newPassword, 10);

    const result = await mongoose.connection.db
      .collection("users")
      .updateOne(
        { email: "admin@hospital.com" },
        { $set: { password: hashed } },
      );

    if (result.modifiedCount === 1) {
      console.log("✅ Password reset successful!");
      console.log("Email:    admin@hospital.com");
      console.log("Password: admin123");
    } else {
      console.log("❌ User nahi mila. Email check karo.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Done! ✅");
  }
};

resetPassword();
