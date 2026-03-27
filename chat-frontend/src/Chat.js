import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Chat.css";

function Chat() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("❌ No token found. Please login first.");
      window.location.href = "/login";
      return;
    }

    const fetchHistory = async () => {
      try {
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(`/messages/${roomId}`, { headers });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistory();

    // Determine WebSocket protocol (ws or wss) based on current page protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/chat/${roomId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("Connected to chat room:", roomId);
    ws.onmessage = (event) => {
      const msg = event.data;
      const [sender, ...rest] = msg.split(":");
      const content = rest.join(":").trim();
      setMessages((prev) => [...prev, { sender: sender.trim(), content }]);
    };
    ws.onclose = () => console.log("Disconnected from chat room");
    setSocket(ws);

    return () => ws.close();
  }, [roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (socket && input.trim() !== "") {
      socket.send(input);
      setInput("");
    }
  };

  return (
    <div className="chat-fullscreen">
      <div className="floating-icon floating-icon-1">💬</div>
      <div className="floating-icon floating-icon-2">👥</div>
      <div className="floating-icon floating-icon-3">✨</div>

      <div className="chat-header">
        <h2>💬 Chat Room</h2>
        <div className="room-id-badge">
          <span>🔑</span> {roomId}
        </div>
      </div>

      <div className="messages-area">
        {messages.map((msg, idx) => (
          <div key={idx} className="message">
            <div className="message-sender">{msg.sender || "Anon"}</div>
            <div className="message-content">{msg.content || msg.message}</div>
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;