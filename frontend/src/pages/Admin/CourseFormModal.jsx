const TAG_OPTIONS = ["Dev", "Design", "Data", "AI", "Cloud", "Business", "Other"];
const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
];

export default function CourseFormModal({ form, setForm, onClose, onSave, editId }) {
  const updateTopic = (tIdx, field, value) => {
    const topics = [...form.topics];
    topics[tIdx] = { ...topics[tIdx], [field]: value };
    setForm({ ...form, topics });
  };

  const updateSubTopic = (tIdx, sIdx, field, value) => {
    const topics = [...form.topics];
    const subs = [...(topics[tIdx].subTopics || [])];
    subs[sIdx] = { ...subs[sIdx], [field]: value };
    topics[tIdx] = { ...topics[tIdx], subTopics: subs };
    setForm({ ...form, topics });
  };

  const addTopic = () => {
    setForm({
      ...form,
      topics: [...form.topics, { topicName: "", subTopics: [{ subTopicName: "", data: "" }] }],
    });
  };

  const deleteTopic = (tIdx) => {
    setForm({ ...form, topics: form.topics.filter((_, i) => i !== tIdx) });
  };

  const addSubTopic = (tIdx) => {
    const topics = [...form.topics];
    topics[tIdx].subTopics = [...(topics[tIdx].subTopics || []), { subTopicName: "", data: "" }];
    setForm({ ...form, topics });
  };

  const deleteSubTopic = (tIdx, sIdx) => {
    const topics = [...form.topics];
    topics[tIdx].subTopics = topics[tIdx].subTopics.filter((_, i) => i !== sIdx);
    setForm({ ...form, topics });
  };

  return (
    <div className="form-overlay">
      <div className="form-panel">
        {/* Header */}
        <div className="form-panel-header">
          <span className="form-panel-title">
            {editId ? "Edit Course" : "Add Course"}
          </span>
          <button className="form-close" onClick={onClose}>✕</button>
        </div>

        {/* Title */}
        <div className="form-row">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            placeholder="Course title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Tag */}
        <div className="form-row">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
          >
            {TAG_OPTIONS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="form-row">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Short description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Duration + Lessons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div className="form-row" style={{ flex: 1 }}>
            <label className="form-label">Duration</label>
            <input
              className="form-input"
              placeholder="e.g. 4h 30m"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>
          <div className="form-row" style={{ flex: 1 }}>
            <label className="form-label">Lessons</label>
            <input
              className="form-input"
              type="number"
              placeholder="0"
              value={form.lessons}
              onChange={(e) => setForm({ ...form, lessons: e.target.value })}
            />
          </div>
        </div>

        {/* Color */}
        <div className="form-row">
          <label className="form-label">Accent Color</label>
          <div className="color-row">
            {COLOR_OPTIONS.map((c) => (
              <div
                key={c}
                className={`color-swatch ${form.color === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => setForm({ ...form, color: c })}
              />
            ))}
          </div>
        </div>

        {/* Syllabus Builder */}
        <div className="syllabus-builder">
          <div className="syllabus-title">📋 Syllabus</div>

          {form.topics.map((topic, tIdx) => (
            <div key={tIdx} className="topic-card">
              <div className="topic-header">
                <input
                  className="form-input"
                  placeholder={`Topic ${tIdx + 1} name`}
                  value={topic.topicName}
                  onChange={(e) => updateTopic(tIdx, "topicName", e.target.value)}
                />
                <button
                  className="btn-del"
                  onClick={() => deleteTopic(tIdx)}
                  title="Delete topic"
                >
                  ✕
                </button>
              </div>

              {topic.subTopics?.map((sub, sIdx) => (
                <div key={sIdx} className="subtopic-card">
                  <div className="subtopic-header">
                    <input
                      className="form-input subtopic-input"
                      placeholder={`Subtopic ${sIdx + 1} name`}
                      value={sub.subTopicName}
                      onChange={(e) =>
                        updateSubTopic(tIdx, sIdx, "subTopicName", e.target.value)
                      }
                    />
                    <button
                      className="btn-del btn-del-sm"
                      onClick={() => deleteSubTopic(tIdx, sIdx)}
                      title="Delete subtopic"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    className="form-textarea subtopic-textarea"
                    placeholder="Content / notes for this subtopic..."
                    value={sub.data}
                    onChange={(e) => updateSubTopic(tIdx, sIdx, "data", e.target.value)}
                  />
                </div>
              ))}

              <button className="btn-outline" onClick={() => addSubTopic(tIdx)}>
                + Add Subtopic
              </button>
            </div>
          ))}

          <button className="btn-outline btn-outline-full" onClick={addTopic}>
            + Add Topic
          </button>
        </div>

        {/* Submit */}
        <button className="form-submit" onClick={onSave}>
          {editId ? "Update Course" : "Create Course"}
        </button>
      </div>
    </div>
  );
}
