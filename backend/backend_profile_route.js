// ─────────────────────────────────────────────────────────────
// PROFILE ROUTES (Add inside server.js or separate route file)
// ─────────────────────────────────────────────────────────────

// GET USER PROFILE (FULL DATA)
app.get("/api/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("enrolledCourses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ send full user object (frontend needs all fields)
    res.json(user);

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE USER PROFILE
app.put("/api/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { college, branch, year, bio, interests } = req.body;

    const user = await User.findOneAndUpdate(
      { username },
      {
        $set: {
          college:   college || "",
          branch:    branch || "",
          year:      year || "",
          bio:       bio || "",
          interests: interests || []
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated",
      user
    });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});