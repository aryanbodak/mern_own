import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const tabs = ["All", "Dev", "Design", "Data", "AI", "Cloud", "Business", "Other"];

function Home() {
  const [activeTab, setActiveTab] = useState("All");
  const [view, setView] = useState("explore"); // "explore" | "progress"
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }
    fetchData();
  }, [username, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, userRes] = await Promise.all([
        fetch("http://localhost:5000/api/courses"),
        fetch(`http://localhost:5000/api/user/${username}`)
      ]);
      const coursesData = await coursesRes.json();
      const userData = await userRes.json();
      
      setAllCourses(Array.isArray(coursesData) ? coursesData : []);
      setEnrolledCourses(userData.enrolledCourses || []);
      setUserProgress(userData.progress || {});
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch("http://localhost:5000/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, courseId })
      });
      const data = await res.json();
      if (data.message === "Enrolled successfully" || data.message === "Already enrolled") {
        fetchData(); // refresh data
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const enrolledCourseIds = new Set(enrolledCourses.map(c => c._id));

  const filteredExplore = activeTab === "All" 
    ? allCourses 
    : allCourses.filter((c) => c.tag === activeTab);

  return (
    <div className="home-root">
      {/* NAV */}
      <nav className="nav">
        <div className="brand">
          <div className="brand-dot" />
          <span className="brand-name">CourseDB</span>
        </div>
        <div className="nav-right">
          <button className={`nav-link ${view === 'explore' ? 'active' : ''}`} onClick={() => setView('explore')}>Explore</button>
          <button className={`nav-link ${view === 'progress' ? 'active' : ''}`} onClick={() => setView('progress')}>My Learning</button>
          <button className="nav-cta" onClick={() => {
            sessionStorage.clear();
            navigate("/");
          }}>Sign Out</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow">
          <div className="hero-eyebrow-dot" />
          Welcome back, {username}
        </div>
        <h1 className="hero-title">
          Learn skills that<br />
          <span>matter most.</span>
        </h1>
        <p className="hero-sub">
          Expertly crafted courses to help you grow faster. Join thousands of learners already leveling up.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setView('explore')}>Browse Courses →</button>
          <button className="btn-ghost" onClick={() => setView('progress')}>View My Progress</button>
        </div>
      </section>

      {/* DYNAMIC SECTION (Explore vs Progress) */}
      <section className="courses-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">{view === 'explore' ? 'Explore Courses' : 'My Progress'}</h2>
            <p className="section-sub">
              {view === 'explore' ? 'Hand-picked by our expert team' : 'Track your continuing journey'}
            </p>
          </div>
          {view === 'explore' && (
            <div className="tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: 48 }}>Loading...</p>
        ) : view === 'explore' ? (
          <div className="course-grid">
            {filteredExplore.length === 0 ? (
              <p style={{ color: "#94a3b8", padding: 24 }}>No courses available in this category.</p>
            ) : (
              filteredExplore.map((course) => (
                <div
                  className="course-card"
                  key={course._id}
                  style={{ "--accent": course.color || "#6366f1" }}
                >
                  <div className="card-tag">{course.tag}</div>
                  <h3 className="card-title">{course.title}</h3>
                  <div className="card-meta">
                    <div className="card-meta-item">📚 {course.lessons} lessons</div>
                    <div className="card-meta-item">⏱ {course.duration || "N/A"}</div>
                  </div>
                  <div className="card-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                    {enrolledCourseIds.has(course._id) ? (
                       <span className="card-enroll" style={{ color: "#10b981", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); navigate(`/course/${course._id}`); }}>Continue Learning →</span>
                    ) : (
                      <span className="card-enroll" style={{cursor: "pointer"}} onClick={(e) => { e.stopPropagation(); navigate(`/course/${course._id}`); }}>View Details →</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="course-grid">
            {enrolledCourses.length === 0 ? (
              <p style={{ color: "#94a3b8", padding: 24 }}>You are not enrolled in any courses yet.</p>
            ) : (
              enrolledCourses.map((course) => {
                let totalSubs = 0;
                course.topics?.forEach(t => { totalSubs += t.subTopics?.length || 0; });
                const completedCount = userProgress[course._id]?.length || 0;
                const prog = totalSubs === 0 ? 0 : Math.floor((completedCount / totalSubs) * 100);

                return (
                  <div
                    className="course-card"
                    key={course._id}
                    style={{ "--accent": course.color || "#6366f1" }}
                  >
                    <div className="card-tag">{course.tag}</div>
                    <h3 className="card-title">{course.title}</h3>
                    <div className="card-meta">
                      <div className="card-meta-item">📚 {course.lessons} lessons</div>
                      <div className="card-meta-item">⏱ {course.duration || "N/A"}</div>
                    </div>
                    
                    {/* Progress Bar UI */}
                    <div style={{ marginTop: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "#94a3b8" }}>
                        <span>Course Progress</span>
                        <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{Math.min(prog, 100)}%</span>
                      </div>
                      <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(prog, 100)}%`, height: "100%", background: course.color || "#6366f1", borderRadius: 4 }} />
                      </div>
                    </div>

                    <div className="card-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginTop: 16 }}>
                      <span className="card-enroll" style={{ color: "var(--accent)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); navigate(`/course/${course._id}`); }}>Continue Learning →</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
