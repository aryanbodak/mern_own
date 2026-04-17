const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
/* ──────────────────────────────────────────────────────────
   DB CONNECTION
────────────────────────────────────────────────────────── */
mongoose
  .connect("mongodb://127.0.0.1:27017/courseDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ──────────────────────────────────────────────────────────
   SCHEMAS
────────────────────────────────────────────────────────── */

// USER
const UserSchema = new mongoose.Schema({
  username:        String,
  email:           String,
  password:        String,
  role:            { type: String, default: "user" },

  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  progress:        { type: Map, of: [String], default: {} },

  // ✅ PROFILE FIELDS
  college:   { type: String, default: "" },
  branch:    { type: String, default: "" },
  year:      { type: String, default: "" },
  bio:       { type: String, default: "" },
  interests: { type: [String], default: [] },
});

// COURSE
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

const User   = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);

/* ──────────────────────────────────────────────────────────
   ADMIN MIDDLEWARE
────────────────────────────────────────────────────────── */
const requireAdmin = async (req, res, next) => {
  const { "x-admin-user": username, "x-admin-pass": password } = req.headers;

  if (!username || !password)
    return res.status(401).json({ message: "Unauthorized" });

  const admin = await User.findOne({ username, password, role: "admin" });

  if (!admin)
    return res.status(403).json({ message: "Forbidden" });

  next();
};

/* ──────────────────────────────────────────────────────────
   AUTH
────────────────────────────────────────────────────────── */
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ message: "User already exists" });

  await new User({ username, email, password }).save();
  res.json({ message: "Signup successful" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ message: "Invalid credentials" });

  res.json({
    message: "Login successful",
    role: user.role,
    username: user.username
  });
});

/* ──────────────────────────────────────────────────────────
   COURSES
────────────────────────────────────────────────────────── */
app.get("/api/courses", async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses);
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch {
    res.status(500).json({ message: "Error fetching course" });
  }
});

/* ──────────────────────────────────────────────────────────
   ENROLL
────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────
   PROFILE (IMPORTANT)
────────────────────────────────────────────────────────── */

// GET FULL PROFILE
app.get("/api/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("enrolledCourses");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PROFILE
app.put("/api/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { college, branch, year, bio, interests } = req.body;

    const user = await User.findOneAndUpdate(
      { username },
      {
        $set: {
          college:   college || "",
          branch:    branch || "",
          year:      year || "",
          bio:       bio || "",
          interests: interests || []
        }
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────────────────────────
   PROGRESS
────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────
   ADMIN
────────────────────────────────────────────────────────── */

// USERS (FULL DETAILS)
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("-password")
    .populate("enrolledCourses", "title tag color topics");

  res.json(users);
});

// COURSES
app.post("/api/admin/courses", requireAdmin, async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json({ message: "Course added", course });
});

app.put("/api/admin/courses/:id", requireAdmin, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Course updated", course });
});

app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Course deleted" });
});

/* ──────────────────────────────────────────────────────────
   CHATBOT
────────────────────────────────────────────────────────── */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Please type something." });
    }

    const msg = message.toLowerCase();
    const courses = await Course.find();
    const courseList = courses.map(c => `• ${c.title}`).join("\n");

    if (msg.includes("course")) {
      return res.json({
        reply: `Available courses:\n\n${courseList}`
      });
    }

    if (msg.includes("enroll")) {
      return res.json({
        reply: "Go to Explore → select course → click Enroll"
      });
    }

    return res.json({
      reply: "Try asking about available courses or how to enroll!"
    });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Server error." });
  }
});

/*──────────────────────────────────────────────────
   SERVER START
────────────────────────────────────────────────────────── */
app.listen(5000, () =>
  console.log("Server running  http://localhost:5000")
);