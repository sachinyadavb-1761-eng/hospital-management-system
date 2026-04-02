import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

// ─── Create Appointment ───────────────────────────────────────────────────────
export const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    const populated = await appointment.populate([
      { path: "doctor", select: "name specialization fee" },
      { path: "patient", select: "name age" },
    ]);
    res
      .status(201)
      .json({ message: "Appointment booked!", appointment: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get All Appointments ─────────────────────────────────────────────────────
// ✅ Admin: saare appointments | Doctor: sirf apne | Patient: sirf apne
export const getAllAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "doctor") {
      // Doctor document email se match karo (User._id != Doctor._id)
      const doctor = await Doctor.findOne({ email: req.user.email });
      if (doctor) {
        filter.doctor = doctor._id;
      } else {
        // No Doctor document found for this user — return empty
        return res.status(200).json([]);
      }
    } else if (req.user.role === "patient") {
      // Patient document userId se match karo
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) {
        filter.patient = patient._id;
      } else {
        return res.status(200).json([]);
      }
    }
    // admin: no filter — sab milega

    const appointments = await Appointment.find(filter)
      .populate("doctor", "name specialization fee")
      .populate("patient", "name age phone")
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get One Appointment ──────────────────────────────────────────────────────
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctor", "name specialization fee")
      .populate("patient", "name age phone");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Appointment ───────────────────────────────────────────────────────
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    )
      .populate("doctor", "name specialization")
      .populate("patient", "name age");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment updated!", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete Appointment ───────────────────────────────────────────────────────
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment cancelled!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Analytics (Admin only) ───────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, todayCount, pending, completed, cancelled] =
      await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
        Appointment.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "completed" }),
        Appointment.countDocuments({ status: "cancelled" }),
      ]);

    // Total earnings from completed appointments
    const earningsResult = await Appointment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$fee" } } },
    ]);
    const totalEarnings = earningsResult[0]?.total || 0;

    // Busiest doctor
    const busiestDoctor = await Appointment.aggregate([
      { $group: { _id: "$doctor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
    ]);

    res.status(200).json({
      total,
      todayCount,
      pending,
      completed,
      cancelled,
      totalEarnings,
      busiestDoctor: busiestDoctor[0]?.doctorInfo[0]?.name || "N/A",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
