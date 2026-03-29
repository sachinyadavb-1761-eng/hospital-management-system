import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // Doctor model se link
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", // Patient model se link
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
