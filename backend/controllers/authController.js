import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import sendSMS from "../utils/sendSMS.js";

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
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "patient";

    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: userRole,
      department: req.body.department || null,
    });

    if (userRole === "patient") {
      await Patient.create({
        name,
        email,
        phone: phone || "0000000000",
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

// ══════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD — OTP based (email ya phone, user ki choice)
// ══════════════════════════════════════════════════════════════════════════

// ─── Step 1: Send OTP — POST /api/auth/forgot-password ──────────────────────
// body: { identifier: "email or 10-digit phone", method: "email" | "phone" }
export const forgotPassword = async (req, res) => {
  try {
    const { identifier, method } = req.body;

    if (!identifier || !["email", "phone"].includes(method)) {
      return res.status(400).json({
        message: "Please provide identifier and a valid method (email/phone).",
      });
    }

    const query =
      method === "email"
        ? { email: identifier, isDeleted: false }
        : { phone: identifier, isDeleted: false };

    const user = await User.findOne(query);

    // Security: do not reveal whether the user exists to prevent enumeration
    const genericMsg = `If this ${method} is registered, an OTP has been sent.`;
    if (!user) {
      return res.status(200).json({ message: genericMsg });
    }

    if (method === "phone" && !user.phone) {
      // Registered user ke paas phone number save hi nahi hai
      return res.status(200).json({ message: genericMsg });
    }

    // 6-digit OTP generate karo
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetOtpHash = hashedOtp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minute valid
    user.resetOtpMethod = method;
    user.resetOtpAttempts = 0;
    await user.save();

    if (method === "email") {
      await sendEmail(
        user.email,
        "Your Password Reset OTP - HospitalMan",
        `<p>Hello ${user.name},</p>
         <p>Your OTP to reset your password is:</p>
         <h2 style="letter-spacing:4px;">${otp}</h2>
         <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>`,
      );
    } else {
      await sendSMS(
        user.phone,
        `Your HospitalMan password reset OTP is ${otp}. Valid for 10 minutes. Do not share it with anyone.`,
      );
    }

    res.status(200).json({ message: genericMsg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Step 2: Verify OTP + Set new password — POST /api/auth/reset-password ──
// body: { identifier, method, otp, newPassword }
export const resetPassword = async (req, res) => {
  try {
    const { identifier, method, otp, newPassword } = req.body;

    if (!identifier || !method || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const query =
      method === "email"
        ? { email: identifier, isDeleted: false }
        : { phone: identifier, isDeleted: false };

    const user = await User.findOne(query);

    if (
      !user ||
      !user.resetOtpHash ||
      user.resetOtpMethod !== method ||
      !user.resetOtpExpires ||
      user.resetOtpExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "OTP is invalid or has expired." });
    }

    // Brute force protection — 5 galat attempts ke baad OTP invalidate
    if (user.resetOtpAttempts >= 5) {
      user.resetOtpHash = null;
      user.resetOtpExpires = null;
      user.resetOtpMethod = null;
      await user.save();
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const hashedInput = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedInput !== user.resetOtpHash) {
      user.resetOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    // OTP correct — password update, OTP clear
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpMethod = null;
    user.resetOtpAttempts = 0;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successful, you can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
