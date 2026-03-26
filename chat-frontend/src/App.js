import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import RoomLogin from "./RoomLogin";
import Chat from "./chat";
import './Register.css';p
// import './App.css';
function App() {
  return (
    <Router>
      <nav>
        <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Register />} /> {/* default route */}
        <Route path="/roomlogin" element={<RoomLogin />} />
        <Route path="/chat/:roomId" element={<Chat />} /> {/* Chat component to be implemented */}

      </Routes>
    </Router>
  );
}

export default App;