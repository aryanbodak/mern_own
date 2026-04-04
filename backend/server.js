const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB Connection ────────────────────────────────────────────────────────────
mongoose
  .connect("mongodb://127.0.0.1:27017/courseDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ─── Schemas ──────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  username:        String,
  email:           String,
  password:        String,
  role:            { type: String, default: "user" }, // "user" | "admin"
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  progress:        { type: Map, of: [String], default: {} }
});

const SubTopicSchema = new mongoose.Schema({
  subTopicName: String,
  data: String
});

const TopicSchema = new mongoose.Schema({
  topicName: String,
  subTopics: [SubTopicSchema]
});

const CourseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  tag:         { type: String, required: true },
  description: { type: String, default: "" },
  duration:    { type: String, default: "" },
  lessons:     { type: Number, default: 0 },
  color:       { type: String, default: "#6366f1" },
  topics:      [TopicSchema],
  createdAt:   { type: Date, default: Date.now },
});

const User   = mongoose.model("User",   UserSchema);
const Course = mongoose.model("Course", CourseSchema);

// ─── Middleware: simple admin check ──────────────────────────────────────────
// In production replace this with JWT. For now we pass username + password
// in a custom header and verify on each admin route.
const requireAdmin = async (req, res, next) => {
  const { "x-admin-user": username, "x-admin-pass": password } = req.headers;
  if (!username || !password)
    return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findOne({ username, password, role: "admin" });
  if (!user) return res.status(403).json({ message: "Forbidden" });

  req.adminUser = user;
  next();
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Signup
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) return res.json({ message: "User already exists" });

  const newUser = new User({ username, email, password });
  await newUser.save();
  res.json({ message: "Signup successful" });
});

// Login — returns role so the frontend can redirect correctly
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ message: "Invalid credentials" });

  res.json({ message: "Login successful", role: user.role, username: user.username });
});

// ─── Course Routes (public read) ─────────────────────────────────────────────

// Get all courses
app.get("/api/courses", async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses);
});

// Enroll in a course
app.post("/api/enroll", async (req, res) => {
  const { username, courseId } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.enrolledCourses.includes(courseId))
    return res.json({ message: "Already enrolled" });

  user.enrolledCourses.push(courseId);
  await user.save();
  res.json({ message: "Enrolled successfully" });
});

// Get user profile including enrolled courses and progress
app.get("/api/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .populate("enrolledCourses");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ enrolledCourses: user.enrolledCourses, progress: user.progress || {} });
});

// Update progress
app.post("/api/user/:username/progress", async (req, res) => {
  const { courseId, subtopicId } = req.body;
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ message: "User not found" });

  let completed = user.progress.get(courseId) || [];
  if (!completed.includes(subtopicId)) {
    completed.push(subtopicId);
    user.progress.set(courseId, completed);
    await user.save();
  }
  res.json({ progress: user.progress });
});

// Get a single course
app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Error fetching course" });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// Get all users with their enrolled course details
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("-password")
    .populate("enrolledCourses", "title tag color");
  res.json(users);
});

// Add a new course
app.post("/api/admin/courses", requireAdmin, async (req, res) => {
  const { title, tag, description, duration, lessons, color, topics } = req.body;

  if (!title || !tag)
    return res.status(400).json({ message: "Title and tag are required" });

  const course = new Course({ title, tag, description, duration, lessons, color, topics });
  await course.save();
  res.json({ message: "Course added", course });
});

// Edit a course
app.put("/api/admin/courses/:id", requireAdmin, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json({ message: "Course updated", course });
});

// Delete a course
app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Course deleted" });
});

// ─── Seed admin user (run once) ───────────────────────────────────────────────
// Hit GET /api/seed-admin to create admin / admin account
app.get("/api/seed-admin", async (req, res) => {
  const existing = await User.findOne({ username: "admin" });
  if (existing) return res.json({ message: "Admin already exists" });

  const admin = new User({ username: "admin", email: "admin@coursedb.com", password: "admin123", role: "admin" });
  await admin.save();
  res.json({ message: "Admin created — username: admin  password: admin123" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(5000, () => console.log("Server running on port 5000"));
