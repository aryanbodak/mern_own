/**
 * seed.js — CourseDB Database Seeder
 * ------------------------------------
 * Run with:  node seed.js
 *
 * Options:
 *   node seed.js            → seeds only what's missing
 *   node seed.js --reset    → wipes DB and re-seeds everything fresh
 */

const mongoose = require("mongoose");

// ─── Config ───────────────────────────────────────────────────────────────────
const DB_URL    = "mongodb://127.0.0.1:27017/courseDB";
const RESET     = process.argv.includes("--reset");

// ─── Schemas (copied from server.js so seed runs standalone) ─────────────────
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
  title: String, tag: String, description: String,
  duration: String, lessons: Number, color: String,
  topics: [TopicSchema], createdAt: { type: Date, default: Date.now }
});

const User   = mongoose.model("User",   UserSchema);
const Course = mongoose.model("Course", CourseSchema);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const ADMIN = {
  username: "admin",
  email:    "admin@coursedb.com",
  password: "admin123",
  role:     "admin"
};

const SAMPLE_COURSES = [
  {
    title: "Full Stack Web Development",
    tag: "Dev",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch.",
    duration: "12 hrs",
    lessons: 24,
    color: "#6366f1",
    topics: [
      {
        topicName: "Frontend Basics",
        subTopics: [
          { subTopicName: "HTML & CSS", data: "HTML structures the page. CSS styles it. Together they form the visual layer of any website." },
          { subTopicName: "JavaScript Fundamentals", data: "Variables, functions, loops, events — the building blocks of interactive web pages." }
        ]
      },
      {
        topicName: "Backend with Node.js",
        subTopics: [
          { subTopicName: "Express.js Setup", data: "Express is a minimal framework for Node.js. Use it to create APIs and handle HTTP requests easily." },
          { subTopicName: "MongoDB & Mongoose", data: "MongoDB is a NoSQL database. Mongoose provides a schema layer on top of MongoDB for Node.js." }
        ]
      }
    ]
  },
  {
    title: "React for Beginners",
    tag: "Dev",
    description: "Master React components, hooks, state management, and routing.",
    duration: "8 hrs",
    lessons: 16,
    color: "#06b6d4",
    topics: [
      {
        topicName: "React Basics",
        subTopics: [
          { subTopicName: "Components & JSX", data: "React apps are built from components. JSX lets you write HTML-like syntax inside JavaScript." },
          { subTopicName: "Props & State", data: "Props pass data into components. State holds data that changes over time inside a component." }
        ]
      },
      {
        topicName: "React Hooks",
        subTopics: [
          { subTopicName: "useState", data: "useState lets you add state to functional components. Call it with an initial value and get back [value, setter]." },
          { subTopicName: "useEffect", data: "useEffect runs side effects — like fetching data or subscribing to events — after renders." }
        ]
      }
    ]
  },
  {
    title: "Python for Data Science",
    tag: "Data",
    description: "Explore pandas, NumPy, matplotlib and machine learning basics with Python.",
    duration: "10 hrs",
    lessons: 20,
    color: "#f59e0b",
    topics: [
      {
        topicName: "Python Basics",
        subTopics: [
          { subTopicName: "Variables & Data Types", data: "Python supports integers, floats, strings, lists, tuples, dicts and sets out of the box." },
          { subTopicName: "Functions & Loops", data: "def keyword defines functions. for and while loops handle iteration. Keep functions small and focused." }
        ]
      },
      {
        topicName: "Data Analysis",
        subTopics: [
          { subTopicName: "Pandas DataFrames", data: "pandas is the go-to library for data manipulation. A DataFrame is a table of data with labeled rows and columns." },
          { subTopicName: "Visualisation with Matplotlib", data: "matplotlib lets you create line charts, bar charts, scatter plots and more with just a few lines of code." }
        ]
      }
    ]
  },
  {
    title: "UI/UX Design Fundamentals",
    tag: "Design",
    description: "Learn design principles, Figma, typography and colour theory.",
    duration: "6 hrs",
    lessons: 12,
    color: "#ec4899",
    topics: [
      {
        topicName: "Design Principles",
        subTopics: [
          { subTopicName: "Contrast & Hierarchy", data: "Good contrast makes content readable. Visual hierarchy guides the user's eye through the page." },
          { subTopicName: "Spacing & Alignment", data: "Consistent spacing and alignment create clean, professional layouts. Use a grid system." }
        ]
      }
    ]
  },
  {
    title: "Machine Learning A–Z",
    tag: "AI",
    description: "From linear regression to neural networks — a practical ML journey.",
    duration: "14 hrs",
    lessons: 28,
    color: "#8b5cf6",
    topics: [
      {
        topicName: "Supervised Learning",
        subTopics: [
          { subTopicName: "Linear Regression", data: "Linear regression predicts a continuous value by fitting a straight line through training data." },
          { subTopicName: "Decision Trees", data: "A decision tree splits data into branches based on feature values, making it easy to interpret." }
        ]
      },
      {
        topicName: "Neural Networks",
        subTopics: [
          { subTopicName: "Perceptrons", data: "A perceptron is the simplest neural network unit. It takes inputs, applies weights, and outputs a signal." },
          { subTopicName: "Backpropagation", data: "Backpropagation computes gradients and adjusts weights to minimise prediction error during training." }
        ]
      }
    ]
  },
  {
    title: "AWS Cloud Practitioner",
    tag: "Cloud",
    description: "Get started with AWS core services — EC2, S3, Lambda, RDS and more.",
    duration: "9 hrs",
    lessons: 18,
    color: "#10b981",
    topics: [
      {
        topicName: "Core AWS Services",
        subTopics: [
          { subTopicName: "EC2 Instances", data: "EC2 provides resizable virtual servers in the cloud. Choose instance types based on CPU and memory needs." },
          { subTopicName: "S3 Storage", data: "S3 (Simple Storage Service) stores objects — files, images, backups — with high durability and availability." }
        ]
      }
    ]
  }
];

// ─── Seeder ───────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(DB_URL);
  console.log("✅ Connected to MongoDB\n");

  if (RESET) {
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log("🗑  Database wiped (--reset flag)\n");
  }

  // ── Admin user ──
  const existingAdmin = await User.findOne({ username: "admin" });
  if (existingAdmin) {
    // Update password and role in case they drifted
    existingAdmin.password = ADMIN.password;
    existingAdmin.role     = ADMIN.role;
    await existingAdmin.save();
    console.log("👤 Admin already exists — password & role refreshed");
  } else {
    await User.create(ADMIN);
    console.log("👤 Admin user created  →  username: admin | password: admin123");
  }

  // ── Sample courses ──
  let created = 0;
  for (const c of SAMPLE_COURSES) {
    const exists = await Course.findOne({ title: c.title });
    if (!exists) {
      await Course.create(c);
      created++;
    }
  }

  if (created > 0) {
    console.log(`📚 ${created} sample course(s) inserted`);
  } else {
    console.log("📚 All sample courses already exist — skipped");
  }

  console.log("\n🎉 Seeding complete!");
  console.log("──────────────────────────────");
  console.log("   Admin login → admin / admin123");
  console.log("──────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
