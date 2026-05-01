// src/pages/DashboardPage.jsx
import { useEffect, useState, useCallback } from "react";
import { getTasks, getProjects, getUsers } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardPage() {
  const { username } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [t, p, u] = await Promise.all([getTasks(), getProjects(), getUsers()]);
      setTasks(t || []);
      setProjects(p || []);
      setUsers(u || []);
    } catch (e) {
      setError("Failed to load data. " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const todo       = tasks.filter(t => t.status === "TODO").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const done       = tasks.filter(t => t.status === "DONE").length;
  const recent     = [...tasks].reverse().slice(0, 5);

  function statusBadge(status) {
    if (status === "TODO")        return <span className="badge badge-todo">Todo</span>;
    if (status === "IN_PROGRESS") return <span className="badge badge-inprogress">In Progress</span>;
    if (status === "DONE")        return <span className="badge badge-done">Done</span>;
    return null;
  }

  if (loading && tasks.length === 0)
    return <div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-subtitle">Welcome back, {username}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-row">
        <div className="stat-card accent"><div className="stat-label">Total Tasks</div><div className="stat-value">{tasks.length}</div></div>
        <div className="stat-card warning"><div className="stat-label">To Do</div><div className="stat-value">{todo}</div></div>
        <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value">{inProgress}</div></div>
        <div className="stat-card success"><div className="stat-label">Done</div><div className="stat-value">{done}</div></div>
        <div className="stat-card"><div className="stat-label">Projects</div><div className="stat-value">{projects.length}</div></div>
        <div className="stat-card"><div className="stat-label">Users</div><div className="stat-value">{users.length}</div></div>
      </div>

      <div className="card">
        <div style={{ marginBottom: "16px", fontWeight: "600" }}>Recent Tasks</div>
        {recent.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">◆</div><p>No tasks yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Status</th><th>Deadline</th><th>Project</th></tr></thead>
              <tbody>
                {recent.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{statusBadge(task.status)}</td>
                    <td style={{ color: "var(--text-muted)" }}>{task.deadline || "—"}</td>
                    <td style={{ color: "var(--text-muted)" }}>{task.project?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
