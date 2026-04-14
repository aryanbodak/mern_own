import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const INTEREST_OPTIONS = [
  "Web Dev", "AI / ML", "Data Science", "Cloud", "DevOps",
  "Cybersecurity", "Mobile Dev", "UI/UX Design", "Blockchain", "Game Dev",
];
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni", "Other"];

export default function Profile() {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  const [userData,  setUserData]  = useState(null);
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  // Edit modal state
  const [editOpen,  setEditOpen]  = useState(false);
  const [college,   setCollege]   = useState("");
  const [branch,    setBranch]    = useState("");
  const [year,      setYear]      = useState("");
  const [bio,       setBio]       = useState("");
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    if (!username) { navigate("/"); return; }
    Promise.all([
      fetch(`http://localhost:5000/api/user/${username}`).then(r => r.json()),
      fetch("http://localhost:5000/api/courses").then(r => r.json()),
    ])
      .then(([user, allCourses]) => {
        setUserData(user);
        setCourses(Array.isArray(allCourses) ? allCourses : []);
        setCollege(user.college || "");
        setBranch(user.branch || "");
        setYear(user.year || "");
        setBio(user.bio || "");
        setInterests(user.interests || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  const openEdit = () => {
    // Re-sync fields from current userData before opening
    setCollege(userData.college || "");
    setBranch(userData.branch || "");
    setYear(userData.year || "");
    setBio(userData.bio || "");
    setInterests(userData.interests || []);
    setSaved(false);
    setEditOpen(true);
  };

  const toggleInterest = (item) =>
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/user/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ college, branch, year, bio, interests }),
      });
      const data = await res.json();
      if (data.message === "Profile updated") {
        setUserData(data.user);
        setSaved(true);
        setTimeout(() => { setSaved(false); setEditOpen(false); }, 1200);
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (loading) return <div className="player-loading">Loading profile...</div>;
  if (!userData) return <div className="player-error">Could not load profile.</div>;

  const enrolled = userData.enrolledCourses || [];
  const progress = userData.progress || {};

  const courseRows = enrolled.map(ec => {
    const id     = typeof ec === "object" ? ec._id   : ec;
    const found  = courses.find(c => c._id === id);
    const title  = (typeof ec === "object" ? ec.title : found?.title) || id;
    const tag    = (typeof ec === "object" ? ec.tag   : found?.tag)   || "";
    const color  = (typeof ec === "object" ? ec.color : found?.color) || "#c9a84c";
    const topics = (typeof ec === "object" ? ec.topics : found?.topics) || [];
    let totalSubs = 0;
    topics.forEach(t => { totalSubs += t.subTopics?.length || 0; });
    const done = progress[id]?.length || 0;
    const pct  = totalSubs === 0 ? 0 : Math.min(Math.floor((done / totalSubs) * 100), 100);
    return { id, title, tag, color, pct, done, totalSubs };
  });

  const totalCompleted = courseRows.filter(c => c.pct === 100).length;
  const totalSubsDone  = courseRows.reduce((s, c) => s + c.done, 0);
  const avgProgress    = courseRows.length
    ? Math.floor(courseRows.reduce((s, c) => s + c.pct, 0) / courseRows.length) : 0;

  return (
    <div className="profile-root">

      {/* NAV */}
      <nav className="nav">
        <button className="brand" onClick={() => navigate("/home")}>
          <div className="brand-dot" />
          <span className="brand-name">CourseDB</span>
        </button>
        <div className="nav-right">
          <button className="nav-link" onClick={() => navigate("/home")}>Explore</button>
          <button className="nav-link" onClick={() => navigate("/home?view=progress")}>My Learning</button>
          <button className="nav-link active">Profile</button>
          <ThemeToggle />
          <button className="nav-cta" onClick={() => { sessionStorage.clear(); navigate("/"); }}>Sign Out</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="profile-hero">
        <div className="profile-avatar">{username[0].toUpperCase()}</div>
        <div className="profile-hero-info">
          <div className="profile-name">{username}</div>
          {userData.email && <div className="profile-email">📧 {userData.email}</div>}
          <div className="profile-joined">
            {userData.college
              ? `🏛 ${userData.college}${userData.branch ? ` · ${userData.branch}` : ""}${userData.year ? ` · ${userData.year}` : ""}`
              : `🗓 Member since ${new Date(userData.createdAt || Date.now()).toLocaleDateString()}`}
          </div>
          {userData.bio && <div className="profile-bio">"{userData.bio}"</div>}
          {userData.interests?.length > 0 && (
            <div className="profile-interests-display">
              {userData.interests.map(i => <span key={i} className="interest-chip selected">{i}</span>)}
            </div>
          )}
        </div>
        <button className="profile-edit-btn" onClick={openEdit}>✏️ Edit Profile</button>
      </div>

      <div className="profile-body">

        {/* STATS */}
        <div className="profile-stats">
          {[
            { num: enrolled.length,  label: "Enrolled" },
            { num: totalCompleted,   label: "Completed" },
            { num: totalSubsDone,    label: "Lessons Done" },
            { num: `${avgProgress}%`, label: "Avg Progress" },
          ].map(({ num, label }) => (
            <div className="profile-stat" key={label}>
              <div className="profile-stat-num">{num}</div>
              <div className="profile-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* ENROLLED COURSES */}
        <div>
          <div className="profile-section-title">📚 My Courses</div>
          {courseRows.length === 0
            ? <p className="profile-empty">No courses enrolled yet.</p>
            : (
              <div className="profile-course-list">
                {courseRows.map(c => (
                  <div className="profile-course-row" key={c.id} onClick={() => navigate(`/course/${c.id}`)}>
                    <div className="profile-course-dot" style={{ background: c.color }} />
                    <div className="profile-course-title">{c.title}</div>
                    <div className="profile-course-tag">{c.tag}</div>
                    <div className="profile-bar-track">
                      <div className="profile-bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                    <div className="profile-course-pct">{c.pct}%</div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="profile-modal-overlay" onClick={e => e.target === e.currentTarget && setEditOpen(false)}>
          <div className="profile-modal">
            <div className="profile-modal-header">
              <span className="profile-modal-title">Edit Profile</span>
              <button className="profile-modal-close" onClick={() => setEditOpen(false)}>✕</button>
            </div>

            <div className="profile-edit-grid">
              <div>
                <label className="profile-field-label">College</label>
                <input className="profile-field-input" placeholder="Your college" value={college} onChange={e => setCollege(e.target.value)} />
              </div>
              <div>
                <label className="profile-field-label">Branch</label>
                <input className="profile-field-input" placeholder="Your branch" value={branch} onChange={e => setBranch(e.target.value)} />
              </div>
              <div>
                <label className="profile-field-label">Year</label>
                <select className="profile-field-input" value={year} onChange={e => setYear(e.target.value)}>
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="profile-field-label">Bio</label>
                <input className="profile-field-input" placeholder="A short bio..." value={bio} onChange={e => setBio(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="profile-field-label" style={{ display: "block", marginBottom: "10px" }}>Interests</label>
              <div className="profile-interests-wrap">
                {INTEREST_OPTIONS.map(item => (
                  <button key={item}
                    className={`interest-chip ${interests.includes(item) ? "selected" : ""}`}
                    onClick={() => toggleInterest(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-modal-footer">
              {saved && <span className="profile-saved-msg">✓ Saved!</span>}
              <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
