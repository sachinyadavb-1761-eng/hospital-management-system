import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true, // e.g. Cardiologist, Dentist
    },
    experience: {
      type: Number,
      required: true, // years mein
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    available: {
      type: Boolean,
      default: true, // doctor available hai ya nahi
    },
  },
  { timestamps: true },
);

export default mongoose.model("Doctor", doctorSchema);
