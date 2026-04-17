const User = require("../models/User");

// POST /api/enroll
const enrollCourse = async (req, res) => {
  const { username, courseId } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.enrolledCourses.includes(courseId))
    return res.json({ message: "Already enrolled" });

  user.enrolledCourses.push(courseId);
  await user.save();

  res.json({ message: "Enrolled successfully" });
};

// GET /api/user/:username
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("enrolledCourses");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/user/:username
const updateProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const { college, branch, year, bio, interests } = req.body;

    const user = await User.findOneAndUpdate(
      { username },
      {
        $set: {
          college:   college   || "",
          branch:    branch    || "",
          year:      year      || "",
          bio:       bio       || "",
          interests: interests || [],
        },
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/user/:username/progress
const updateProgress = async (req, res) => {
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
};

module.exports = { enrollCourse, getProfile, updateProfile, updateProgress };
