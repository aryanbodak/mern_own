const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

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

const SubTopicSchema = new mongoose.Schema({ subTopicName: String, data: String });
const TopicSchema    = new mongoose.Schema({ topicName: String, subTopics: [SubTopicSchema] });
const CourseSchema   = new mongoose.Schema({
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

// ─── Admin Middleware ─────────────────────────────────────────────────────────
const requireAdmin = async (req, res, next) => {
  const { "x-admin-user": username, "x-admin-pass": password } = req.headers;
  if (!username || !password) return res.status(401).json({ message: "Unauthorized" });
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
  await new User({ username, email, password }).save();
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
  } catch { res.status(500).json({ message: "Error fetching course" }); }
});

app.post("/api/enroll", async (req, res) => {
  const { username, courseId } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.enrolledCourses.includes(courseId)) return res.json({ message: "Already enrolled" });
  user.enrolledCourses.push(courseId);
  await user.save();
  res.json({ message: "Enrolled successfully" });
});

app.get("/api/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate("enrolledCourses");
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
  const users = await User.find({ role: "user" }).select("-password").populate("enrolledCourses", "title tag color");
  res.json(users);
});

app.post("/api/admin/courses", requireAdmin, async (req, res) => {
  const { title, tag, description, duration, lessons, color, topics } = req.body;
  if (!title || !tag) return res.status(400).json({ message: "Title and tag are required" });
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

// ─── Chatbot Route ────────────────────────────────────────────────────────────
/**
 * Rule-based chatbot — no OpenAI key required.
 * Falls back gracefully. If you have an OpenAI key, swap the
 * getRuleBasedReply() call with the OpenAI section below.
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, courses = [] } = req.body;
    if (!message) return res.status(400).json({ reply: "Please send a message." });

    // ── Option A: Rule-based (default, no API key needed) ──────────────
    const reply = getRuleBasedReply(message.toLowerCase(), courses);
    return res.json({ reply });

    // ── Option B: OpenAI — uncomment + add OPENAI_API_KEY to .env ───────
    // const { OpenAI } = require("openai");
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const courseList = courses.map(c => `• ${c.title} (${c.tag}) — ${c.description}`).join("\n");
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: `You are a helpful assistant for CourseDB, an online learning platform.
    //         Available courses:\n${courseList}
    //         Help users find courses, understand enrollment, and track progress. Be concise and friendly.`
    //     },
    //     { role: "user", content: message }
    //   ],
    //   max_tokens: 300,
    // });
    // return res.json({ reply: completion.choices[0].message.content });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "⚠️ Something went wrong. Please try again." });
  }
});

function getRuleBasedReply(msg, courses) {
  // Greetings
  if (/^(hi|hello|hey|howdy|sup)\b/.test(msg)) {
    return "Hi there! 👋 I'm your CourseDB AI assistant. I can help you find courses, understand enrollment, and track your progress. What would you like to know?";
  }

  // List all courses
  if (/what (courses|classes)|show.*courses|available courses|all courses|list.*courses/.test(msg)) {
    if (!courses.length) return "No courses are available at the moment. Please check back soon!";
    const list = courses.map(c => `• **${c.title}** (${c.tag}) — ${c.duration || "Flexible"}`).join("\n");
    return `Here are all available courses:\n\n${list}\n\nClick any course on the homepage to view details and enroll!`;
  }

  // Course suggestions by tag
  const tagMap = {
    dev: "Dev", development: "Dev", coding: "Dev", programming: "Dev", web: "Dev",
    design: "Design", ui: "Design", ux: "Design",
    data: "Data", analytics: "Data",
    ai: "AI", ml: "AI", machine: "AI", "machine learning": "AI",
    cloud: "Cloud", aws: "Cloud", azure: "Cloud",
    business: "Business",
  };

  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (msg.includes(keyword)) {
      const matching = courses.filter(c => c.tag === tag);
      if (matching.length) {
        const list = matching.map(c => `• ${c.title} — ${c.description || c.duration}`).join("\n");
        return `Here are the **${tag}** courses:\n\n${list}\n\nGo to Explore → filter by "${tag}" to see them all!`;
      }
      return `No ${tag} courses are available right now. Check back soon!`;
    }
  }

  // Enrollment questions
  if (/enroll|sign up for|join|register/.test(msg)) {
    return "To enroll in a course:\n1. Go to the **Explore** tab\n2. Click on any course card\n3. Click **Enroll Now** on the course page\n\nEnrollment is completely free! 🎉";
  }

  // Progress questions
  if (/progress|completed|how.*doing|track/.test(msg)) {
    return "Track your progress under **My Learning** in the nav bar. Each enrolled course shows a progress bar indicating how many subtopics you've completed. Keep going! 💪";
  }

  // Certificate questions
  if (/certificate|cert|diploma/.test(msg)) {
    return "Certificates are awarded upon completing 100% of a course's content. Keep working through the subtopics to earn yours! 🏆";
  }

  // Password / account
  if (/password|account|login|forgot/.test(msg)) {
    return "For account issues, please contact your administrator. If you forgot your password, ask them to reset it in the Admin panel.";
  }

  // Help
  if (/help|what can you do|commands/.test(msg)) {
    return "I can help you with:\n• 🔍 Finding courses by topic\n• 📋 Listing all available courses\n• 📝 Explaining how to enroll\n• 📊 Understanding progress tracking\n• 🏆 Certificate information\n\nJust ask me anything!";
  }

  // Recommend
  if (/recommend|suggest|best|popular|which course/.test(msg)) {
    if (!courses.length) return "No courses are currently available. Check back soon!";
    const pick = courses[Math.floor(Math.random() * courses.length)];
    return `I'd recommend: **${pick.title}** (${pick.tag})\n${pick.description}\n\nDuration: ${pick.duration || "Flexible"} • ${pick.lessons} lessons\n\nFind it in the Explore tab!`;
  }

  // Thanks
  if (/thank|thanks|thx|great|awesome/.test(msg)) {
    return "You're welcome! Happy learning! 🚀 Let me know if you need anything else.";
  }

  // Default
  const titles = courses.slice(0, 3).map(c => c.title).join(", ");
  return `I'm not sure I understood that. You can ask me about:\n• Available courses (e.g. "${titles}")\n• How to enroll\n• Your progress\n• Course recommendations\n\nType **help** to see everything I can do!`;
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
