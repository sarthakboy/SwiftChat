import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [status, setStatus] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: e.target.username.value,
        email: e.target.email.value,
        password: e.target.password.value
      }),
      credentials: "include"
    });

    const data = await res.json();
    if (res.ok) {
      setStatus("✅ " + data.message + " Redirecting...");
      window.location.href = "/login"; // go to login after success
    } else {
      setStatus("❌ Registration failed: " + (data.detail || "Unknown error"));
    }
  };
  useEffect(() => {
  const container = document.querySelector('.register-container');
  const handleMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    container.style.setProperty('--x', `${x}%`);
    container.style.setProperty('--y', `${y}%`);
  };
  window.addEventListener('mousemove', handleMove);
  return () => window.removeEventListener('mousemove', handleMove);
}, []);

  return (
    <div className="register-container">
      <div className="floating-icon floating-icon-1">👥</div>
<div className="floating-icon floating-icon-2">💬</div>
<div className="floating-icon floating-icon-3">🐱</div>
<div className="floating-icon floating-icon-4">📚</div>
      <h2 className="auth-title">Register</h2>
      <form className="auth-form" onSubmit={handleRegister}>
        <input type="text" name="username" placeholder="Username" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
      <p>{status}</p>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

export default Register;