import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // ✅ time field add kiya
    time: {
      type: String,
      required: true,
      default: "10:00",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    // ✅ fee snapshot (jab appointment bani tab ki fee)
    fee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    orderId: { type: String },
    paymentId: { type: String },
    amount: { type: Number },
  },
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
