import Appointment from "../models/Appointment.js";

// @desc  Naya appointment banao
// @route POST /api/appointments
export const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json({ message: "Appointment booked!", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Sabke appointments dekho
// @route GET /api/appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor", "name specialization") // doctor ka naam aur specialization
      .populate("patient", "name age"); // patient ka naam aur age
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Ek appointment dekho
// @route GET /api/appointments/:id
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctor", "name specialization")
      .populate("patient", "name age");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment nahi mila" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Appointment status update karo
// @route PUT /api/appointments/:id
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment nahi mila" });
    }
    res.status(200).json({ message: "Appointment updated!", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Appointment cancel/delete karo
// @route DELETE /api/appointments/:id
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment nahi mila" });
    }
    res.status(200).json({ message: "Appointment cancelled!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
