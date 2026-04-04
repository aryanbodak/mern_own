import React, { useEffect, useState } from "react";

export default function MongoOutput() {
  const [courses, setCourses] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, userRes] = await Promise.all([
          fetch("http://localhost:5000/api/courses"),
          fetch("http://localhost:5000/api/admin/users", {
            headers: {
              "x-admin-user": sessionStorage.getItem("adminUser") || "admin",
              "x-admin-pass": sessionStorage.getItem("adminPass") || "admin123"
            }
          })
        ]);
        
        const courseData = await courseRes.json();
        const userData = userRes.ok ? await userRes.json() : { error: "Not logged in as admin or unauthorized" };

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
    <div style={{ padding: "40px", background: "#0a0a0f", minHeight: "100vh", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", marginBottom: "20px" }}>MongoDB Database Output</h1>
      
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading data from MongoDB...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          
          <section>
            <h2 style={{ color: "#818cf8", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
              Courses Collection
            </h2>
            <pre style={{ background: "#1e1e2e", padding: "20px", borderRadius: "10px", overflow: "auto", fontSize: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
              {JSON.stringify(courses, null, 2)}
            </pre>
          </section>

          <section>
            <h2 style={{ color: "#ec4899", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
              Users Collection
            </h2>
            <pre style={{ background: "#1e1e2e", padding: "20px", borderRadius: "10px", overflow: "auto", fontSize: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
              {JSON.stringify(users, null, 2)}
            </pre>
          </section>

        </div>
      )}
    </div>
  );
}
