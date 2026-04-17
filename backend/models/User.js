const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username:        String,
  email:           String,
  password:        String,
  role:            { type: String, default: "user" },

  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  progress:        { type: Map, of: [String], default: {} },

  // PROFILE FIELDS
  college:   { type: String, default: "" },
  branch:    { type: String, default: "" },
  year:      { type: String, default: "" },
  bio:       { type: String, default: "" },
  interests: { type: [String], default: [] },
});

module.exports = mongoose.model("User", UserSchema);
