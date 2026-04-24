import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const API_URL = process.env.REACT_APP_API_URL || "";
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: e.target.username.value,
        email: e.target.email.value,
        password: e.target.password.value,
      }),
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      setStatus("✓ " + data.message + " Redirecting...");
      setTimeout(() => (window.location.href = "/login"), 1500);
    } else {
      setStatus("✗ " + (data.detail || "Registration failed"));
      setLoading(false);
    }
  };

  useEffect(() => {
    const leftPanel = document.querySelector(".left-panel");
    const bubbles = document.querySelectorAll(".bubble");

    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      if (leftPanel) {
        leftPanel.style.backgroundPosition = `${50 + x * 0.5}% ${50 + y * 0.5}%`;
      }
      bubbles.forEach((b, i) => {
        b.style.transform = `translate(${x * (i % 2 === 0 ? 0.4 : -0.4)}px, ${y * 0.3}px)`;
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="page-wrapper">
      {/* ── Left curved panel ── */}
      <div className="left-panel">
        <div className="bokeh b1" />
        <div className="bokeh b2" />
        <div className="bokeh b3" />

        <div className="chat-scene">
          {/* Avatar pair */}
          <div className="avatars">
            {/* Girl 1 – purple top */}
            <div className="avatar">
              <svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
                <rect width="70" height="70" fill="#fce4ec" />
                <ellipse cx="35" cy="62" rx="22" ry="14" fill="#ce93d8" />
                <rect x="29" y="44" width="12" height="10" rx="4" fill="#ffccbc" />
                <ellipse cx="35" cy="34" rx="15" ry="16" fill="#ffccbc" />
                <ellipse cx="35" cy="22" rx="16" ry="10" fill="#4a148c" />
                <ellipse cx="21" cy="34" rx="5" ry="9" fill="#4a148c" />
                <ellipse cx="49" cy="34" rx="5" ry="9" fill="#4a148c" />
                <ellipse cx="30" cy="33" rx="2.5" ry="3" fill="#4a148c" />
                <ellipse cx="40" cy="33" rx="2.5" ry="3" fill="#4a148c" />
                <circle cx="31" cy="32" r="1" fill="#fff" />
                <circle cx="41" cy="32" r="1" fill="#fff" />
                <path d="M29 40 Q35 45 41 40" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <ellipse cx="26" cy="38" rx="4" ry="2.5" fill="#f48fb1" opacity="0.5" />
                <ellipse cx="44" cy="38" rx="4" ry="2.5" fill="#f48fb1" opacity="0.5" />
              </svg>
            </div>

            {/* Girl 2 – teal top */}
            <div className="avatar avatar-online">
              <svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
                <rect width="70" height="70" fill="#e0f2f1" />
                <ellipse cx="35" cy="62" rx="22" ry="14" fill="#4db6ac" />
                <rect x="29" y="44" width="12" height="10" rx="4" fill="#ffe0b2" />
                <ellipse cx="35" cy="34" rx="15" ry="16" fill="#ffe0b2" />
                <ellipse cx="35" cy="20" rx="15" ry="9" fill="#bf360c" />
                <ellipse cx="20" cy="30" rx="5" ry="12" fill="#bf360c" />
                <ellipse cx="50" cy="30" rx="5" ry="12" fill="#bf360c" />
                <ellipse cx="35" cy="14" rx="12" ry="6" fill="#bf360c" />
                <ellipse cx="30" cy="33" rx="2.5" ry="3" fill="#3e2723" />
                <ellipse cx="40" cy="33" rx="2.5" ry="3" fill="#3e2723" />
                <circle cx="31" cy="32" r="1" fill="#fff" />
                <circle cx="41" cy="32" r="1" fill="#fff" />
                <path d="M29 40 Q35 45 41 40" stroke="#e64a19" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <ellipse cx="26" cy="38" rx="4" ry="2.5" fill="#ffab91" opacity="0.5" />
                <ellipse cx="44" cy="38" rx="4" ry="2.5" fill="#ffab91" opacity="0.5" />
              </svg>
              <div className="online-dot" />
            </div>
          </div>

          {/* Chat bubbles */}
          <div className="bubbles">
            <div className="bubble left">Hey! You finally joined 👋</div>
            <div className="bubble right">Yes! So excited to be here ✨</div>
            <div className="bubble left">Let's chat all day long!</div>
            <div className="typing">
              <span /><span /><span />
            </div>
          </div>

          <p className="left-label">Connect &amp; Chat</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="right-panel">
        <div className="bg-shape bs1" />
        <div className="bg-shape bs2" />
        <div className="bg-shape bs3" />

        <div className="form-card">
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Join the conversation today</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Username</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="5" r="3" stroke="#2d6a4f" strokeWidth="1.5" />
                  <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input className="form-input" type="text" name="username" placeholder="Choose a username" required />
              </div>
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="#2d6a4f" strokeWidth="1.5" />
                  <path d="M1 5l7 5 7-5" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input className="form-input" type="email" name="email" placeholder="your@email.com" required />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="7" width="10" height="8" rx="2" stroke="#2d6a4f" strokeWidth="1.5" />
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="1.2" fill="#2d6a4f" />
                </svg>
                <input className="form-input" type="password" name="password" placeholder="Create a strong password" required />
              </div>
            </div>

            <button className="btn-register" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Get Started"}
            </button>

            {status && (
              <p className={`status-msg ${status.startsWith("✓") ? "success" : "error"}`}>
                {status}
              </p>
            )}
          </form>

          <div className="divider"><span>or continue with</span></div>

          <div className="social-row">
            <button className="social-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.253 17.64 11.945 17.64 9.2z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="social-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.182 0c.059.79-.23 1.583-.657 2.148-.44.586-1.148 1.032-1.87.984-.08-.773.262-1.57.672-2.09C9.76.454 10.494.038 11.182 0zM14 11.58c-.396.874-.586 1.264-1.097 2.034-.712 1.081-1.716 2.428-2.96 2.44-1.104.013-1.388-.716-2.884-.708-1.496.008-1.81.724-2.917.712-1.243-.012-2.19-1.22-2.9-2.302-1.992-3.018-2.202-6.562-.973-8.45C1.317 3.867 2.58 3.15 3.808 3.15c1.26 0 2.053.728 3.094.728.995 0 1.601-.73 3.036-.73 1.098 0 2.26.6 3.092 1.636-.096.065-1.84 1.073-1.82 3.2.02 2.557 2.248 3.408 2.29 3.422A11.35 11.35 0 0114 11.58z" fill="#1b4332"/>
              </svg>
              Apple
            </button>
          </div>

          <div className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
