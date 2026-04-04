import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TAG_OPTIONS = ["Dev", "Design", "Data", "AI", "Cloud", "Business", "Other"];
const COLOR_OPTIONS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Pink",   value: "#ec4899" },
  { label: "Cyan",   value: "#06b6d4" },
  { label: "Amber",  value: "#f59e0b" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Green",  value: "#10b981" },
  { label: "Rose",   value: "#f43f5e" },
];

const EMPTY_FORM = {
  title: "", tag: "Dev", description: "", duration: "", lessons: "",
  color: "#6366f1",
  topics: [{ topicName: "", subTopics: [{ subTopicName: "", data: "" }] }]
};

// ✅ Admin credentials hardcoded — share freely
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tab,         setTab]         = useState("users");
  const [users,       setUsers]       = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editId,      setEditId]      = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [toast,       setToast]       = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const adminHeaders = {
    "Content-Type": "application/json",
    "x-admin-user": ADMIN_USER,
    "x-admin-pass": ADMIN_PASS,
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/admin/users", { headers: adminHeaders });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); fetchCourses(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.tag) return showToast("Title and tag are required", "error");
    const url    = editId ? `http://localhost:5000/api/admin/courses/${editId}` : "http://localhost:5000/api/admin/courses";
    const method = editId ? "PUT" : "POST";
    try {
      const res  = await fetch(url, { method, headers: adminHeaders, body: JSON.stringify({ ...form, lessons: Number(form.lessons) }) });
      const data = await res.json();
      if (data.course) {
        showToast(editId ? "Course updated!" : "Course added!");
        setShowForm(false); setEditId(null); setForm(EMPTY_FORM);
        fetchCourses();
      } else {
        showToast(data.message || "Something went wrong", "error");
      }
    } catch (e) { showToast("Network error", "error"); }
  };

  const handleEdit = (course) => {
    setForm({ title: course.title, tag: course.tag, description: course.description, duration: course.duration, lessons: course.lessons, color: course.color, topics: course.topics || [] });
    setEditId(course._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:5000/api/admin/courses/${deleteModal}`, { method: "DELETE", headers: adminHeaders });
      showToast("Course deleted");
      setDeleteModal(null);
      fetchCourses();
    } catch (e) { showToast("Delete failed", "error"); }
  };

  const handleLogout = () => { sessionStorage.clear(); navigate("/"); };

  // Syllabus builders
  const handleAddTopic = () => setForm({ ...form, topics: [...form.topics, { topicName: "", subTopics: [{ subTopicName: "", data: "" }] }] });
  const handleRemoveTopic = (tIdx) => setForm({ ...form, topics: form.topics.filter((_, i) => i !== tIdx) });
  const handleTopicNameChange = (tIdx, name) => {
    const t = [...form.topics]; t[tIdx].topicName = name; setForm({ ...form, topics: t });
  };
  const handleAddSubTopic = (tIdx) => {
    const t = [...form.topics]; t[tIdx].subTopics.push({ subTopicName: "", data: "" }); setForm({ ...form, topics: t });
  };
  const handleRemoveSubTopic = (tIdx, sIdx) => {
    const t = [...form.topics]; t[tIdx].subTopics = t[tIdx].subTopics.filter((_, i) => i !== sIdx); setForm({ ...form, topics: t });
  };
  const handleSubTopicChange = (tIdx, sIdx, field, value) => {
    const t = [...form.topics]; t[tIdx].subTopics[sIdx][field] = value; setForm({ ...form, topics: t });
  };

  const filteredUsers   = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredCourses = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()) || c.tag?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-root">
      <div className="admin-layout">

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-dot" />
            <span className="brand-name">CourseDB</span>
          </div>
          <p className="sidebar-role">Admin Panel</p>
          <nav className="sidebar-nav">
            <button className={`sidebar-btn ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>👥 Users</button>
            <button className={`sidebar-btn ${tab === "courses" ? "active" : ""}`} onClick={() => setTab("courses")}>📚 Courses</button>
          </nav>
          <button className="sidebar-logout" onClick={handleLogout}>🚪 Sign Out</button>
        </aside>

        {/* Main */}
        <main className="admin-main">

          {/* USERS TAB */}
          {tab === "users" && (
            <>
              <div className="page-header">
                <div>
                  <h1 className="page-title">All Users</h1>
                  <p className="page-sub">Registered learners and their enrolled courses</p>
                </div>
                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input className="search-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>

              <div className="mini-stats">
                <div className="mini-stat">
                  <div className="mini-stat-num">{users.length}</div>
                  <div className="mini-stat-label">Total Users</div>
                </div>
              </div>

              {loading ? (
                <p className="loading-text">Loading...</p>
              ) : (
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>User</th><th>Enrolled Courses</th><th>Count</th></tr></thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{u.username?.[0]?.toUpperCase()}</div>
                              <div>
                                <div className="user-name">{u.username}</div>
                                <div className="user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="enroll-chips">
                              {u.enrolledCourses?.map(c => (
                                <span key={c._id} className="enroll-chip" style={{ color: c.color }}>{c.title}</span>
                              ))}
                            </div>
                          </td>
                          <td className="count-cell">{u.enrolledCourses?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* COURSES TAB */}
          {tab === "courses" && (
            <>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Courses</h1>
                  <p className="page-sub">Add, edit, or remove courses from the platform</p>
                </div>
                <div className="page-actions">
                  <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input className="search-input" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <button className="add-btn" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}>+ Add Course</button>
                </div>
              </div>

              {loading ? (
                <p className="loading-text">Loading...</p>
              ) : (
                <div className="admin-course-grid">
                  {filteredCourses.map(c => (
                    <div className="admin-course-card" key={c._id} style={{ "--c": c.color }}>
                      <span className="acc-tag">{c.tag}</span>
                      <h3 className="acc-title">{c.title}</h3>
                      <p className="acc-desc">{c.description}</p>
                      <div className="acc-meta"><span>📚 {c.lessons} modules</span></div>
                      <div className="acc-actions">
                        <button className="acc-edit" onClick={() => handleEdit(c)}>✏️ Edit</button>
                        <button className="acc-del"  onClick={() => setDeleteModal(c._id)}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Course Form Panel */}
      {showForm && (
        <div className="form-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="form-panel">
            <div className="form-panel-header">
              <h2 className="form-panel-title">{editId ? "Edit Course" : "New Course"}</h2>
              <button className="form-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="form-row">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}>
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">Duration</label>
              <input className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 4 hrs" />
            </div>
            <div className="form-row">
              <label className="form-label">Number of Lessons</label>
              <input className="form-input" type="number" value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">Accent Color</label>
              <div className="color-row">
                {COLOR_OPTIONS.map(c => (
                  <div key={c.value} className={`color-swatch ${form.color === c.value ? "selected" : ""}`} style={{ background: c.value }} onClick={() => setForm({ ...form, color: c.value })} />
                ))}
              </div>
            </div>

            {/* Syllabus Builder */}
            <div className="syllabus-builder">
              <h3 className="syllabus-title">Course Content (Syllabus)</h3>
              {form.topics.map((topic, tIdx) => (
                <div key={tIdx} className="topic-card">
                  <div className="topic-header">
                    <input className="form-input" placeholder={`Topic ${tIdx + 1} Name`} value={topic.topicName} onChange={e => handleTopicNameChange(tIdx, e.target.value)} style={{ flex: 1 }} />
                    <button className="btn-del" onClick={() => handleRemoveTopic(tIdx)}>✕</button>
                  </div>
                  {topic.subTopics.map((sub, sIdx) => (
                    <div key={sIdx} className="subtopic-card">
                      <div className="subtopic-header">
                        <input className="form-input subtopic-input" placeholder="Subtopic Title" value={sub.subTopicName} onChange={e => handleSubTopicChange(tIdx, sIdx, "subTopicName", e.target.value)} style={{ flex: 1 }} />
                        <button className="btn-del btn-del-sm" onClick={() => handleRemoveSubTopic(tIdx, sIdx)}>✕</button>
                      </div>
                      <textarea className="form-textarea subtopic-textarea" placeholder="Content for this subtopic..." value={sub.data} onChange={e => handleSubTopicChange(tIdx, sIdx, "data", e.target.value)} />
                    </div>
                  ))}
                  <button className="btn-outline" onClick={() => handleAddSubTopic(tIdx)}>+ Add Subtopic</button>
                </div>
              ))}
              <button className="btn-outline btn-outline-full" onClick={handleAddTopic}>+ Add New Topic</button>
            </div>

            <button className="form-submit" onClick={handleSave}>{editId ? "Save Changes →" : "Create Course →"}</button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Course?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="modal-delete" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
