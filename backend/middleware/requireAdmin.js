const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  const { "x-admin-user": username, "x-admin-pass": password } = req.headers;

  if (!username || !password)
    return res.status(401).json({ message: "Unauthorized" });

  const admin = await User.findOne({ username, password, role: "admin" });

  if (!admin)
    return res.status(403).json({ message: "Forbidden" });

  next();
};

module.exports = requireAdmin;
