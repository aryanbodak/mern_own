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
  role:            { type: String, default: "user" },
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

// Export models so seed.js can import them
module.exports.User   = User;
module.exports.Course = Course;

// ─── Admin Middleware ─────────────────────────────────────────────────────────
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

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.json({ message: "User already exists" });
  const newUser = new User({ username, email, password });
  await newUser.save();
  res.json({ message: "Signup successful" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.json({ message: "Invalid credentials" });
  res.json({ message: "Login successful", role: user.role, username: user.username });
});

// ─── Course Routes ────────────────────────────────────────────────────────────

app.get("/api/courses", async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses);
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Error fetching course" });
  }
});

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

app.get("/api/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .populate("enrolledCourses");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ enrolledCourses: user.enrolledCourses, progress: user.progress || {} });
});

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

// ─── Admin Routes ─────────────────────────────────────────────────────────────

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("-password")
    .populate("enrolledCourses", "title tag color");
  res.json(users);
});

app.post("/api/admin/courses", requireAdmin, async (req, res) => {
  const { title, tag, description, duration, lessons, color, topics } = req.body;
  if (!title || !tag)
    return res.status(400).json({ message: "Title and tag are required" });
  const course = new Course({ title, tag, description, duration, lessons, color, topics });
  await course.save();
  res.json({ message: "Course added", course });
});

app.put("/api/admin/courses/:id", requireAdmin, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json({ message: "Course updated", course });
});

app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Course deleted" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
