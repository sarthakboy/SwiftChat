import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css'; 
function Login() {
  const [status, setStatus] = useState("");
  const navigate = useNavigate();  

  const handleLogin = async (e) => {
    e.preventDefault();

    // Point directly to FastAPI backend
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: e.target.email.value,
        password: e.target.password.value
      }),
      credentials: "include"
    });

    if (!res.ok) {
      setStatus("❌ Login failed.");
      return;
    }

    const data = await res.json();
    console.log("Login response JSON:", data);

    if (data.access_token) {
      localStorage.setItem("jwt", data.access_token);
      setStatus("✅ Login successful. Redirecting...");
      navigate("/roomlogin");   
    } else {
      setStatus("⚠️ No access_token found in response!");
    }
  };
// inside component
useEffect(() => {
  const container = document.querySelector('.login-container');
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
    <div className="login-container">
      <div className="floating-icon floating-icon-1">👥</div>
<div className="floating-icon floating-icon-2">💬</div>
<div className="floating-icon floating-icon-3">🐱</div>
<div className="floating-icon floating-icon-4">📚</div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input type="text" name="email" required /><br /><br />

        <label>Password:</label>
        <input type="password" name="password" required /><br /><br />

        <button type="submit">Login</button>
      </form>
      <p>{status}</p>
    </div>
  );
}

export default Login;