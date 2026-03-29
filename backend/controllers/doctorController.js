import Doctor from "../models/Doctor.js";

// @desc  Naya doctor add karo
// @route POST /api/doctors
export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ message: "Doctor added successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Sabke doctors dekho
// @route GET /api/doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Ek doctor dekho
// @route GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor nahi mila" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Doctor update karo
// @route PUT /api/doctors/:id
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor nahi mila" });
    }
    res.status(200).json({ message: "Doctor updated", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Doctor delete karo
// @route DELETE /api/doctors/:id
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor nahi mila" });
    }
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
