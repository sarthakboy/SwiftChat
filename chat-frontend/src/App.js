import React from "react";
// Added Routes to the import
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import RoomLogin from "./RoomLogin";
import Chat from "./Chat";
import './Register.css';

function App() {
  return (
    <Router>
      {/* 1. You must wrap Route components in <Routes> */}
      <Routes> 
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Register />} /> 
        <Route path="/roomlogin" element={<RoomLogin />} />
        {/* The :roomId param matches the useParams() in your Chat.js */}
        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;