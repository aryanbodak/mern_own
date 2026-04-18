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
  await db.collection("courses").createIndex({ title: "text", description: "text" });
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

  /* ── Courses ───────────────────────────────────────────────────────────── */
  const now = new Date();

  await db.collection("courses").insertMany([

    /* ============================================================
       ORIGINAL COURSES — expanded with more subtopics
    ============================================================ */

    {
      title: "Full Stack Web Development", tag: "Dev",
      description: "Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch.",
      duration: "12 hrs", lessons: 24, color: "#6366f1",
      createdAt: now,
      topics: [
        {
          topicName: "Frontend Basics",
          subTopics: [
            { subTopicName: "HTML & CSS",
              data: "HTML structures the page using semantic elements like <header>, <main>, <section>, and <article>. CSS styles it using the box model, flexbox, and grid. Together they form the visual layer of any website." },
            { subTopicName: "JavaScript Fundamentals",
              data: "Variables (let/const), functions, loops, events, and DOM manipulation are the building blocks of interactive web pages. ES6+ introduced arrow functions, destructuring, spread/rest operators, and async/await." },
            { subTopicName: "Responsive Design",
              data: "Responsive design makes websites look good on all screen sizes. Use CSS media queries (@media), flexible grid layouts, and relative units (%, rem, vw, vh). Mobile-first approach: design for small screens first, then scale up." },
            { subTopicName: "CSS Flexbox & Grid",
              data: "Flexbox is a 1D layout system — great for rows or columns. display:flex, justify-content, align-items are the core properties. CSS Grid is 2D — use grid-template-columns and grid-template-rows to build full page layouts." }
          ]
        },
        {
          topicName: "Backend with Node.js",
          subTopics: [
            { subTopicName: "Express.js Setup",
              data: "Express is a minimal framework for Node.js. Use it to create REST APIs with app.get(), app.post(), app.put(), app.delete(). Middleware like cors() and express.json() are applied with app.use()." },
            { subTopicName: "MongoDB & Mongoose",
              data: "MongoDB is a NoSQL database that stores JSON-like documents. Mongoose provides schemas and models on top of MongoDB for Node.js, making it easy to define data structure and run queries." },
            { subTopicName: "REST API Design",
              data: "REST APIs use HTTP methods to perform CRUD operations: GET (read), POST (create), PUT (update), DELETE (remove). Resources are identified by URLs like /api/users or /api/courses/:id. Always return appropriate status codes: 200, 201, 404, 500." },
            { subTopicName: "Authentication with JWT",
              data: "JWT (JSON Web Token) is a stateless auth system. After login, the server signs a token with a secret key and sends it to the client. The client includes it in every request header: Authorization: Bearer <token>. The server verifies the signature on each request." }
          ]
        },
        {
          topicName: "Deployment",
          subTopics: [
            { subTopicName: "Deploying to Render/Railway",
              data: "Push your repo to GitHub. Connect to Render or Railway, set environment variables (MONGO_URI, PORT), and deploy. Frontend can be deployed separately to Vercel or Netlify." },
            { subTopicName: "Environment Variables",
              data: "Never hardcode secrets. Use .env files locally (with dotenv package) and set environment variables in your hosting dashboard for production. Common vars: MONGO_URI, PORT, JWT_SECRET. Always add .env to .gitignore." },
            { subTopicName: "CI/CD Basics",
              data: "CI/CD automates testing and deployment. GitHub Actions can run your test suite on every push and auto-deploy to production if tests pass. A basic workflow file lives in .github/workflows/deploy.yml." }
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
              data: "Props pass data down into components (read-only). State holds data that changes over time inside a component. Changes to state trigger a re-render." },
            { subTopicName: "Event Handling",
              data: "React uses synthetic events: onClick, onChange, onSubmit. Always pass a function reference — onClick={handleClick}, not onClick={handleClick()}. Use event.preventDefault() to stop default browser behaviour like form submission." },
            { subTopicName: "Conditional Rendering",
              data: "Render different UI based on state. Use ternary: {isLoggedIn ? <Dashboard/> : <Login/>}. Use && for simple show/hide: {isLoading && <Spinner/>}. Avoid complex logic in JSX — move it to variables above the return." }
          ]
        },
        {
          topicName: "React Hooks",
          subTopics: [
            { subTopicName: "useState",
              data: "useState lets you add state to functional components. Call it with an initial value: const [count, setCount] = useState(0). Always use the setter function — never mutate state directly." },
            { subTopicName: "useEffect",
              data: "useEffect runs side effects after renders — data fetching, subscriptions, timers. The dependency array controls when it fires. Return a cleanup function to avoid memory leaks." },
            { subTopicName: "useContext",
              data: "useContext lets you read a context value without prop drilling. Create context with React.createContext(), provide it with <Context.Provider value={...}>, and consume it with useContext(MyContext). Great for theme, auth, language settings." },
            { subTopicName: "useRef",
              data: "useRef gives you a mutable ref object that persists across renders without causing re-renders. Use it to access DOM elements directly (inputRef.current.focus()) or to store values you don't want to trigger re-renders." }
          ]
        },
        {
          topicName: "React Router & State Management",
          subTopics: [
            { subTopicName: "React Router v6",
              data: "React Router lets you build multi-page SPAs. Use <BrowserRouter>, <Routes>, <Route path='/home' element={<Home/>}/>. useNavigate() for programmatic navigation. useParams() to read URL parameters like /course/:id." },
            { subTopicName: "Lifting State Up",
              data: "When two sibling components need the same data, lift state to their common parent and pass it down as props. This is the React way of sharing state without a state management library." }
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
              data: "def keyword defines functions. for and while loops handle iteration. List comprehensions [x*2 for x in range(10)] are a Pythonic way to build lists. Keep functions small and focused." },
            { subTopicName: "File Handling & Libraries",
              data: "Read files with open('file.csv', 'r'). Use the csv module for CSV files or pandas read_csv() for data files. Install libraries with pip install pandas numpy matplotlib. Import with import pandas as pd." }
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
              data: "matplotlib lets you create line charts (plt.plot), bar charts (plt.bar), scatter plots (plt.scatter) and histograms. Use seaborn for statistical visualizations with less code." },
            { subTopicName: "Data Cleaning",
              data: "Real data is messy. Handle missing values with df.dropna() or df.fillna(). Remove duplicates with df.drop_duplicates(). Convert types with df['col'].astype(int). Rename columns with df.rename(). This step takes 80% of a data scientist's time." }
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
              data: "Consistent spacing using an 8px grid system creates clean, professional layouts. Alignment creates visual order. Use auto-layout in Figma to maintain consistent spacing." },
            { subTopicName: "Colour Theory",
              data: "Use a primary, secondary, and accent colour palette. Complementary colours (opposite on the wheel) create contrast. Analogous colours (adjacent) create harmony. Tools: Coolors.co, Adobe Color. Always check contrast ratios for accessibility." },
            { subTopicName: "Typography",
              data: "Limit to 2 font families — one for headings (display), one for body. Font scale: 12, 14, 16, 18, 24, 32, 48px. Line height 1.5x font size for body text. Never use pure black (#000) — use #111 or #1a1a1a for softer readability." }
          ]
        },
        {
          topicName: "Figma Essentials",
          subTopics: [
            { subTopicName: "Components & Auto Layout",
              data: "Figma components are reusable design elements — like React components. Auto Layout creates responsive frames that adjust when content changes. Variants let you create interactive states." },
            { subTopicName: "Prototyping",
              data: "Connect frames in Figma with interactions to create clickable prototypes. Share with developers for inspection. Use Dev Mode to export CSS properties and assets." },
            { subTopicName: "User Research & Wireframing",
              data: "Before designing, understand users. Create user personas, map user journeys, and sketch low-fidelity wireframes. Wireframes focus on layout and flow, not colours or fonts. Validate ideas early with simple paper sketches before moving to Figma." }
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
              data: "A decision tree splits data into branches based on feature values using Gini impurity or entropy. Prone to overfitting — use Random Forests (bagging) or Gradient Boosting to improve." },
            { subTopicName: "Support Vector Machines",
              data: "SVM finds the hyperplane that best separates classes with maximum margin. The kernel trick (RBF, polynomial) maps data into higher dimensions for non-linear separation. Best for small-to-medium datasets with clear margin of separation." }
          ]
        },
        {
          topicName: "Unsupervised Learning",
          subTopics: [
            { subTopicName: "K-Means Clustering",
              data: "K-Means groups data into K clusters by minimizing intra-cluster distance. Choose K using the elbow method — plot inertia vs K and find the bend. Sensitive to initial centroids — use K-Means++ initialization for better results." },
            { subTopicName: "Dimensionality Reduction (PCA)",
              data: "PCA reduces the number of features while preserving variance. Projects data onto principal components ordered by explained variance. Useful for visualization and removing noise before training models." }
          ]
        },
        {
          topicName: "Neural Networks",
          subTopics: [
            { subTopicName: "Perceptrons",
              data: "A perceptron is the simplest neural network unit. It takes weighted inputs, sums them, adds a bias, and passes through an activation function (ReLU, sigmoid). Multiple perceptrons form a layer." },
            { subTopicName: "Backpropagation",
              data: "Backpropagation computes the gradient of the loss function with respect to each weight using the chain rule. The optimizer (SGD, Adam) then adjusts weights to minimize prediction error." },
            { subTopicName: "Convolutional Neural Networks",
              data: "CNNs are designed for image data. Convolutional layers apply filters to detect edges, textures, and patterns. Pooling layers reduce spatial dimensions. Fully connected layers at the end output class predictions. Used in image classification, object detection." }
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
              data: "S3 stores objects (files, images, backups) with 11 nines of durability. Organize with buckets and prefixes. Enable versioning, lifecycle rules, and cross-region replication for production setups." },
            { subTopicName: "IAM & Security",
              data: "IAM controls who can do what in AWS. Create users, groups, and roles. Attach policies (JSON documents) that define allowed actions. Always follow least privilege principle — give only the permissions needed." }
          ]
        },
        {
          topicName: "Serverless",
          subTopics: [
            { subTopicName: "AWS Lambda",
              data: "Lambda runs code without provisioning servers. Triggered by events (API Gateway, S3, DynamoDB streams). Billed per invocation (first 1M free/month). Max 15 min execution time." },
            { subTopicName: "API Gateway",
              data: "API Gateway creates REST, HTTP, and WebSocket APIs that trigger Lambda functions. Supports authentication via Cognito or custom authorizers. Integrates with CloudWatch for monitoring." },
            { subTopicName: "DynamoDB",
              data: "DynamoDB is AWS's fully managed NoSQL database. Primary key = partition key + optional sort key. Auto-scales for any traffic level. Pay per read/write capacity unit. Great for serverless and high-scale apps." }
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
              data: "Use Google Keyword Planner, Ahrefs, or SEMrush to find keywords. Target long-tail keywords with lower competition. Group keywords by intent: informational, navigational, transactional." },
            { subTopicName: "Link Building",
              data: "Backlinks from authoritative sites boost your domain authority. Strategies: guest posting, broken link building, creating shareable content (infographics, tools, studies). Quality over quantity — one link from a high-DA site beats 100 from low-DA sites." }
          ]
        },
        {
          topicName: "Social Media & Analytics",
          subTopics: [
            { subTopicName: "Social Media Strategy",
              data: "Each platform has a different audience. LinkedIn for B2B, Instagram for visual brands, Twitter/X for tech and news, TikTok for Gen Z. Post consistently, use platform-native features (Reels, Stories, Carousels), and engage with comments to boost reach." },
            { subTopicName: "Google Analytics 4",
              data: "GA4 tracks user behaviour on your site. Key metrics: sessions, bounce rate, conversion rate, average session duration. Set up events and goals. Use Acquisition reports to see which channels drive the most traffic." }
          ]
        }
      ]
    },

    /* ============================================================
       7 NEW COURSES
    ============================================================ */

    {
      title: "DevOps & CI/CD Fundamentals", tag: "Cloud",
      description: "Learn Docker, Kubernetes, GitHub Actions and the DevOps culture of shipping fast.",
      duration: "11 hrs", lessons: 22, color: "#0ea5e9",
      createdAt: new Date(now - 1000 * 60 * 420),
      topics: [
        {
          topicName: "Docker & Containers",
          subTopics: [
            { subTopicName: "What is Docker?",
              data: "Docker packages your application and all its dependencies into a container — a lightweight, portable unit that runs the same everywhere. No more 'it works on my machine'. Key concepts: images (blueprint), containers (running instance), Dockerfile (instructions to build an image)." },
            { subTopicName: "Writing a Dockerfile",
              data: "A Dockerfile defines how to build your image. FROM sets the base image. WORKDIR sets the working directory. COPY copies files in. RUN executes commands (npm install). EXPOSE declares the port. CMD sets the default startup command. Build with: docker build -t myapp ." },
            { subTopicName: "Docker Compose",
              data: "Docker Compose runs multi-container apps with one command. Define services (frontend, backend, database) in docker-compose.yml. Each service gets its own container. Use depends_on to control startup order. Run with: docker compose up. Stop with: docker compose down." }
          ]
        },
        {
          topicName: "CI/CD Pipelines",
          subTopics: [
            { subTopicName: "GitHub Actions",
              data: "GitHub Actions automates your workflow. Create .github/workflows/deploy.yml. Workflows are triggered by events (push, pull_request). Jobs contain steps that run commands. Use pre-built actions from the marketplace: actions/checkout, actions/setup-node." },
            { subTopicName: "Automated Testing in CI",
              data: "Run your test suite automatically on every push. If tests fail, the deployment is blocked. This prevents broken code reaching production. Add a test step: run: npm test. Set up branch protection rules to require passing checks before merging." },
            { subTopicName: "Kubernetes Basics",
              data: "Kubernetes (K8s) orchestrates containers at scale. Key objects: Pod (one or more containers), Deployment (manages replicas), Service (exposes pods via stable IP), Ingress (routes external traffic). kubectl is the CLI tool. Use Minikube to run K8s locally." }
          ]
        }
      ]
    },

    {
      title: "Cybersecurity Essentials", tag: "Other",
      description: "Understand how attacks work and how to defend against them. Practical and beginner-friendly.",
      duration: "8 hrs", lessons: 16, color: "#dc2626",
      createdAt: new Date(now - 1000 * 60 * 480),
      topics: [
        {
          topicName: "Attack Types",
          subTopics: [
            { subTopicName: "SQL Injection",
              data: "SQL Injection tricks a database into running malicious queries. Example: entering ' OR 1=1 -- as a username can bypass login. Prevention: use parameterised queries (prepared statements) — never concatenate user input directly into SQL strings. ORMs like Mongoose/Sequelize protect you by default." },
            { subTopicName: "XSS (Cross-Site Scripting)",
              data: "XSS injects malicious scripts into web pages viewed by other users. Stored XSS saves the script to the database. Reflected XSS includes it in the URL. Prevention: sanitise and escape all user-generated content, use Content-Security-Policy headers, and avoid dangerouslySetInnerHTML in React." },
            { subTopicName: "CSRF & Man-in-the-Middle",
              data: "CSRF tricks authenticated users into unknowingly submitting requests. Prevention: use CSRF tokens or SameSite cookie attribute. MITM attacks intercept network traffic between client and server. Prevention: use HTTPS everywhere (TLS), HSTS headers, and certificate pinning." }
          ]
        },
        {
          topicName: "Defence & Best Practices",
          subTopics: [
            { subTopicName: "Password Security & Hashing",
              data: "Never store plain text passwords. Use bcrypt — it's slow by design, making brute force attacks expensive. bcrypt.hash(password, 10) hashes with 10 salt rounds. bcrypt.compare(input, hash) verifies. Also enforce: minimum length, complexity rules, and rate limiting on login endpoints." },
            { subTopicName: "HTTPS & TLS",
              data: "HTTPS encrypts all traffic between browser and server using TLS. Get a free SSL certificate from Let's Encrypt. Always redirect HTTP to HTTPS. Set security headers: HSTS, X-Frame-Options, X-Content-Type-Options. Use Helmet.js in Express to set these automatically." },
            { subTopicName: "Security Auditing Tools",
              data: "Regularly audit your code and dependencies. npm audit scans for known vulnerabilities in packages. OWASP ZAP is a free tool to scan your web app for common vulnerabilities. Burp Suite is used by professionals for penetration testing." }
          ]
        }
      ]
    },

    {
      title: "TypeScript for JavaScript Developers", tag: "Dev",
      description: "Add static typing to your JavaScript code and catch bugs before they happen.",
      duration: "7 hrs", lessons: 14, color: "#3b82f6",
      createdAt: new Date(now - 1000 * 60 * 540),
      topics: [
        {
          topicName: "TypeScript Basics",
          subTopics: [
            { subTopicName: "Types & Interfaces",
              data: "TypeScript adds static types to JavaScript. Basic types: string, number, boolean, any, void, null, undefined. Interfaces define the shape of objects: interface User { name: string; age: number; }. Types vs Interfaces: both work for objects, but types can also define unions and primitives." },
            { subTopicName: "Functions & Generics",
              data: "Type function parameters and return values: function add(a: number, b: number): number. Generics make code reusable across types: function identity<T>(arg: T): T. Use generics in arrays: Array<string> or string[]. Generic constraints: <T extends object> limits T to objects." },
            { subTopicName: "Enums & Union Types",
              data: "Enums define named constants: enum Role { Admin, User, Guest }. Union types allow multiple types: type ID = string | number. Literal types restrict values: type Direction = 'left' | 'right' | 'up' | 'down'. Optional properties with ?: interface User { email?: string }." }
          ]
        },
        {
          topicName: "TypeScript in Practice",
          subTopics: [
            { subTopicName: "TypeScript with React",
              data: "Type component props with interfaces: interface Props { name: string; age: number }. Use React.FC<Props> for functional components. Type useState: useState<User | null>(null). Type event handlers: onChange={(e: React.ChangeEvent<HTMLInputElement>) => ...}." },
            { subTopicName: "TypeScript with Node.js",
              data: "Install @types/node and @types/express for type definitions. Type req and res in Express: Request, Response from 'express'. Compile TypeScript with tsc or use ts-node for development. Configure tsconfig.json: set target, module, outDir, strict mode." }
          ]
        }
      ]
    },

    {
      title: "SQL & Database Design", tag: "Data",
      description: "Master relational databases, SQL queries, joins, indexing, and schema design.",
      duration: "9 hrs", lessons: 18, color: "#ca8a04",
      createdAt: new Date(now - 1000 * 60 * 600),
      topics: [
        {
          topicName: "SQL Fundamentals",
          subTopics: [
            { subTopicName: "SELECT, WHERE & Filtering",
              data: "SELECT retrieves data: SELECT * FROM users WHERE age > 18. Filter with WHERE, AND, OR, NOT. Sort with ORDER BY col ASC/DESC. Limit results with LIMIT 10. Use LIKE for pattern matching: WHERE name LIKE 'J%'. IS NULL and IS NOT NULL for null checks." },
            { subTopicName: "JOINs",
              data: "JOINs combine rows from multiple tables. INNER JOIN returns matching rows from both tables. LEFT JOIN returns all rows from the left table plus matches from the right (nulls where no match). Example: SELECT u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id." },
            { subTopicName: "GROUP BY & Aggregates",
              data: "Aggregate functions: COUNT(), SUM(), AVG(), MIN(), MAX(). GROUP BY groups rows for aggregation: SELECT department, COUNT(*) FROM employees GROUP BY department. HAVING filters groups (like WHERE but for aggregates): HAVING COUNT(*) > 5." }
          ]
        },
        {
          topicName: "Database Design",
          subTopics: [
            { subTopicName: "Normalisation",
              data: "Normalisation removes data redundancy. 1NF: atomic values, no repeating groups. 2NF: no partial dependencies. 3NF: no transitive dependencies. A properly normalised schema is easier to maintain and less prone to anomalies." },
            { subTopicName: "Indexes & Performance",
              data: "Indexes speed up queries at the cost of slower writes and more storage. CREATE INDEX idx_email ON users(email). Use EXPLAIN to see if a query uses an index. Avoid indexing every column — index columns used in WHERE, JOIN, and ORDER BY." },
            { subTopicName: "Transactions & ACID",
              data: "Transactions group multiple operations into one atomic unit. ACID: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes). Use BEGIN, COMMIT, ROLLBACK. Critical for financial systems." }
          ]
        }
      ]
    },

    {
      title: "GraphQL API Development", tag: "Dev",
      description: "Build flexible, efficient APIs with GraphQL — query exactly what you need, nothing more.",
      duration: "8 hrs", lessons: 16, color: "#e11d48",
      createdAt: new Date(now - 1000 * 60 * 660),
      topics: [
        {
          topicName: "GraphQL Fundamentals",
          subTopics: [
            { subTopicName: "GraphQL vs REST",
              data: "REST has fixed endpoints — /api/users returns everything. GraphQL has one endpoint /graphql and the client specifies exactly what fields it needs. No over-fetching (getting too much data) or under-fetching (needing multiple requests). Great for complex, nested data requirements." },
            { subTopicName: "Schema & Types",
              data: "GraphQL APIs are defined by a schema. Types: type User { id: ID!, name: String!, email: String }. The ! means non-nullable. Query type defines what data can be fetched. Mutation type defines what data can be changed. Subscription type is for real-time updates." },
            { subTopicName: "Queries & Mutations",
              data: "A Query fetches data: query { user(id: '1') { name email } }. A Mutation modifies data: mutation { createUser(name: 'John') { id name } }. Variables make queries dynamic: query GetUser($id: ID!) { user(id: $id) { name } }." }
          ]
        },
        {
          topicName: "Building a GraphQL Server",
          subTopics: [
            { subTopicName: "Resolvers",
              data: "Resolvers are functions that return data for each field in your schema. Each field in the schema maps to a resolver function. Resolvers receive: parent (result of the parent resolver), args (arguments from the query), context (shared objects like DB connection, auth user)." },
            { subTopicName: "Apollo Server with Node.js",
              data: "Apollo Server is the most popular GraphQL server for Node.js. Install: npm install @apollo/server graphql. Define typeDefs (schema string) and resolvers (object). Pass to ApolloServer and start. Use Apollo Studio (sandbox) to test queries in the browser." }
          ]
        }
      ]
    },

    {
      title: "Mobile App Development with React Native", tag: "Dev",
      description: "Build iOS and Android apps using React skills you already know.",
      duration: "12 hrs", lessons: 24, color: "#7c3aed",
      createdAt: new Date(now - 1000 * 60 * 720),
      topics: [
        {
          topicName: "React Native Basics",
          subTopics: [
            { subTopicName: "Setup & Expo",
              data: "Expo is the easiest way to start React Native. Install: npm install -g @expo/cli then expo create my-app. Expo Go app lets you preview on a real phone by scanning a QR code. No Mac needed for iOS testing. Eject to bare React Native when you need custom native modules." },
            { subTopicName: "Core Components",
              data: "React Native uses native components instead of HTML. View = div, Text = p/span (all text MUST be inside Text), Image = img, TextInput = input, ScrollView = overflow scroll div, FlatList = efficient long list renderer. Styles use StyleSheet.create({}) — similar to CSS but camelCase and no units." },
            { subTopicName: "Navigation with React Navigation",
              data: "React Navigation handles screens in React Native. Install @react-navigation/native. Stack Navigator: screens slide left/right like a browser. Tab Navigator: bottom tab bar. Drawer Navigator: slide-out menu. useNavigation() hook to navigate programmatically." }
          ]
        },
        {
          topicName: "Device Features & Deployment",
          subTopics: [
            { subTopicName: "Accessing Device Features",
              data: "Expo provides ready-made APIs: Camera (expo-camera), Location (expo-location), Notifications (expo-notifications), AsyncStorage for local storage (like localStorage for mobile), SecureStore for sensitive data. Always request permissions before accessing camera or location." },
            { subTopicName: "Publishing to App Stores",
              data: "Use EAS Build (Expo Application Services) to create production builds. eas build --platform ios/android. For Google Play: upload .aab file, fill in store listing, set content rating. For App Store: need a Mac and Apple Developer account ($99/yr). TestFlight for beta testing." }
          ]
        }
      ]
    },

    {
      title: "System Design for Beginners", tag: "Other",
      description: "Learn to design scalable systems — databases, caching, load balancers, and microservices.",
      duration: "10 hrs", lessons: 20, color: "#0891b2",
      createdAt: new Date(now - 1000 * 60 * 780),
      topics: [
        {
          topicName: "Core Concepts",
          subTopics: [
            { subTopicName: "Scalability: Vertical vs Horizontal",
              data: "Vertical scaling = adding more power to one server (bigger CPU, more RAM). Has a ceiling and a single point of failure. Horizontal scaling = adding more servers and distributing load. More resilient. Requires a load balancer to distribute requests. Stateless servers scale horizontally better." },
            { subTopicName: "Load Balancers",
              data: "A load balancer distributes incoming requests across multiple servers. Algorithms: Round Robin (take turns), Least Connections (send to least busy), IP Hash (same client always hits same server). AWS ALB, NGINX, and HAProxy are common load balancers. Also handles SSL termination and health checks." },
            { subTopicName: "Caching",
              data: "Caching stores frequently accessed data in fast memory (RAM) to avoid hitting the database on every request. Redis is the most popular cache. Strategies: Cache-aside (app checks cache first, falls back to DB), Write-through (write to cache and DB simultaneously). Set TTL (time-to-live) to keep cache fresh." }
          ]
        },
        {
          topicName: "Databases & Architecture",
          subTopics: [
            { subTopicName: "SQL vs NoSQL at Scale",
              data: "SQL databases (PostgreSQL, MySQL) are ACID-compliant, great for structured data and complex queries. Scale vertically or with read replicas. NoSQL (MongoDB, DynamoDB) scale horizontally, handle unstructured/flexible data, sacrifice some consistency for availability. Choose based on your data model." },
            { subTopicName: "Microservices vs Monolith",
              data: "A monolith is one large application — simpler to develop and deploy early on. Microservices split into small independent services (auth, payments, notifications) that communicate over HTTP or message queues (RabbitMQ, Kafka). Microservices are harder to manage but scale and deploy independently." },
            { subTopicName: "Message Queues",
              data: "Message queues (RabbitMQ, Kafka, AWS SQS) decouple services by allowing async communication. Producer puts a message in the queue; consumer processes it when ready. Prevents data loss if a service is temporarily down. Use for: sending emails, processing images, triggering notifications after a purchase." }
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
