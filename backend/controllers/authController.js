import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ─── Shared: verify credentials and generate token ───────────────────────────
async function verifyAndSign(email, password) {
  const user = await User.findOne({ email });
  if (!user) throw { status: 404, message: "User not found" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 400, message: "Invalid credentials" };

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );

  return {
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "patient";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    if (userRole === "patient") {
      await Patient.create({
        name,
        email,
        phone: "0000000000",
        age: 0,
        gender: "male",
        bloodGroup: "",
        address: "",
        userId: user._id,
      });
    }

    if (userRole === "doctor") {
      await Doctor.create({
        name,
        email,
        phone: req.body.phone || "0000000000",
        specialization: req.body.specialization || "",
        experience: req.body.experience || 0,
        department: req.body.department || null,
        fee: req.body.fee || 500,
      });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Patient Login — POST /api/auth/login ────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { token, user } = await verifyAndSign(req.body.email, req.body.password);

    if (user.role !== "patient") {
      return res.status(403).json({
        message:
          "This login is for patients only. Please use the Doctor Login or Admin Login page.",
      });
    }

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message });
  }
};

// ─── Doctor Login — POST /api/auth/doctor-login ──────────────────────────────
export const loginDoctor = async (req, res) => {
  try {
    const { token, user } = await verifyAndSign(req.body.email, req.body.password);

    if (user.role !== "doctor") {
      return res.status(403).json({
        message:
          user.role === "patient"
            ? "Patients must use the Patient Login page."
            : "Not authorized as a doctor.",
      });
    }

    res.status(200).json({ message: "Doctor login successful", token, user });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message });
  }
};

// ─── Admin Login — POST /api/auth/admin-login ────────────────────────────────
export const loginAdmin = async (req, res) => {
  try {
    const { token, user } = await verifyAndSign(req.body.email, req.body.password);

    if (user.role !== "admin") {
      return res.status(403).json({
        message:
          user.role === "patient"
            ? "Patients must use the Patient Login page."
            : user.role === "doctor"
              ? "Doctors must use the Doctor Login page."
              : "Not authorized as an admin.",
      });
    }

    res.status(200).json({ message: "Admin login successful", token, user });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message });
  }
};
