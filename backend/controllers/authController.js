import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    // ✅ Patient register kare toh Patient record bhi auto-create karo
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

    // ✅ Doctor register kare toh Doctor record bhi auto-create karo
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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
