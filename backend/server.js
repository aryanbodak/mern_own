const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const connectDB      = require("./config/db");
const authRoutes     = require("./routes/authRoutes");
const enrollRoutes   = require("./routes/enrollRoutes");
const courseRoutes   = require("./routes/courseRoutes");
const userRoutes     = require("./routes/userRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const chatRoutes     = require("./routes/chatRoutes");

// DB
connectDB();

// APP  
const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api",         authRoutes);    // POST /api/signup, /api/login
app.use("/api",         enrollRoutes);  // POST /api/enroll
app.use("/api/courses", courseRoutes);  // GET  /api/courses, /api/courses/:id
app.use("/api/user",    userRoutes);    // GET|PUT /api/user/:username, POST /api/user/:username/progress
app.use("/api/admin",   adminRoutes);   // /api/admin/*
app.use("/api/chat",    chatRoutes);    // POST /api/chat

app.listen(5000, () =>
  console.log("Server running  http://localhost:5000")
);
