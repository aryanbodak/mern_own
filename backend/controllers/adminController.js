const User   = require("../models/User");
const Course = require("../models/Course");

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("-password")
    .populate("enrolledCourses", "title tag color topics");

  res.json(users);
};

// POST /api/admin/courses
const createCourse = async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json({ message: "Course added", course });
};

// PUT /api/admin/courses/:id
const updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Course updated", course });
};

// DELETE /api/admin/courses/:id
const deleteCourse = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Course deleted" });
};

module.exports = { getAllUsers, createCourse, updateCourse, deleteCourse };
