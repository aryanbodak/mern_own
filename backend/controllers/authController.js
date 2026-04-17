const User = require("../models/User");

// POST /api/signup
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ message: "User already exists" });

  await new User({ username, email, password }).save();
  res.json({ message: "Signup successful" });
};

// POST /api/login
const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ message: "Invalid credentials" });

  res.json({
    message:  "Login successful",
    role:     user.role,
    username: user.username,
  });
};

module.exports = { signup, login };
