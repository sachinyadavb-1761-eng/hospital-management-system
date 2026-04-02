import Department from "../models/Department.js";
import Doctor from "../models/Doctor.js";

// GET /api/departments — all active departments (public)
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({
      name: 1,
    });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/departments/:id — single department
export const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept)
      return res.status(404).json({ message: "Department not found" });
    res.status(200).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/departments — admin create
export const createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ message: "Department created!", department: dept });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Department with this name already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/departments/:id — admin update
export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!dept)
      return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Department updated!", department: dept });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/departments/:id — admin delete
export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept)
      return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Department deleted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/departments/:id/doctors — all doctors in this department
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      department: req.params.id,
      available: true,
    })
      .populate("department", "name icon description")
      .sort({ name: 1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
