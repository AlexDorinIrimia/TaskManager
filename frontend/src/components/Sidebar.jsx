// src/components/Sidebar.js
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        TASK<span>MGR</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span className="icon">▪</span> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span className="icon">◈</span> Projects
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span className="icon">◆</span> Tasks
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span className="icon">◉</span> Users
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">Logged in as<br /><strong style={{color:"var(--text)"}}>{username}</strong></div>
        <button className="nav-link btn-ghost" onClick={handleLogout} style={{color:"var(--danger)"}}>
          <span className="icon">→</span> Log out
        </button>
      </div>
    </aside>
  );
}
