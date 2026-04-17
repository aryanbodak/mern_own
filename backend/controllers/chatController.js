const Course = require("../models/Course");

// POST /api/chat
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.json({ reply: "Please type something." });

    const msg     = message.toLowerCase();
    const courses = await Course.find();
    const courseList = courses.map((c) => `• ${c.title}`).join("\n");

    if (msg.includes("course"))
      return res.json({ reply: `Available courses:\n\n${courseList}` });

    if (msg.includes("enroll"))
      return res.json({ reply: "Go to Explore → select course → click Enroll" });

    return res.json({ reply: "Try asking about available courses or how to enroll!" });
  } catch (err) {
    console.error(err);
    res.json({ reply: "Server error." });
  }
};

module.exports = { chat };
