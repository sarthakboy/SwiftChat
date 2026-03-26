import React, { useState } from "react";
import "./RoomLogin.css"; // Import the new CSS

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
    const username = localStorage.getItem("username"); // Must be stored at login

    try {
      const res = await fetch(`http://localhost:8000/create_room/${roomId}?username=${username}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
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

    try {
      const res = await fetch(`http://localhost:8000/rooms/${roomId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
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