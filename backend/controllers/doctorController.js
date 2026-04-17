import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ available: true })
      .populate("department", "name icon description")
      .sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "department",
      "name icon description",
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/profile — doctor gets their own profile (protected)
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ email: req.user.email }).populate(
      "department",
      "name icon description",
    );
    if (!doctor)
      return res.status(404).json({ message: "Doctor profile not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialization, experience, department, fee } =
      req.body;

    // 1. Check karo User pehle se exist toh nahi karta
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Doctor with this email already exists" });
    }

    // 2. Default password banao
    const defaultPassword = "Doctor@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 3. User collection mein entry banao (login ke liye)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    // 4. Doctor collection mein entry banao
    const doctor = await Doctor.create({
      name,
      email,
      phone,
      specialization,
      experience,
      department,
      fee,
      userId: user._id,
    });

    const populated = await doctor.populate("department", "name icon");

    res.status(201).json({
      message: "Doctor added successfully!",
      doctor: populated,
      defaultPassword: defaultPassword, // Admin ko dikhao
    });
  } catch (error) {
    // Agar Doctor create fail ho toh User bhi delete karo
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("department", "name icon");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // User collection mein bhi name/email update karo agar change hua
    if (req.body.email || req.body.name) {
      await User.findOneAndUpdate(
        { email: doctor.email },
        {
          ...(req.body.name && { name: req.body.name }),
          ...(req.body.email && { email: req.body.email }),
        },
      );
    }

    res.status(200).json({ message: "Doctor updated!", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // User collection se bhi delete karo
    await User.findOneAndDelete({ email: doctor.email });

    res.status(200).json({ message: "Doctor deleted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
