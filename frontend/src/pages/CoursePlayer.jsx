import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CoursePlayer() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  const [course,        setCourse]        = useState(null);
  const [isEnrolled,    setIsEnrolled]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [activeTopic,   setActiveTopic]   = useState(0);
  const [activeSub,     setActiveSub]     = useState(0);
  const [completedSubs, setCompletedSubs] = useState([]);

  useEffect(() => {
    if (!username) { navigate("/"); return; }
    fetchData();
  }, [id, username]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, userRes] = await Promise.all([
        fetch(`http://localhost:5000/api/courses/${id}`),
        fetch(`http://localhost:5000/api/user/${username}`)
      ]);
      const courseData = await courseRes.json();
      const userData   = await userRes.json();
      setCourse(courseData);
      const enrolledIds = userData.enrolledCourses?.map(c => typeof c === "object" ? c._id : c) || [];
      setIsEnrolled(enrolledIds.includes(courseData._id));
      setCompletedSubs(userData.progress?.[courseData._id] || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleEnroll = async () => {
    try {
      const res  = await fetch("http://localhost:5000/api/enroll", {
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
    } catch (err) { console.error(err); }
  };

  const currentTopic = course?.topics?.[activeTopic];
  const currentSub   = currentTopic?.subTopics?.[activeSub];

  // Auto-mark subtopic as complete when viewed
  useEffect(() => {
    if (isEnrolled && currentSub?._id) markComplete(currentSub._id);
  }, [isEnrolled, activeTopic, activeSub]);

  const markComplete = async (subid) => {
    if (!subid || completedSubs.includes(subid)) return;
    try {
      const res  = await fetch(`http://localhost:5000/api/user/${username}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id, subtopicId: subid })
      });
      const data = await res.json();
      setCompletedSubs(data.progress?.[id] || []);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="player-loading">Loading Class...</div>;
  if (!course)  return <div className="player-error">Course not found</div>;

  return (
    <div className="player-root">
      {/* HEADER */}
      <header className="player-header">
        <div className="player-header-left">
          <button className="back-btn" onClick={() => navigate("/home")}>← Back</button>
          <h1 className="player-title">{course.title}</h1>
        </div>
        {!isEnrolled && (
          <button className="enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}
      </header>

      <div className="player-body">
        {/* SIDEBAR */}
        <aside className="player-sidebar">
          <h3 className="syllabus-label">Syllabus</h3>
          {!course.topics || course.topics.length === 0 ? (
            <p className="no-topics">No topics added yet.</p>
          ) : (
            course.topics.map((topic, tIdx) => (
              <div key={tIdx} className="topic-group">
                <div className={`topic-name ${tIdx === activeTopic ? "active-topic" : ""}`}>
                  {topic.topicName}
                </div>
                <div className="subtopic-list">
                  {topic.subTopics?.map((sub, sIdx) => {
                    const isActive    = tIdx === activeTopic && sIdx === activeSub;
                    const isCompleted = sub._id && completedSubs.includes(sub._id);
                    return (
                      <button
                        key={sIdx}
                        className={`subtopic-btn ${isActive ? "subtopic-active" : isCompleted ? "subtopic-done" : ""}`}
                        onClick={() => { setActiveTopic(tIdx); setActiveSub(sIdx); }}
                      >
                        <div className={`subtopic-dot ${isActive ? "dot-active" : isCompleted ? "dot-done" : "dot-empty"}`} />
                        {sub.subTopicName}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="player-main">
          {course.topics?.length > 0 && currentSub ? (
            <div className="content-wrap">
              <div className="content-tag" style={{ color: course.color || "#818cf8" }}>
                {currentTopic.topicName}
              </div>
              <h2 className="content-heading">{currentSub.subTopicName}</h2>

              {!isEnrolled ? (
                <div className="locked-box">
                  <div className="locked-icon">🔒</div>
                  <h3 className="locked-title">Content is locked</h3>
                  <p className="locked-sub">You must enroll in this course to access the content.</p>
                  <button className="enroll-btn" onClick={handleEnroll}>Enroll for Free</button>
                </div>
              ) : (
                <div className="content-body">
                  {currentSub.data || <span className="no-content">No content provided for this subtopic.</span>}
                </div>
              )}
            </div>
          ) : (
            <div className="player-empty">Ready to start learning? Select a subtopic from the syllabus.</div>
          )}
        </main>
      </div>
    </div>
  );
}
