import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import Chatbot from "../components/Chatbot";

const tabs = ["All", "Dev", "Design", "Data", "AI", "Cloud", "Business", "Other"];

function Home() {
  const [activeTab,       setActiveTab]       = useState("All");
  const [view,            setView]            = useState("explore");
  const [allCourses,      setAllCourses]      = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userProgress,    setUserProgress]    = useState({});
  const [loading,         setLoading]         = useState(true);

  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    if (!username) { navigate("/"); return; }
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
      const userData    = await userRes.json();
      setAllCourses(Array.isArray(coursesData) ? coursesData : []);
      setEnrolledCourses(userData.enrolledCourses || []);
      setUserProgress(userData.progress || {});
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const enrolledCourseIds = new Set(enrolledCourses.map(c => c._id));
  const filteredExplore   = activeTab === "All" ? allCourses : allCourses.filter(c => c.tag === activeTab);

  return (
    <div className="home-root">
      {/* NAV */}
      <nav className="nav">
        <div className="brand">
          <div className="brand-dot" />
          <span className="brand-name">CourseDB</span>
        </div>
        <div className="nav-right">
          <button className={`nav-link ${view === "explore" ? "active" : ""}`} onClick={() => setView("explore")}>Explore</button>
          <button className={`nav-link ${view === "progress" ? "active" : ""}`} onClick={() => setView("progress")}>My Learning</button>
          <ThemeToggle />
          <button className="nav-cta" onClick={() => { sessionStorage.clear(); navigate("/"); }}>Sign Out</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow">
          <div className="hero-eyebrow-dot" />
          Welcome back, {username}
        </div>
        <h1 className="hero-title">Learn skills that<br /><span>matter most.</span></h1>
        <p className="hero-sub">Expertly crafted courses to help you grow faster. Join thousands of learners already leveling up.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setView("explore")}>Browse Courses →</button>
          <button className="btn-ghost"   onClick={() => setView("progress")}>View My Progress</button>
        </div>
      </section>

      {/* COURSES SECTION */}
      <section className="courses-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">{view === "explore" ? "Explore Courses" : "My Progress"}</h2>
            <p className="section-sub">{view === "explore" ? "Hand-picked by our expert team" : "Track your continuing journey"}</p>
          </div>
          {view === "explore" && (
            <div className="tabs">
              {tabs.map(tab => (
                <button key={tab} className={`tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : view === "explore" ? (
          <div className="course-grid">
            {filteredExplore.length === 0 ? (
              <p className="empty-text">No courses available in this category.</p>
            ) : (
              filteredExplore.map(course => (
                <div className="course-card" key={course._id} style={{ "--accent": course.color || "#6366f1" }}>
                  <div className="card-tag">{course.tag}</div>
                  <h3 className="card-title">{course.title}</h3>
                  <div className="card-meta">
                    <div className="card-meta-item">📚 {course.lessons} lessons</div>
                    <div className="card-meta-item">⏱ {course.duration || "N/A"}</div>
                  </div>
                  <div className="card-footer">
                    {enrolledCourseIds.has(course._id) ? (
                      <span className="card-enroll card-enroll-active" onClick={() => navigate(`/course/${course._id}`)}>Continue Learning →</span>
                    ) : (
                      <span className="card-enroll" onClick={() => navigate(`/course/${course._id}`)}>View Details →</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="course-grid">
            {enrolledCourses.length === 0 ? (
              <p className="empty-text">You are not enrolled in any courses yet.</p>
            ) : (
              enrolledCourses.map(course => {
                let totalSubs = 0;
                course.topics?.forEach(t => { totalSubs += t.subTopics?.length || 0; });
                const completedCount = userProgress[course._id]?.length || 0;
                const prog = totalSubs === 0 ? 0 : Math.min(Math.floor((completedCount / totalSubs) * 100), 100);

                return (
                  <div className="course-card" key={course._id} style={{ "--accent": course.color || "#6366f1" }}>
                    <div className="card-tag">{course.tag}</div>
                    <h3 className="card-title">{course.title}</h3>
                    <div className="card-meta">
                      <div className="card-meta-item">📚 {course.lessons} lessons</div>
                      <div className="card-meta-item">⏱ {course.duration || "N/A"}</div>
                    </div>
                    <div className="progress-wrap">
                      <div className="progress-info">
                        <span>Course Progress</span>
                        <span className="progress-pct">{prog}%</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill-dynamic" style={{ width: `${prog}%`, background: course.color || "#6366f1" }} />
                      </div>
                    </div>
                    <div className="card-footer">
                      <span className="card-enroll" style={{ color: "var(--accent)" }} onClick={() => navigate(`/course/${course._id}`)}>Continue Learning →</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* CHATBOT */}
      <Chatbot courses={allCourses} />
    </div>
  );
}

export default Home;
