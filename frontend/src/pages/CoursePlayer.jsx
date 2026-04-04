import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState(0);
  const [activeSub, setActiveSub] = useState(0);
  const [completedSubs, setCompletedSubs] = useState([]);

  useEffect(() => {
    if (!username) { navigate("/"); return; }
    fetchData();
  }, [id, username, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, userRes] = await Promise.all([
        fetch(`http://localhost:5000/api/courses/${id}`),
        fetch(`http://localhost:5000/api/user/${username}`)
      ]);
      const courseData = await courseRes.json();
      const userData = await userRes.json();

      setCourse(courseData);
      const enrolledIds = userData.enrolledCourses?.map(c => typeof c === 'object' ? c._id : c) || [];
      setIsEnrolled(enrolledIds.includes(courseData._id));
      setCompletedSubs(userData.progress?.[courseData._id] || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleEnroll = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, courseId: id })
      });
      const data = await res.json();
      if (data.message === "Enrolled successfully" || data.message === "Already enrolled") {
        fetchData();
      } else {
        alert(data.message);
      }
    } catch(err) {}
  };

  if (loading) return <div style={{ color: "#f1f5f9", padding: 60, textAlign: "center", minHeight: "100vh", background: "#0a0a0f" }}>Loading Class...</div>;
  if (!course) return <div style={{ color: "#f43f5e", padding: 60, textAlign: "center", minHeight: "100vh", background: "#0a0a0f" }}>Course not found</div>;

  const currentTopic = course.topics && course.topics[activeTopic];
  const currentSub = currentTopic && currentTopic.subTopics && currentTopic.subTopics[activeSub];

  useEffect(() => {
    if (isEnrolled && currentSub && currentSub._id) {
       markComplete(currentSub._id);
    }
  }, [isEnrolled, currentSub]);

  const markComplete = async (subid) => {
    if (!subid || completedSubs.includes(subid)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/user/${username}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id, subtopicId: subid })
      });
      const data = await res.json();
      setCompletedSubs(data.progress?.[id] || []);
    } catch(err) {}
  };

  return (
    <div className="player-root" style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f1f5f9", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <header className="player-header" style={{ padding: "20px 40px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/home")} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>← Back</button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24 }}>{course.title}</h1>
        </div>
        {!isEnrolled && (
          <button onClick={handleEnroll} style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Enroll Now
          </button>
        )}
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SIDEBAR (Syllabus) */}
        <aside style={{ width: 320, background: "rgba(255,255,255,0.01)", borderRight: "1px solid rgba(255,255,255,0.05)", padding: 24, overflowY: "auto" }}>
          <h3 style={{ fontSize: 12, textTransform: "uppercase", color: "#64748b", letterSpacing: 1.5, marginBottom: 20 }}>Syllabus</h3>
          {course.topics && course.topics.length === 0 ? (
            <p style={{ fontSize: 13, color: "#475569" }}>No topics added yet.</p>
          ) : (
            course.topics?.map((topic, tIdx) => (
              <div key={tIdx} style={{ marginBottom: 28 }}>
                <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 12, color: tIdx === activeTopic ? "#fff" : "#cbd5e1" }}>
                  {topic.topicName}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {topic.subTopics?.map((sub, sIdx) => {
                    const isActive = tIdx === activeTopic && sIdx === activeSub;
                    const isCompleted = currentSub && sub._id && completedSubs.includes(sub._id);
                    return (
                      <button 
                        key={sIdx} 
                        onClick={() => { setActiveTopic(tIdx); setActiveSub(sIdx); }}
                        style={{
                          textAlign: "left", background: isActive ? "rgba(129,140,248,0.1)" : "transparent",
                          border: "none", padding: "10px 16px", borderRadius: 8,
                          color: isActive ? "#818cf8" : (isCompleted ? "#10b981" : "#94a3b8"), cursor: "pointer",
                          fontSize: 14, display: "flex", alignItems: "center", gap: 10,
                          transition: "0.2s"
                        }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#818cf8" : (isCompleted ? "#10b981" : "transparent"), border: isActive || isCompleted ? "none" : "1px solid rgba(255,255,255,0.2)" }} />
                        {sub.subTopicName}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, padding: 60, overflowY: "auto" }}>
          {course.topics && course.topics.length > 0 && currentSub ? (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              <div style={{ fontSize: 13, color: course.color || "#818cf8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16, fontWeight: 500 }}>
                {currentTopic.topicName}
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, marginBottom: 40, color: "#f8fafc", lineHeight: 1.1 }}>
                {currentSub.subTopicName}
              </h2>

              {!isEnrolled ? (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 48, textAlign: "center", marginTop: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
                  <h3 style={{ fontSize: 20, marginBottom: 12, color: "#f1f5f9" }}>Content is locked</h3>
                  <p style={{ color: "#94a3b8", marginBottom: 32, fontSize: 15 }}>You must enroll in this course to read the subtopic data.</p>
                  <button onClick={handleEnroll} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "#fff", padding: "12px 32px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 500 }}>
                    Enroll for Free
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 16, lineHeight: 1.8, color: "#cbd5e1", whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.01)", padding: 40, borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
                  {currentSub.data || <span style={{ color: "#475569", fontStyle: "italic" }}>No content provided for this subtopic.</span>}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#475569" }}>
              Ready to start learning? Select a subtopic from the syllabus.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
