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
    // Forgot password ke liye
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
