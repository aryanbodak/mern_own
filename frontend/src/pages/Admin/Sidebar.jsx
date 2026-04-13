import ThemeToggle from "../../components/ThemeToggle";

export default function Sidebar({ tab, setTab, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand" style={{ marginBottom: "8px" }}>
        <div className="brand-dot" />
        <span className="brand-name">CourseDB</span>
      </div>
      <div className="sidebar-role">Admin Panel</div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-btn ${tab === "users" ? "active" : ""}`}
          onClick={() => setTab("users")}
        >
          👥 Users
        </button>
        <button
          className={`sidebar-btn ${tab === "courses" ? "active" : ""}`}
          onClick={() => setTab("courses")}
        >
          📚 Courses
        </button>
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ padding: "8px 12px" }}>
          <ThemeToggle />
        </div>
        <button className="sidebar-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
