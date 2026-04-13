import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const INTEREST_OPTIONS = [
  "Web Dev", "AI / ML", "Data Science", "Cloud", "DevOps",
  "Cybersecurity", "Mobile Dev", "UI/UX Design", "Blockchain", "Game Dev",
];

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni", "Other"];

export default function Profile() {
  const navigate  = useNavigate();
  const username  = sessionStorage.getItem("username");

  const [userData,  setUserData]  = useState(null);
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  // Editable fields
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

        // ✅ Pre-fill fields safely
        setCollege(user.college || "");
        setBranch(user.branch || "");
        setYear(user.year || "");
        setBio(user.bio || "");
        setInterests(user.interests || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  const toggleInterest = (item) => {
    setInterests(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
    setSaved(false);
  };

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
        setUserData(data.user); // ✅ update UI instantly
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
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
    const color  = (typeof ec === "object" ? ec.color : found?.color) || "#6366f1";
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
    ? Math.floor(courseRows.reduce((s, c) => s + c.pct, 0) / courseRows.length)
    : 0;

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
          <button className="nav-cta" onClick={() => { sessionStorage.clear(); navigate("/"); }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="profile-hero">
        <div className="profile-avatar">{username[0].toUpperCase()}</div>
        <div className="profile-hero-info">
          <div className="profile-name">{username}</div>
          {userData.email && <div className="profile-email">📧 {userData.email}</div>}
          <div className="profile-joined">
            {college ? `🏛 ${college}${branch ? ` · ${branch}` : ""}${year ? ` · ${year}` : ""}`
              : `🗓 Member since ${new Date(userData.createdAt || Date.now()).toLocaleDateString()}`}
          </div>
        </div>
      </div>

      <div className="profile-body">

        {/* STATS */}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-num">{enrolled.length}</div>
            <div className="profile-stat-label">Courses Enrolled</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-num">{totalCompleted}</div>
            <div className="profile-stat-label">Completed</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-num">{totalSubsDone}</div>
            <div className="profile-stat-label">Lessons Done</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-num">{avgProgress}%</div>
            <div className="profile-stat-label">Avg Progress</div>
          </div>
        </div>

        {/* EDIT PROFILE */}
        <div>
          <div className="profile-section-title">✏️ About Me</div>

          <div className="profile-edit-grid">

            <input className="profile-field-input" placeholder="College"
              value={college} onChange={e => setCollege(e.target.value)} />

            <input className="profile-field-input" placeholder="Branch"
              value={branch} onChange={e => setBranch(e.target.value)} />

            <select className="profile-field-select"
              value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Select Year</option>
              {YEAR_OPTIONS.map(y => <option key={y}>{y}</option>)}
            </select>

            <input className="profile-field-input" placeholder="Bio"
              value={bio} onChange={e => setBio(e.target.value)} />

          </div>

          {/* Interests */}
          <div className="profile-interests-wrap">
            {INTEREST_OPTIONS.map(item => (
              <button key={item}
                className={`interest-chip ${interests.includes(item) ? "selected" : ""}`}
                onClick={() => toggleInterest(item)}>
                {item}
              </button>
            ))}
          </div>

          <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {saved && <div className="profile-saved-msg">Saved!</div>}
        </div>

      </div>
    </div>
  );
}