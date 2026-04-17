const Course = require("../models/Course");

// GET /api/courses
const getAllCourses = async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses);
};

// GET /api/courses/:id
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch {
    res.status(500).json({ message: "Error fetching course" });
  }
};

module.exports = { getAllCourses, getCourseById };
