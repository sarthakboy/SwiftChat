import React, { useState } from "react";
import "./RoomLogin.css";

function RoomLogin() {
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("");

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setStatus("❌ Please enter a room ID.");
      return;
    }

    const token = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");

    if (!username) {
      setStatus("❌ Username not found. Please log in again.");
      return;
    }

    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`/create_room/${roomId}?username=${username}`, {
        method: "POST",
        headers,
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Room created successfully!");
        window.location.href = `/chat/${roomId}`;
      } else {
        setStatus("❌ Failed: " + (data.detail || "Unknown error"));
      }
    } catch (err) {
      setStatus("⚠️ Error connecting to server.");
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setStatus("❌ Please enter a room ID.");
      return;
    }

    const token = localStorage.getItem("jwt");

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`/rooms/${roomId}`, {
        headers,
      });

      const data = await res.json();
      if (data.length > 0) {
        setStatus("✅ Room exists. Joining...");
        window.location.href = `/chat/${roomId}`;
      } else {
        setStatus("❌ Room not found.");
      }
    } catch (err) {
      setStatus("⚠️ Error checking room.");
    }
  };

  return (
    <div className="roomlogin-container">
      <div className="floating-icon floating-icon-1">👥</div>
      <div className="floating-icon floating-icon-2">💬</div>
      <div className="floating-icon floating-icon-3">🚪</div>
      <div className="floating-icon floating-icon-4">🔑</div>

      <div className="roomlogin-card">
        <h2>Room Access</h2>
        <p className="subtitle">Enter a room ID to create or join</p>

        <div className="input-group">
          <input
            type="text"
            placeholder="Room ID (e.g., CHAT123)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          />
        </div>

        <div className="button-group">
          <button className="btn btn-create" onClick={handleCreateRoom}>
            <span>✨</span> Create Room
          </button>
          <button className="btn btn-join" onClick={handleJoinRoom}>
            <span>🚀</span> Join Room
          </button>
        </div>

        {status && <p className="status-message">{status}</p>}
      </div>
    </div>
  );
}

export default RoomLogin;