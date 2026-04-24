import React, { useState } from "react";
import { useEffect } from "react";
import "./RoomLogin.css";

function RoomLogin() {
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" | "error"
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setStatus("Please enter a room ID.");
      setStatusType("error");
      return;
    }

    const token = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");

    if (!username) {
      setStatus("Username not found. Please log in again.");
      setStatusType("error");
      return;
    }

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    setLoadingCreate(true);
    setStatus("");

    try {
      const API_URL = process.env.REACT_APP_API_URL || "";
      const res = await fetch(
        `${API_URL}/create_room/${roomId}?username=${username}`,
        { method: "POST", headers }
      );
      const data = await res.json();
      if (res.ok) {
        setStatus("Room created! Entering...");
        setStatusType("success");
        setTimeout(() => (window.location.href = `/chat/${roomId}`), 1000);
      } else {
        setStatus(data.detail || "Failed to create room.");
        setStatusType("error");
        setLoadingCreate(false);
      }
    } catch {
      setStatus("Error connecting to server.");
      setStatusType("error");
      setLoadingCreate(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setStatus("Please enter a room ID.");
      setStatusType("error");
      return;
    }

    const token = localStorage.getItem("jwt");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    setLoadingJoin(true);
    setStatus("");

    try {
      const API_URL = process.env.REACT_APP_API_URL || "";
      const res = await fetch(`${API_URL}/rooms/${roomId}`, { headers });
      const data = await res.json();
      if (data.length > 0) {
        setStatus("Room found! Joining...");
        setStatusType("success");
        setTimeout(() => (window.location.href = `/chat/${roomId}`), 1000);
      } else {
        setStatus("Room not found. Try a different ID.");
        setStatusType("error");
        setLoadingJoin(false);
      }
    } catch {
      setStatus("Error checking room.");
      setStatusType("error");
      setLoadingJoin(false);
    }
  };

  // Parallax effect
  useEffect(() => {
    const leftPanel = document.querySelector(".left-panel");
    const handleMove = (e) => {
      if (!leftPanel) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      leftPanel.style.backgroundPosition = `${50 + x * 0.5}% ${50 + y * 0.5}%`;
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

        <div className="left-scene">
          {/* Room illustration */}
          <div className="room-illustration">
            {/* Door SVG */}
            <div className="door-wrap">
              <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="door-svg">
                {/* door frame */}
                <rect x="8" y="8" width="104" height="148" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5"/>
                {/* door panel */}
                <rect x="18" y="18" width="84" height="128" rx="4" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                {/* top panel */}
                <rect x="26" y="26" width="68" height="52" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                {/* bottom panel */}
                <rect x="26" y="88" width="68" height="48" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                {/* knob */}
                <circle cx="88" cy="82" r="6" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <circle cx="88" cy="82" r="2.5" fill="rgba(255,255,255,0.9)"/>
                {/* keyhole */}
                <circle cx="88" cy="96" r="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                <line x1="88" y1="99" x2="88" y2="104" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              </svg>
              <div className="door-glow" />
            </div>

            {/* Floating chat chips */}
            <div className="chip chip-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M1 7l3 3v-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Room #A12
            </div>
            <div className="chip chip-2">
              <span className="chip-dot" /> 4 online
            </div>
            <div className="chip chip-3">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Secured
            </div>
          </div>

          <p className="left-label">Your Rooms</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="right-panel">
        <div className="bg-shape bs1" />
        <div className="bg-shape bs2" />
        <div className="bg-shape bs3" />

        <div className="form-card">
          <div className="form-header">
            <h2>Room Access</h2>
            <p>Create a new room or join an existing one</p>
          </div>

          {/* Room ID input */}
          <div className="input-group">
            <label>Room ID</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="7" width="12" height="8" rx="2" stroke="#2d6a4f" strokeWidth="1.5"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="1.2" fill="#2d6a4f"/>
              </svg>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. CHAT123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") handleJoinRoom(e); }}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Action hint */}
          <p className="hint-text">Start fresh or drop into an existing conversation</p>

          {/* Buttons */}
          <div className="btn-group">
            <button
              className="btn-action btn-create"
              onClick={handleCreateRoom}
              disabled={loadingCreate || loadingJoin}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {loadingCreate ? "Creating..." : "Create Room"}
            </button>

            <button
              className="btn-action btn-join"
              onClick={handleJoinRoom}
              disabled={loadingCreate || loadingJoin}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 11l4-4-4-4M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {loadingJoin ? "Joining..." : "Join Room"}
            </button>
          </div>

          {/* Status */}
          {status && (
            <div className={`status-msg ${statusType}`}>
              {statusType === "success" ? "✓" : "✗"} {status}
            </div>
          )}

          {/* Recent rooms placeholder */}
          <div className="divider"><span>recently visited</span></div>

          <div className="recent-rooms">
            <div className="recent-empty">No recent rooms yet</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomLogin;
