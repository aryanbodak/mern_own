import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form,    setForm]    = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message);
      if (data.message === "Signup successful") navigate("/");
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="signup-root">
      {/* Decorative Left Panel */}
      <div className="signup-left">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="feature-list">
          <div className="feature-item"><div className="feature-icon">🎓</div>Access 340+ curated courses</div>
          <div className="feature-item"><div className="feature-icon">⚡</div>Learn at your own pace</div>
          <div className="feature-item"><div className="feature-icon">🏆</div>Earn verified certificates</div>
          <div className="feature-item"><div className="feature-icon">🌐</div>Join 12,000+ learners</div>
        </div>
        <p className="left-tagline">Start your journey today</p>
      </div>

      {/* Form Panel */}
      <div className="signup-right">
        <div className="brand">
          <div className="brand-dot" />
          <span className="brand-name">CourseDB</span>
        </div>

        <h1 className="signup-heading">
          Create your<br /><span>account.</span>
        </h1>
        <p className="signup-sub">It's free and takes less than a minute.</p>

        <div className="field-group">
          <div>
            <label className="field-label">Username</label>
            <input className="field-input" name="username" placeholder="choose_a_username" onChange={handleChange} required />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="field-input" name="email" type="email" placeholder="you@example.com" onChange={handleChange} required />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="field-input" name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
          </div>
        </div>

        <button className="signup-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account..." : "Create Account →"}
        </button>

        <p className="terms">By signing up, you agree to our Terms of Service and Privacy Policy.</p>

        <div className="switch-link">
          Already have an account?
          <button onClick={() => navigate("/")}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
