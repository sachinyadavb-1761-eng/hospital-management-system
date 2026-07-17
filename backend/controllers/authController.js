import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ─── Shared: verify credentials and generate token ───────────────────────────
async function verifyAndSign(email, password) {
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) throw { status: 404, message: "User not found" };

  if (!user.isActive) throw { status: 403, message: "Account is deactivated" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 400, message: "Invalid credentials" };

  const token = jwt.sign(
    { id: user._id, role: user.role, department: user.department },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }, // 30d se 7d kiya — security best practice, refresh token baad mein add karenge
  );

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
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
      department: req.body.department || null,
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

// ─── Patient Login — POST /api/auth/login ────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { token, user } = await verifyAndSign(
      req.body.email,
      req.body.password,
    );
    if (user.role !== "patient") {
      return res.status(403).json({
        message:
          "This login is for patients only. Please use the correct login page.",
      });
    }
    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ─── Doctor Login — POST /api/auth/doctor-login ──────────────────────────────
export const loginDoctor = async (req, res) => {
  try {
    const { token, user } = await verifyAndSign(
      req.body.email,
      req.body.password,
    );
    if (user.role !== "doctor") {
      return res.status(403).json({ message: "Not authorized as a doctor." });
    }
    res.status(200).json({ message: "Doctor login successful", token, user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ─── Staff (Receptionist) Login — POST /api/auth/staff-login ────────────────
export const loginStaff = async (req, res) => {
  try {
    const { token, user } = await verifyAndSign(
      req.body.email,
      req.body.password,
    );
    if (user.role !== "receptionist") {
      return res
        .status(403)
        .json({ message: "Not authorized as staff/receptionist." });
    }
    res.status(200).json({ message: "Staff login successful", token, user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ─── Admin Login (Super Admin + Department Admin) — POST /api/auth/admin-login ─
export const loginAdmin = async (req, res) => {
  try {
    const { token, user } = await verifyAndSign(
      req.body.email,
      req.body.password,
    );
    if (!["superadmin", "departmentadmin"].includes(user.role)) {
      return res.status(403).json({ message: "Not authorized as an admin." });
    }
    res.status(200).json({ message: "Admin login successful", token, user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
