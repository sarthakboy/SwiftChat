import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Chat.css";

function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const username = localStorage.getItem("username") || "You";
    setCurrentUser(username);

    if (!token) {
      alert("No token found. Please login first.");
      window.location.href = "/login";
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/messages/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistory();

    const wsUrl = `ws://localhost:8000/chat/${roomId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to chat room:", roomId);
      setConnected(true);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };
    ws.onclose = () => {
      console.log("Disconnected from chat room");
      setConnected(false);
    };
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

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.slice(0, 2).toUpperCase();
  };

  const senderColor = (name) => {
    const colors = ["#52b788", "#4db6ac", "#ce93d8", "#f48fb1", "#81d4fa", "#a5d6a7", "#ffcc80"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="chat-page">

      {/* ── Sidebar ── */}
      <div className="chat-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="16" height="12" rx="3" stroke="#fff" strokeWidth="1.5"/>
              <path d="M1 9l4 4v-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 6h8M5 9h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span>ChatApp</span>
        </div>

        <div className="sidebar-room">
          <div className="room-label">Current Room</div>
          <div className="room-name"># {roomId}</div>
          <div className={`room-status ${connected ? "online" : "offline"}`}>
            <span className="status-dot" />
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>

        <div className="sidebar-members">
          <div className="members-label">Active Members</div>
          <div className="member-item">
            <div className="member-avatar" style={{ background: senderColor(currentUser) }}>
              {getInitials(currentUser)}
            </div>
            <div className="member-info">
              <span className="member-name">{currentUser}</span>
              <span className="member-tag">you</span>
            </div>
          </div>
          {[...new Set(
            messages.map((m) => m.sender).filter((s) => s && s !== currentUser)
          )].map((name) => (
            <div key={name} className="member-item">
              <div className="member-avatar" style={{ background: senderColor(name) }}>
                {getInitials(name)}
              </div>
              <span className="member-name">{name}</span>
            </div>
          ))}
        </div>

        <button className="leave-btn" onClick={() => navigate("/roomlogin")}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l4-4-4-4M14 8H6"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Leave Room
        </button>
      </div>

      {/* ── Main ── */}
      <div className="chat-main">

        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <div className="header-hash">#</div>
            <div>
              <div className="header-room">{roomId}</div>
              <div className="header-sub">{messages.length} message{messages.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <div className={`header-pill ${connected ? "on" : "off"}`}>
            <span className="status-dot" />
            {connected ? "Live" : "Offline"}
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <rect x="4" y="8" width="36" height="24" rx="7" stroke="#95d5b2" strokeWidth="2"/>
                  <path d="M4 28l7 8v-8" stroke="#95d5b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 19h18M13 24h12" stroke="#95d5b2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p>No messages yet — say hello!</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isOwn = (msg.sender || "") === currentUser;
            const showSender = idx === 0 || messages[idx - 1]?.sender !== msg.sender;
            return (
              <div key={idx} className={`msg-row ${isOwn ? "own" : "other"}`}>
                {!isOwn && (
                  showSender
                    ? <div className="msg-avatar" style={{ background: senderColor(msg.sender) }}>
                        {getInitials(msg.sender || "?")}
                      </div>
                    : <div className="msg-avatar-gap" />
                )}
                <div className="msg-block">
                  {showSender && !isOwn && (
                    <div className="msg-sender" style={{ color: senderColor(msg.sender) }}>
                      {msg.sender || "Anon"}
                    </div>
                  )}
                  <div className="msg-bubble">
                    <span className="msg-text">{msg.content || msg.message}</span>
                    <span className="msg-time">{formatTime()}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-form" onSubmit={sendMessage}>
          <div className="input-wrap">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message #${roomId}…`}
              className="chat-input"
              autoComplete="off"
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!input.trim() || !connected}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M16 2L2 7.5l5.5 1.5L9 16l7-14z"
                  stroke="currentColor" strokeWidth="1.6"
                  strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;
