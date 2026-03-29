import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    medicalHistory: {
      type: String, // purani bimariyan
      default: "None",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Patient", patientSchema);
