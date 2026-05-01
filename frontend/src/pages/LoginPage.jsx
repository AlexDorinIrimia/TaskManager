// src/pages/LoginPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { saveLogin } = useAuth();
  const navigate = useNavigate();

  // Toggle between login and register tabs
  const [tab, setTab] = useState("login");

  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const data = await login(username, password);
      // data.token comes back from POST /api/auth/login
      saveLogin(data.token, username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await register(username, password, fullName);
      setSuccess("Account created! You can now log in.");
      setTab("login");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">TASK<span style={{color:"var(--text-muted)"}}>MGR</span></div>
        <div className="login-sub">Project & task management</div>

        <div className="login-tabs">
          <button className={`login-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>
            Login
          </button>
          <button className={`login-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); setSuccess(""); }}>
            Register
          </button>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" style={{width:"100%", justifyContent:"center"}} disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" value={fullName} onChange={e => setFullName(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" style={{width:"100%", justifyContent:"center"}} disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
