import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

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

// ─── Forgot Password — POST /api/auth/forgot-password ───────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isDeleted: false });

    // Security: do not reveal whether the user exists to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message: "If this email is registered, a reset link has been sent.",
      });
    }

    // Generate the raw token (this will go in the email)
    const rawToken = crypto.randomBytes(32).toString("hex");
    // Store the hashed token in the DB (never store the raw token)
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minute
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    await sendEmail(
      user.email,
      "Password Reset - HospitalMan",
      `<p>Hello ${user.name},</p>
       <p>Please click the link below to reset your password. It is valid for 15 minutes:</p>
       <a href="${resetUrl}">${resetUrl}</a>
       <p>If you did not request this, please ignore this email.</p>`,
    );

    res.status(200).json({
      message: "If this email is registered, a reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Reset Password — PUT /api/auth/reset-password/:token ───────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user) {
      return res.status(400).json({ message: "Link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful, you can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};