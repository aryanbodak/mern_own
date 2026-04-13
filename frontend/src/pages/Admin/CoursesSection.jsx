export default function CoursesSection({
  courses,
  loading,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
}) {
  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-sub">{courses.length} courses available</p>
        </div>
        <div className="page-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="add-btn" onClick={onAdd}>
            + Add Course
          </button>
        </div>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <div className="mini-stat-num">{courses.length}</div>
          <div className="mini-stat-label">Total Courses</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-num">
            {[...new Set(courses.map((c) => c.tag))].length}
          </div>
          <div className="mini-stat-label">Categories</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-num">
            {courses.reduce((sum, c) => sum + (Number(c.lessons) || 0), 0)}
          </div>
          <div className="mini-stat-label">Total Lessons</div>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading courses...</p>
      ) : filtered.length === 0 ? (
        <p className="empty-text">No courses found.</p>
      ) : (
        <div className="admin-course-grid">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="admin-course-card"
              style={{ "--c": c.color || "var(--accent)" }}
            >
              <span className="acc-tag">{c.tag}</span>
              <div className="acc-title">{c.title}</div>
              {c.description && (
                <div className="acc-desc">
                  {c.description.length > 80
                    ? c.description.slice(0, 80) + "…"
                    : c.description}
                </div>
              )}
              <div className="acc-meta">
                📚 {c.lessons || 0} lessons &nbsp;·&nbsp; ⏱ {c.duration || "N/A"}
              </div>
              <div className="acc-actions">
                <button className="acc-edit" onClick={() => onEdit(c)}>
                  ✏️ Edit
                </button>
                <button className="acc-del" onClick={() => onDelete(c._id)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
