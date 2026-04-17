/**
 * database/setup.js — CourseDB Full Setup (Native MongoDB Driver)
 * ---------------------------------------------------------------
 * Use this once to initialise the database from scratch.
 * Run with:  node database/setup.js
 *
 * ⚠️  This DROPS existing collections and re-creates everything.
 *     For incremental seeding use seed.js instead.
 */

const { MongoClient } = require("mongodb");

const URI = "mongodb://127.0.0.1:27017";
const DB  = "courseDB";

async function setup() {
  const client = new MongoClient(URI);
  await client.connect();
  console.log("✅  Connected to MongoDB\n");

  const db = client.db(DB);

  /* ── Drop existing collections ────────────────────────────────────────── */
  const existing = (await db.listCollections().toArray()).map(c => c.name);
  if (existing.includes("users"))   await db.collection("users").drop();
  if (existing.includes("courses")) await db.collection("courses").drop();
  console.log("🗑   Old collections dropped (clean slate)\n");

  /* ── Create collections with JSON Schema validation ───────────────────── */
  await db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["username", "password"],
        properties: {
          username:        { bsonType: "string", description: "Required username" },
          email:           { bsonType: "string", description: "User email" },
          password:        { bsonType: "string", description: "Required password" },
          role:            { bsonType: "string", enum: ["user", "admin"] },
          enrolledCourses: { bsonType: "array",  description: "Array of course ObjectIds" },
          progress:        { bsonType: "object", description: "Map of courseId -> [subtopicIds]" },
        }
      }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
  });
  console.log("📁  Created collection: users");

  await db.createCollection("courses", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "tag"],
        properties: {
          title:       { bsonType: "string" },
          tag:         { bsonType: "string", enum: ["Dev", "Design", "Data", "AI", "Cloud", "Business", "Other"] },
          description: { bsonType: "string" },
          duration:    { bsonType: "string" },
          lessons:     { bsonType: "int" },
          color:       { bsonType: "string" },
          topics:      { bsonType: "array" },
          createdAt:   { bsonType: "date" },
        }
      }
    },
    validationLevel:  "moderate",
    validationAction: "warn"
  });
  console.log("📁  Created collection: courses\n");

  /* ── Indexes ───────────────────────────────────────────────────────────── */
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("users").createIndex({ email: 1 });
  await db.collection("courses").createIndex({ tag: 1 });
  await db.collection("courses").createIndex({ createdAt: -1 });
  await db.collection("courses").createIndex({ title: "text", description: "text" }); // full-text search
  console.log("🔑  Indexes created\n");

  /* ── Admin user ────────────────────────────────────────────────────────── */
  await db.collection("users").insertOne({
    username:        "admin",
    email:           "admin@coursedb.com",
    password:        "admin123",
    role:            "admin",
    enrolledCourses: [],
    progress:        {},
    createdAt:       new Date()
  });
  console.log("👤  Admin user inserted  →  username: admin | password: admin123\n");

  /* ── Sample courses ────────────────────────────────────────────────────── */
  const now = new Date();

  await db.collection("courses").insertMany([
    {
      title: "Full Stack Web Development", tag: "Dev",
      description: "Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch.",
      duration: "12 hrs", lessons: 24, color: "#6366f1", createdAt: now,
      topics: [
        {
          topicName: "Frontend Basics",
          subTopics: [
            { subTopicName: "HTML & CSS",
              data: "HTML structures the page using semantic elements like <header>, <main>, <section>, and <article>. CSS styles it using the box model, flexbox, and grid. Together they form the visual layer of any website." },
            { subTopicName: "JavaScript Fundamentals",
              data: "Variables (let/const), functions, loops, events, and DOM manipulation are the building blocks of interactive web pages. ES6+ introduced arrow functions, destructuring, spread/rest operators, and async/await." }
          ]
        },
        {
          topicName: "Backend with Node.js",
          subTopics: [
            { subTopicName: "Express.js Setup",
              data: "Express is a minimal framework for Node.js. Use it to create REST APIs with app.get(), app.post(), app.put(), app.delete(). Middleware like cors() and express.json() are applied with app.use()." },
            { subTopicName: "MongoDB & Mongoose",
              data: "MongoDB is a NoSQL database that stores JSON-like documents. Mongoose provides schemas and models on top of MongoDB for Node.js, making it easy to define data structure and run queries." }
          ]
        },
        {
          topicName: "Deployment",
          subTopics: [
            { subTopicName: "Deploying to Render/Railway",
              data: "Push your repo to GitHub. Connect to Render or Railway, set environment variables (MONGO_URI, PORT), and deploy. Frontend can be deployed separately to Vercel or Netlify." }
          ]
        }
      ]
    },
    {
      title: "React for Beginners", tag: "Dev",
      description: "Master React components, hooks, state management, and routing.",
      duration: "8 hrs", lessons: 16, color: "#06b6d4",
      createdAt: new Date(now - 1000 * 60 * 60),
      topics: [
        {
          topicName: "React Basics",
          subTopics: [
            { subTopicName: "Components & JSX",
              data: "React apps are built from components — reusable pieces of UI. JSX lets you write HTML-like syntax inside JavaScript. Every component returns JSX that React renders to the DOM." },
            { subTopicName: "Props & State",
              data: "Props pass data down into components (read-only). State holds data that changes over time inside a component. Changes to state trigger a re-render." }
          ]
        },
        {
          topicName: "React Hooks",
          subTopics: [
            { subTopicName: "useState",
              data: "useState lets you add state to functional components. Call it with an initial value: const [count, setCount] = useState(0). Always use the setter function — never mutate state directly." },
            { subTopicName: "useEffect",
              data: "useEffect runs side effects after renders — data fetching, subscriptions, timers. The dependency array controls when it fires. Return a cleanup function to avoid memory leaks." }
          ]
        }
      ]
    },
    {
      title: "Python for Data Science", tag: "Data",
      description: "Explore pandas, NumPy, matplotlib and machine learning basics with Python.",
      duration: "10 hrs", lessons: 20, color: "#f59e0b",
      createdAt: new Date(now - 1000 * 60 * 120),
      topics: [
        {
          topicName: "Python Basics",
          subTopics: [
            { subTopicName: "Variables & Data Types",
              data: "Python supports integers, floats, strings, lists, tuples, dicts and sets. It's dynamically typed — no need to declare types. Use type() to check and isinstance() to validate." },
            { subTopicName: "Functions & Loops",
              data: "def keyword defines functions. for and while loops handle iteration. List comprehensions [x*2 for x in range(10)] are a Pythonic way to build lists. Keep functions small and focused." }
          ]
        },
        {
          topicName: "Data Analysis",
          subTopics: [
            { subTopicName: "Pandas DataFrames",
              data: "pandas is the go-to library for data manipulation. A DataFrame is a table with labeled rows and columns. Use df.head(), df.describe(), df.groupby(), and df.merge() for analysis." },
            { subTopicName: "NumPy Arrays",
              data: "NumPy provides n-dimensional arrays and math operations. Arrays are faster than Python lists. Key operations: np.array(), np.zeros(), np.dot(), np.mean(), slicing." },
            { subTopicName: "Visualisation with Matplotlib",
              data: "matplotlib lets you create line charts (plt.plot), bar charts (plt.bar), scatter plots (plt.scatter) and histograms. Use seaborn for statistical visualizations with less code." }
          ]
        }
      ]
    },
    {
      title: "UI/UX Design Fundamentals", tag: "Design",
      description: "Learn design principles, Figma, typography and colour theory.",
      duration: "6 hrs", lessons: 12, color: "#ec4899",
      createdAt: new Date(now - 1000 * 60 * 180),
      topics: [
        {
          topicName: "Design Principles",
          subTopics: [
            { subTopicName: "Contrast & Hierarchy",
              data: "Good contrast (WCAG AA = 4.5:1 ratio) makes content readable. Visual hierarchy guides the user's eye — use size, weight, and color to establish what's most important." },
            { subTopicName: "Spacing & Alignment",
              data: "Consistent spacing using an 8px grid system creates clean, professional layouts. Alignment creates visual order. Use auto-layout in Figma to maintain consistent spacing." }
          ]
        },
        {
          topicName: "Figma Essentials",
          subTopics: [
            { subTopicName: "Components & Auto Layout",
              data: "Figma components are reusable design elements — like React components. Auto Layout creates responsive frames that adjust when content changes. Variants let you create interactive states." },
            { subTopicName: "Prototyping",
              data: "Connect frames in Figma with interactions to create clickable prototypes. Share with developers for inspection. Use Dev Mode to export CSS properties and assets." }
          ]
        }
      ]
    },
    {
      title: "Machine Learning A–Z", tag: "AI",
      description: "From linear regression to neural networks — a practical ML journey.",
      duration: "14 hrs", lessons: 28, color: "#8b5cf6",
      createdAt: new Date(now - 1000 * 60 * 240),
      topics: [
        {
          topicName: "Supervised Learning",
          subTopics: [
            { subTopicName: "Linear Regression",
              data: "Linear regression predicts a continuous value by fitting a straight line through training data. The goal is to minimize the Mean Squared Error (MSE) using gradient descent or closed-form solution." },
            { subTopicName: "Decision Trees",
              data: "A decision tree splits data into branches based on feature values using Gini impurity or entropy. Prone to overfitting — use Random Forests (bagging) or Gradient Boosting to improve." }
          ]
        },
        {
          topicName: "Neural Networks",
          subTopics: [
            { subTopicName: "Perceptrons",
              data: "A perceptron is the simplest neural network unit. It takes weighted inputs, sums them, adds a bias, and passes through an activation function (ReLU, sigmoid). Multiple perceptrons form a layer." },
            { subTopicName: "Backpropagation",
              data: "Backpropagation computes the gradient of the loss function with respect to each weight using the chain rule. The optimizer (SGD, Adam) then adjusts weights to minimize prediction error." }
          ]
        }
      ]
    },
    {
      title: "AWS Cloud Practitioner", tag: "Cloud",
      description: "Get started with AWS core services — EC2, S3, Lambda, RDS and more.",
      duration: "9 hrs", lessons: 18, color: "#10b981",
      createdAt: new Date(now - 1000 * 60 * 300),
      topics: [
        {
          topicName: "Core AWS Services",
          subTopics: [
            { subTopicName: "EC2 Instances",
              data: "EC2 provides resizable virtual servers. Choose instance types (t3.micro, m5.large) based on CPU/memory needs. Key concepts: AMIs, security groups, key pairs, elastic IPs, auto-scaling groups." },
            { subTopicName: "S3 Storage",
              data: "S3 stores objects (files, images, backups) with 11 nines of durability. Organize with buckets and prefixes. Enable versioning, lifecycle rules, and cross-region replication for production setups." }
          ]
        },
        {
          topicName: "Serverless",
          subTopics: [
            { subTopicName: "AWS Lambda",
              data: "Lambda runs code without provisioning servers. Triggered by events (API Gateway, S3, DynamoDB streams). Billed per invocation (first 1M free/month). Max 15 min execution time." },
            { subTopicName: "API Gateway",
              data: "API Gateway creates REST, HTTP, and WebSocket APIs that trigger Lambda functions. Supports authentication via Cognito or custom authorizers. Integrates with CloudWatch for monitoring." }
          ]
        }
      ]
    },
    {
      title: "Digital Marketing Essentials", tag: "Business",
      description: "SEO, social media, email marketing, and analytics for modern businesses.",
      duration: "5 hrs", lessons: 10, color: "#f43f5e",
      createdAt: new Date(now - 1000 * 60 * 360),
      topics: [
        {
          topicName: "SEO Fundamentals",
          subTopics: [
            { subTopicName: "On-Page SEO",
              data: "Optimize title tags, meta descriptions, headings (H1–H3), and image alt text. Use target keywords naturally — avoid keyword stuffing. Page speed and Core Web Vitals are ranking factors." },
            { subTopicName: "Keyword Research",
              data: "Use Google Keyword Planner, Ahrefs, or SEMrush to find keywords. Target long-tail keywords with lower competition. Group keywords by intent: informational, navigational, transactional." }
          ]
        }
      ]
    }
  ]);

  const courseCount = await db.collection("courses").countDocuments();
  const userCount   = await db.collection("users").countDocuments();

  console.log("═══════════════════════════════════════════");
  console.log("  ✅  Database setup complete!");
  console.log("═══════════════════════════════════════════");
  console.log(`  📦  Database : ${DB}`);
  console.log(`  👤  Users    : ${userCount}`);
  console.log(`  📚  Courses  : ${courseCount}`);
  console.log("  🔑  Admin    : admin / admin123");
  console.log("═══════════════════════════════════════════\n");

  await client.close();
}

setup().catch(err => {
  console.error("❌  Setup failed:", err);
  process.exit(1);
});
