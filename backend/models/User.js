import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Forgot password OTP ke liye — phone (optional hai, sabke paas na bhi ho toh chalega)
    phone: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "superadmin",
        "departmentadmin",
        "doctor",
        "receptionist",
        "patient",
      ],
      default: "patient",
    },
    // Department admin, doctor, receptionist — sabka department hoga
    // Superadmin aur patient ke liye null rahega
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    // Soft delete — data kabhi hard delete nahi hoga, sirf flag set hoga
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ─── Forgot Password (OTP based) ──────────────────────────────────
    // OTP hamesha hashed store hota hai, kabhi plain text nahi
    resetOtpHash: {
      type: String,
      default: null,
    },
    resetOtpExpires: {
      type: Date,
      default: null,
    },
    // OTP kis method se bheja gaya tha (email/phone) — resetPassword step pe cross-check ke liye
    resetOtpMethod: {
      type: String,
      enum: ["email", "phone", null],
      default: null,
    },
    // Kitni baar galat OTP try hua — brute force rokne ke liye
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
