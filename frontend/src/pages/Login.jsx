import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm]     = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res  = await fetch("http://localhost:5000/api/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (data.message === "Login successful") {
      if (data.role === "admin") {
        // Store credentials so AdminDashboard can attach them to API calls
        sessionStorage.setItem("adminUser", form.username);
        sessionStorage.setItem("adminPass", form.password);
        navigate("/admin");
      } else {
        sessionStorage.setItem("username", data.username);
        navigate("/home");
      }
    } else {
      alert("Account not found! Please signup.");
    }
  };

  return (
    <div className="auth-root">
      {/* Form Panel */}
      <div className="auth-left">
        <div className="brand">
          <div className="brand-dot" />
          <span className="brand-name">CourseDB</span>
        </div>

        <h1 className="auth-heading">
          Welcome<br />
          <span>back.</span>
        </h1>
        <p className="auth-sub">Sign in to continue your learning journey.</p>

        <div className="field-group">
          <div>
            <label className="field-label">Username</label>
            <input
              className="field-input"
              name="username"
              placeholder="your_username"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              className="field-input"
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          <span>{loading ? "Signing in..." : "Sign In →"}</span>
        </button>

        <div className="divider">or</div>

        <div className="switch-link">
          Don't have an account?
          <button onClick={() => navigate("/signup")}>Create one</button>
        </div>
      </div>

      {/* Decorative Panel */}
      <div className="auth-right">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="glass-card">
          <p className="glass-card-title">Platform Overview</p>
          <div className="stat-row">
            <div className="stat-item">
              <div className="stat-num">12k+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">340</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">98%</div>
              <div className="stat-label">Rated</div>
            </div>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
