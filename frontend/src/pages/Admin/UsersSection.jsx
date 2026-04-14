import { useState } from "react";

export default function UsersSection({ users, loading, search, setSearch }) {
  const [drawerUser, setDrawerUser] = useState(null);

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">{users.length} registered users</p>
        </div>
        <div className="page-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <div className="mini-stat-num">{users.length}</div>
          <div className="mini-stat-label">Total Users</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-num">
            {users.filter((u) => u.enrolledCourses?.length > 0).length}
          </div>
          <div className="mini-stat-label">Enrolled</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-num">
            {users.reduce((sum, u) => sum + (u.enrolledCourses?.length || 0), 0)}
          </div>
          <div className="mini-stat-label">Enrollments</div>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading users...</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>College</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Interests</th>
                <th>Courses</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty-cell">No users found</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {u.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="user-name">{u.username}</div>
                      </div>
                    </td>
                    <td>{u.email || "—"}</td>
                    <td>{u.college || "—"}</td>
                    <td>{u.branch || "—"}</td>
                    <td>{u.year || "—"}</td>
                    <td>
                      {u.interests?.length > 0
                        ? u.interests.slice(0, 2).join(", ") + (u.interests.length > 2 ? "..." : "")
                        : "—"}
                    </td>
                    <td>
                      {u.enrolledCourses?.length > 0 ? (
                        <button className="view-courses-btn" onClick={() => setDrawerUser(u)}>
                          📚 View {u.enrolledCourses.length} course{u.enrolledCourses.length > 1 ? "s" : ""}
                        </button>
                      ) : (
                        <span>None</span>
                      )}
                    </td>
                    <td>
                      <span className="count-cell">{u.enrolledCourses?.length || 0}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {drawerUser && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerUser(null)} />
          <div className="courses-drawer">
            <div className="drawer-header">
              <div>
                <div className="drawer-title">
                  <span className="drawer-avatar">
                    {drawerUser.username?.[0]?.toUpperCase()}
                  </span>
                  {drawerUser.username}'s Courses
                </div>
                <div className="drawer-sub">{drawerUser.enrolledCourses.length} enrolled</div>
              </div>
              <button className="drawer-close" onClick={() => setDrawerUser(null)}>✕</button>
            </div>
            <div className="drawer-list">
              {drawerUser.enrolledCourses.map((c, i) => {
                const rawDone = drawerUser.progress?.[c._id] || [];
                const done = new Set(rawDone).size;
                let total = 0;
                c.topics?.forEach(t => { total += t.subTopics?.length || 0; });
                const pct = total === 0 ? 0 : Math.min(Math.floor((done / total) * 100), 100);
                return (
                  <div
                    key={c._id || i}
                    className="drawer-course-row"
                    style={{ "--dc": c.color || "var(--accent)" }}
                  >
                    <div className="drawer-course-dot" />
                    <div className="drawer-course-info">
                      <div className="drawer-course-top">
                        <div className="drawer-course-title">{c.title}</div>
                        <div className="drawer-course-pct">{pct}%</div>
                      </div>
                      <div className="drawer-course-tag">{c.tag}</div>
                      <div className="drawer-progress-track">
                        <div className="drawer-progress-fill" style={{ "--pct": `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
