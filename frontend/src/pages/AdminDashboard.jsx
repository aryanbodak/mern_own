import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TAG_OPTIONS  = ["Dev", "Design", "Data", "AI", "Cloud", "Business", "Other"];
const COLOR_OPTIONS = [
  { label: "Indigo",  value: "#6366f1" },
  { label: "Pink",    value: "#ec4899" },
  { label: "Cyan",    value: "#06b6d4" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Purple",  value: "#8b5cf6" },
  { label: "Green",   value: "#10b981" },
  { label: "Rose",    value: "#f43f5e" },
];

const EMPTY_FORM = { title: "", tag: "Dev", description: "", duration: "", lessons: "", color: "#6366f1", topics: [{ topicName: "", subTopics: [{ subTopicName: "", data: "" }] }] };

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const adminUser = sessionStorage.getItem("adminUser");
  const adminPass = sessionStorage.getItem("adminPass");

  const [tab,         setTab]         = useState("users");   // "users" | "courses"
  const [users,       setUsers]       = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editId,      setEditId]      = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [toast,       setToast]       = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    if (!adminUser || !adminPass) navigate("/");
  }, []);

  const adminHeaders = {
    "Content-Type":  "application/json",
    "x-admin-user":  adminUser,
    "x-admin-pass":  adminPass,
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const res  = await fetch("http://localhost:5000/api/admin/users", { headers: adminHeaders });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    const res  = await fetch("http://localhost:5000/api/courses");
    const data = await res.json();
    setCourses(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); fetchCourses(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.tag) return showToast("Title and tag are required", "error");

    const url    = editId ? `http://localhost:5000/api/admin/courses/${editId}` : "http://localhost:5000/api/admin/courses";
    const method = editId ? "PUT" : "POST";

    const res  = await fetch(url, { 
      method, 
      headers: adminHeaders, 
      body: JSON.stringify({ ...form, lessons: Number(form.lessons) }) 
    });
    const data = await res.json();

    if (data.course) {
      showToast(editId ? "Course updated!" : "Course added!");
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchCourses();
    } else {
      showToast(data.message || "Something went wrong", "error");
    }
  };

  const handleEdit = (course) => {
    setForm({ 
      title: course.title, 
      tag: course.tag, 
      description: course.description, 
      duration: course.duration, 
      lessons: course.lessons, 
      color: course.color,
      topics: course.topics || [] 
    });
    setEditId(course._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await fetch(`http://localhost:5000/api/admin/courses/${deleteModal}`, { method: "DELETE", headers: adminHeaders });
    showToast("Course deleted");
    setDeleteModal(null);
    fetchCourses();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  // Syllabus Builders
  const handleAddTopic = () => {
    setForm({ ...form, topics: [...form.topics, { topicName: "", subTopics: [{ subTopicName: "", data: "" }] }] });
  };
  const handleRemoveTopic = (tIndex) => {
    const newTopics = form.topics.filter((_, i) => i !== tIndex);
    setForm({ ...form, topics: newTopics });
  };
  const handleTopicNameChange = (tIndex, name) => {
    const newTopics = [...form.topics];
    newTopics[tIndex].topicName = name;
    setForm({ ...form, topics: newTopics });
  };
  const handleAddSubTopic = (tIndex) => {
    const newTopics = [...form.topics];
    newTopics[tIndex].subTopics.push({ subTopicName: "", data: "" });
    setForm({ ...form, topics: newTopics });
  };
  const handleRemoveSubTopic = (tIndex, sIndex) => {
    const newTopics = [...form.topics];
    newTopics[tIndex].subTopics = newTopics[tIndex].subTopics.filter((_, i) => i !== sIndex);
    setForm({ ...form, topics: newTopics });
  };
  const handleSubTopicChange = (tIndex, sIndex, field, value) => {
    const newTopics = [...form.topics];
    newTopics[tIndex].subTopics[sIndex][field] = value;
    setForm({ ...form, topics: newTopics });
  };

  const filteredUsers   = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.tag.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{`
        /* ── Toast ── */
        .toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 999;
          background: #1e1e2e; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 14px 22px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 10px;
          animation: slideUp 0.3s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .toast.success { border-left: 3px solid #10b981; color: #d1fae5; }
        .toast.error   { border-left: 3px solid #f43f5e; color: #ffe4e6; }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center; z-index: 200;
          backdrop-filter: blur(4px);
        }
        .modal {
          background: #13131f; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 36px; width: 460px; max-width: 95vw;
        }
        .modal h3 { font-family:'Playfair Display',serif; font-size:22px; color:#f1f5f9; margin-bottom:10px; }
        .modal p  { font-size:14px; color:#64748b; margin-bottom:28px; line-height:1.6; }
        .modal-btns { display:flex; gap:12px; justify-content:flex-end; }
        .modal-cancel {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color:#94a3b8; border-radius:10px; padding:10px 22px;
          font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all 0.2s;
        }
        .modal-cancel:hover { background:rgba(255,255,255,0.08); }
        .modal-delete {
          background: linear-gradient(135deg,#f43f5e,#e11d48); border:none;
          color:#fff; border-radius:10px; padding:10px 22px;
          font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all 0.2s;
        }
        .modal-delete:hover { opacity:0.9; transform:translateY(-1px); }

        /* ── Admin Layout ── */
        .admin-root { min-height:100vh; background:#0a0a0f; font-family:'DM Sans',sans-serif; color:#f1f5f9; }

        .admin-layout { display:flex; min-height:100vh; }
        .sidebar {
          width: 240px; background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction:column; padding: 28px 20px;
          position: sticky; top:0; height:100vh;
        }
        .sidebar .brand { margin-bottom:8px; }
        .sidebar-role {
          font-size:11px; color:#334155; text-transform:uppercase;
          letter-spacing:1.5px; margin-bottom:40px;
        }
        .sidebar-nav { display:flex; flex-direction:column; gap:6px; flex:1; }
        .sidebar-btn {
          display:flex; align-items:center; gap:12px;
          background:none; border:none; color:#475569;
          font-family:'DM Sans',sans-serif; font-size:14px;
          padding:11px 14px; border-radius:10px; cursor:pointer;
          transition:all 0.2s; text-align:left;
        }
        .sidebar-btn:hover { background:rgba(255,255,255,0.04); color:#94a3b8; }
        .sidebar-btn.active { background:rgba(129,140,248,0.12); color:#818cf8; font-weight:500; }
        .sidebar-logout {
          display:flex; align-items:center; gap:12px;
          background:none; border:1px solid rgba(255,255,255,0.06);
          color:#475569; padding:11px 14px; border-radius:10px; cursor:pointer; width:100%; text-align:left;
        }
        .sidebar-logout:hover { border-color:rgba(244,63,94,0.4); color:#f43f5e; }

        .admin-main { flex:1; padding:40px 48px; overflow-y:auto; }

        .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; flex-wrap:wrap; gap:16px; }
        .page-title  { font-family:'Playfair Display',serif; font-size:32px; font-weight:700; color:#f8fafc; margin-bottom:4px; }
        .page-sub    { font-size:14px; color:#475569; font-weight:300; }

        .search-wrap { position:relative; }
        .search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; color:#334155; pointer-events:none; }
        .search-input {
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:10px 14px 10px 38px;
          font-size:14px; color:#f1f5f9; outline:none; width:240px; transition:all 0.3s;
        }
        .search-input:focus { border-color:#818cf8; background:rgba(129,140,248,0.06); width:280px; }

        .add-btn {
          display:flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none;
          color:#fff; border-radius:10px; padding:10px 20px; font-weight:500; cursor:pointer;
        }

        .mini-stats { display:flex; gap:16px; margin-bottom:32px; flex-wrap:wrap; }
        .mini-stat {
          flex:1; min-width:140px; background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:20px 24px;
        }
        .mini-stat-num  { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; background:linear-gradient(135deg,#818cf8,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .mini-stat-label{ font-size:12px; color:#475569; text-transform:uppercase; letter-spacing:1px; margin-top:4px; }

        .table-wrap { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; }
        .admin-table { width:100%; border-collapse:collapse; }
        .admin-table th { padding:14px 20px; text-align:left; font-size:11px; color:#475569; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.01); }
        .admin-table td { padding:16px 20px; font-size:14px; color:#94a3b8; border-bottom:1px solid rgba(255,255,255,0.04); }
        .admin-table tr:hover td { background:rgba(255,255,255,0.02); }

        .user-cell { display:flex; align-items:center; gap:12px; }
        .user-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:600; }
        .enroll-chips { display:flex; flex-wrap:wrap; gap:6px; }
        .enroll-chip { font-size:11px; padding:3px 10px; border-radius:99px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); }

        .admin-course-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
        .admin-course-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:24px; position:relative; overflow:hidden; transition:all 0.3s; }
        .admin-course-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--c); opacity:0.8; }
        .admin-course-card:hover { border-color:rgba(255,255,255,0.1); transform:translateY(-2px); }
        .acc-tag { font-size:11px; color:var(--c); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:99px; padding:3px 10px; margin-bottom:12px; display:inline-block; }
        .acc-title   { font-family:'Playfair Display',serif; font-size:18px; color:#f1f5f9; margin-bottom:8px; }
        .acc-desc    { font-size:13px; color:#475569; line-height:1.5; margin-bottom:16px; min-height:38px; }
        .acc-meta    { display:flex; gap:14px; font-size:12px; color:#334155; margin-bottom:18px; }
        .acc-actions { display:flex; gap:8px; }
        .acc-edit { flex:1; background:rgba(129,140,248,0.1); border:1px solid rgba(129,140,248,0.2); color:#818cf8; border-radius:8px; padding:8px; cursor:pointer; }
        .acc-del { background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.2); color:#f43f5e; border-radius:8px; padding:8px 14px; cursor:pointer; }

        /* Slide-in form panel */
        .form-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.6);
          display:flex; align-items:center; justify-content:flex-end; z-index:150;
          backdrop-filter:blur(4px);
        }
        .form-panel {
          width: 540px; max-width:100vw; height:100vh; background:#13131f;
          border-left:1px solid rgba(255,255,255,0.08); padding:40px 36px;
          overflow-y:auto; animation:slideIn 0.3s ease;
        }
        @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
        .form-panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
        .form-panel-title  { font-family:'Playfair Display',serif; font-size:24px; color:#f8fafc; }
        .form-close { background:rgba(255,255,255,0.05); color:#64748b; width:32px; height:32px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; border:none; }
        .form-row   { margin-bottom:20px; }
        .form-label { display:block; font-size:11px; font-weight:500; color:#94a3b8; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; }
        .form-input, .form-select, .form-textarea {
          width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:12px 16px; font-size:14px; color:#f1f5f9; outline:none; transition:all 0.3s;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color:#818cf8; background:rgba(129,140,248,0.06); }
        .form-textarea { resize:vertical; min-height:90px; }
        .color-row { display:flex; gap:10px; flex-wrap:wrap; }
        .color-swatch { width:30px; height:30px; border-radius:50%; cursor:pointer; border:2px solid transparent; }
        .color-swatch.selected { border-color:#fff; transform:scale(1.15); box-shadow:0 0 10px rgba(255,255,255,0.3); }
        
        .form-submit {
          width:100%; padding:14px; background:linear-gradient(135deg,#6366f1,#8b5cf6);
          border:none; border-radius:10px; color:#fff; font-size:15px; font-weight:500; cursor:pointer; margin-top:20px; margin-bottom: 40px;
        }

        /* Syllabus styling */
        .syllabus-builder {
          margin-top: 30px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 20px;
        }
        .topic-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 16px; margin-bottom: 16px;
        }
        .topic-header {
          display: flex; gap: 10px; align-items: center; margin-bottom: 16px;
        }
        .subtopic-card {
          background: rgba(0,0,0,0.2); border-left: 3px solid #8b5cf6; padding: 12px;
          border-radius: 0 8px 8px 0; margin-bottom: 12px; margin-left: 10px;
        }
        .subtopic-header {
          display: flex; gap: 10px; align-items: center; margin-bottom: 8px;
        }
        .btn-outline {
          background: transparent; border: 1px dashed rgba(255,255,255,0.2); color: #94a3b8;
          padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 13px;
        }
        .btn-outline:hover { color: #818cf8; border-color: #818cf8; }
        .btn-del {
          background: rgba(244,63,94,0.1); color: #f43f5e; border: none; padding: 10px; border-radius: 8px; cursor: pointer;
        }

        @media (max-width:768px) {
          .sidebar { display:none; }
          .admin-main { padding: 20px; }
        }
      `}</style>

      <div className="admin-root">
        <div className="admin-layout">

          <aside className="sidebar">
            <div className="brand">
              <span className="brand-dot" /> <span className="brand-name">CourseDB</span>
            </div>
            <p className="sidebar-role">Admin Panel</p>
            <nav className="sidebar-nav">
              <button className={`sidebar-btn ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>👥 Users</button>
              <button className={`sidebar-btn ${tab === "courses" ? "active" : ""}`} onClick={() => setTab("courses")}>📚 Courses</button>
            </nav>
            <button className="sidebar-logout" onClick={handleLogout}>🚪 Sign Out</button>
          </aside>

          <main className="admin-main">
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

                <div className="table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>User</th><th>Enrolled Courses</th><th>Count</th></tr></thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{u.username[0]}</div>
                              <div>
                                <div style={{color:"#e2e8f0"}}>{u.username}</div>
                                <div style={{fontSize:12, color:"#475569"}}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="enroll-chips">
                              {u.enrolledCourses.map(c => (
                                <span key={c._id} className="enroll-chip" style={{color: c.color}}>{c.title}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{color:"#f1f5f9"}}>{u.enrolledCourses.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "courses" && (
              <>
                <div className="page-header">
                  <div>
                    <h1 className="page-title">Courses</h1>
                    <p className="page-sub">Add, edit, or remove courses from the platform</p>
                  </div>
                  <div style={{ display:"flex", gap:12 }}>
                    <div className="search-wrap">
                      <span className="search-icon">🔍</span>
                      <input className="search-input" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="add-btn" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}>+ Add Course</button>
                  </div>
                </div>

                <div className="admin-course-grid">
                  {filteredCourses.map(c => (
                    <div className="admin-course-card" key={c._id} style={{ "--c": c.color }}>
                      <span className="acc-tag">{c.tag}</span>
                      <h3 className="acc-title">{c.title}</h3>
                      <p className="acc-desc">{c.description}</p>
                      <div className="acc-meta">
                        <span>📚 {c.lessons} modules</span>
                      </div>
                      <div className="acc-actions">
                        <button className="acc-edit" onClick={() => handleEdit(c)}>✏️ Edit</button>
                        <button className="acc-del"  onClick={() => setDeleteModal(c._id)}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {showForm && (
        <div className="form-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="form-panel">
            <div className="form-panel-header">
              <h2 className="form-panel-title">{editId ? "Edit Course" : "New Course"}</h2>
              <button className="form-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="form-row"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="form-row">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}>
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-row"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            
            <div className="form-row">
              <label className="form-label">Accent Color</label>
              <div className="color-row">
                {COLOR_OPTIONS.map(c => (
                  <div key={c.value} className={`color-swatch ${form.color === c.value ? "selected" : ""}`} style={{ background: c.value }} onClick={() => setForm({...form, color: c.value})} />
                ))}
              </div>
            </div>

            <div className="syllabus-builder">
              <h3 style={{marginBottom: 16, color: "#f8fafc", fontFamily: "'Playfair Display', serif"}}>Course Content (Syllabus)</h3>
              
              {form.topics.map((topic, tIndex) => (
                <div key={tIndex} className="topic-card">
                  <div className="topic-header">
                    <input className="form-input" placeholder={`Topic ${tIndex + 1} Name`} value={topic.topicName} onChange={e => handleTopicNameChange(tIndex, e.target.value)} style={{flex: 1}}/>
                    <button className="btn-del" onClick={() => handleRemoveTopic(tIndex)}>✕</button>
                  </div>
                  
                  {topic.subTopics.map((sub, sIndex) => (
                    <div key={sIndex} className="subtopic-card">
                      <div className="subtopic-header">
                        <input className="form-input" placeholder="Subtopic Title" value={sub.subTopicName} onChange={e => handleSubTopicChange(tIndex, sIndex, "subTopicName", e.target.value)} style={{flex: 1, padding: "8px 12px", fontSize: 13}}/>
                        <button className="btn-del" style={{padding: 8}} onClick={() => handleRemoveSubTopic(tIndex, sIndex)}>✕</button>
                      </div>
                      <textarea className="form-textarea" placeholder="Data / Content for this subtopic..." value={sub.data} onChange={e => handleSubTopicChange(tIndex, sIndex, "data", e.target.value)} style={{minHeight: 60, fontSize: 13, padding: "8px 12px"}}/>
                    </div>
                  ))}
                  
                  <button className="btn-outline" onClick={() => handleAddSubTopic(tIndex)}>+ Add Subtopic</button>
                </div>
              ))}

              <button className="btn-outline" style={{width: "100%", padding: 12}} onClick={handleAddTopic}>+ Add New Topic</button>
            </div>

            <button className="form-submit" onClick={handleSave}>{editId ? "Save Changes →" : "Create Course →"}</button>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Course?</h3>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="modal-delete" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
