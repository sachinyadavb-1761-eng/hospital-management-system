import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    age: { type: Number, default: 0 },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    bloodGroup: { type: String, default: "" },
    address: { type: String, default: "" },
    // ✅ User account se link — patient dhundne ke liye
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Patient", patientSchema);
