// ═══════════════════════════════════════════════════════════════════════
//  CourseDB — Pure MongoDB Shell Commands
//  Run with:  mongosh courseDB < mongo_shell_commands.js
//  Or paste directly into mongosh
// ═══════════════════════════════════════════════════════════════════════

use courseDB;

// ── Drop old data (for a clean reset) ──────────────────────────────────
db.users.drop();
db.courses.drop();
print("Old collections dropped.");

// ── Create collections ──────────────────────────────────────────────────
db.createCollection("users");
db.createCollection("courses");
print("Collections created.");

// ── Indexes ─────────────────────────────────────────────────────────────
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 });
db.courses.createIndex({ tag: 1 });
db.courses.createIndex({ createdAt: -1 });
db.courses.createIndex({ title: "text", description: "text" });
print("Indexes created.");

// ── Admin user ───────────────────────────────────────────────────────────
db.users.insertOne({
  username: "admin",
  email: "admin@coursedb.com",
  password: "admin123",
  role: "admin",
  enrolledCourses: [],
  progress: {},
  createdAt: new Date()
});
print("Admin user created: admin / admin123");

// ── Sample courses ────────────────────────────────────────────────────────
db.courses.insertMany([
  {
    title: "Full Stack Web Development",
    tag: "Dev",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch.",
    duration: "12 hrs",
    lessons: 24,
    color: "#6366f1",
    createdAt: new Date(),
    topics: [
      {
        topicName: "Frontend Basics",
        subTopics: [
          { subTopicName: "HTML & CSS", data: "HTML structures the page. CSS styles it using flexbox and grid." },
          { subTopicName: "JavaScript Fundamentals", data: "Variables, functions, events, and DOM manipulation." }
        ]
      },
      {
        topicName: "Backend with Node.js",
        subTopics: [
          { subTopicName: "Express.js Setup", data: "Create REST APIs with Express. Use cors() and express.json() middleware." },
          { subTopicName: "MongoDB & Mongoose", data: "Define schemas and models. Run CRUD operations with Mongoose." }
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
    createdAt: new Date(),
    topics: [
      {
        topicName: "React Basics",
        subTopics: [
          { subTopicName: "Components & JSX", data: "Build UIs with reusable components. JSX lets you write HTML-like syntax in JS." },
          { subTopicName: "Props & State", data: "Props pass data into components. State tracks data that changes over time." }
        ]
      },
      {
        topicName: "React Hooks",
        subTopics: [
          { subTopicName: "useState", data: "Add state to functional components: const [value, setValue] = useState(initial)." },
          { subTopicName: "useEffect", data: "Run side effects after renders. Use the dependency array to control when it fires." }
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
    createdAt: new Date(),
    topics: [
      {
        topicName: "Python Basics",
        subTopics: [
          { subTopicName: "Variables & Data Types", data: "int, float, str, list, dict, set — Python is dynamically typed." },
          { subTopicName: "Functions & Loops", data: "def, for, while, list comprehensions — keep functions small and focused." }
        ]
      },
      {
        topicName: "Data Analysis",
        subTopics: [
          { subTopicName: "Pandas DataFrames", data: "Tabular data manipulation: groupby, merge, head, describe." },
          { subTopicName: "Visualisation with Matplotlib", data: "plt.plot, plt.bar, plt.scatter — create charts in a few lines." }
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
    createdAt: new Date(),
    topics: [
      {
        topicName: "Design Principles",
        subTopics: [
          { subTopicName: "Contrast & Hierarchy", data: "WCAG 4.5:1 contrast ratio for accessibility. Use size and weight for hierarchy." },
          { subTopicName: "Spacing & Alignment", data: "8px grid system. Alignment creates visual order. Use auto-layout in Figma." }
        ]
      }
    ]
  },
  {
    title: "Machine Learning A-Z",
    tag: "AI",
    description: "From linear regression to neural networks — a practical ML journey.",
    duration: "14 hrs",
    lessons: 28,
    color: "#8b5cf6",
    createdAt: new Date(),
    topics: [
      {
        topicName: "Supervised Learning",
        subTopics: [
          { subTopicName: "Linear Regression", data: "Minimize MSE by fitting a line through training data using gradient descent." },
          { subTopicName: "Decision Trees", data: "Split data by feature values. Use Random Forests to prevent overfitting." }
        ]
      },
      {
        topicName: "Neural Networks",
        subTopics: [
          { subTopicName: "Perceptrons", data: "Weighted inputs + bias + activation function = a single neuron." },
          { subTopicName: "Backpropagation", data: "Compute gradients via chain rule. Adam optimizer adjusts weights." }
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
    createdAt: new Date(),
    topics: [
      {
        topicName: "Core AWS Services",
        subTopics: [
          { subTopicName: "EC2 Instances", data: "Resizable virtual servers. Choose instance types. Configure security groups and key pairs." },
          { subTopicName: "S3 Storage", data: "Object storage with 11 nines durability. Use for files, backups, static websites." }
        ]
      }
    ]
  }
]);

print("Sample courses inserted.");
print("=================================");
print("  Setup complete!");
print("  Admin: admin / admin123");
print("  Courses: " + db.courses.countDocuments());
print("=================================");
