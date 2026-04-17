const mongoose = require("mongoose");

const SubTopicSchema = new mongoose.Schema({
  subTopicName: String,
  data:         String,
});

const TopicSchema = new mongoose.Schema({
  topicName: String,
  subTopics: [SubTopicSchema],
});

const CourseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  tag:         { type: String, required: true },
  description: { type: String, default: "" },
  duration:    { type: String, default: "" },
  lessons:     { type: Number, default: 0 },
  color:       { type: String, default: "#6366f1" },
  topics:      [TopicSchema],
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", CourseSchema);
