export default function UsersSection({ users, loading, search, setSearch }) {

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER */}
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

      {/* STATS */}
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

      {/* TABLE */}
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
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id}>

                    {/* USER */}
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {u.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="user-name">{u.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td>{u.email || "—"}</td>

                    {/* COLLEGE */}
                    <td>{u.college || "—"}</td>

                    {/* BRANCH */}
                    <td>{u.branch || "—"}</td>

                    {/* YEAR */}
                    <td>{u.year || "—"}</td>

                    {/* INTERESTS */}
                    <td>
                      {u.interests?.length > 0
                        ? u.interests.slice(0, 2).join(", ") +
                          (u.interests.length > 2 ? "..." : "")
                        : "—"}
                    </td>

                    {/* COURSES */}
                    <td>
                      <div className="enroll-chips">
                        {u.enrolledCourses?.length > 0 ? (
                          u.enrolledCourses.slice(0, 2).map((c, i) => (
                            <span key={i} className="enroll-chip">
                              {c.title}
                            </span>
                          ))
                        ) : (
                          <span>None</span>
                        )}
                      </div>
                    </td>

                    {/* COUNT */}
                    <td>
                      <span className="count-cell">
                        {u.enrolledCourses?.length || 0}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}