import React, { useEffect, useState } from "react";

// ✅ Admin credentials hardcoded
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export default function MongoOutput() {
  const [courses, setCourses] = useState(null);
  const [users,   setUsers]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, userRes] = await Promise.all([
          fetch("http://localhost:5000/api/courses"),
          fetch("http://localhost:5000/api/admin/users", {
            headers: { "x-admin-user": ADMIN_USER, "x-admin-pass": ADMIN_PASS }
          })
        ]);
        const courseData = await courseRes.json();
        const userData   = userRes.ok ? await userRes.json() : { error: "Unauthorized" };
        setCourses(courseData);
        setUsers(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="mongo-root">
      <h1 className="mongo-title">MongoDB Database Output</h1>
      {loading ? (
        <p className="loading-text">Loading data from MongoDB...</p>
      ) : (
        <div className="mongo-sections">
          <section>
            <h2 className="mongo-section-title mongo-courses">Courses Collection</h2>
            <pre className="mongo-pre">{JSON.stringify(courses, null, 2)}</pre>
          </section>
          <section>
            <h2 className="mongo-section-title mongo-users">Users Collection</h2>
            <pre className="mongo-pre">{JSON.stringify(users, null, 2)}</pre>
          </section>
        </div>
      )}
    </div>
  );
}
