import Patient from "../models/Patient.js";

// @desc  Naya patient register karo
// @route POST /api/patients
export const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res
      .status(201)
      .json({ message: "Patient registered successfully", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Sab patients ki list
// @route GET /api/patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Single patient by ID
// @route GET /api/patients/:id
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient nahi mila" });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Patient update karo
// @route PUT /api/patients/:id
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) return res.status(404).json({ message: "Patient nahi mila" });
    res.status(200).json({ message: "Patient updated successfully", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Patient delete karo
// @route DELETE /api/patients/:id
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient nahi mila" });
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
