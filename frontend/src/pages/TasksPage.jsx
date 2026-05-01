// src/pages/TasksPage.jsx
import { useEffect, useState, useCallback } from "react";
import {
  getTasks, createTask, updateTask, deleteTask,
  assignUsersToTask, getProjects, getUsers
} from "../services/api.js";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

function statusBadge(status) {
  if (status === "TODO")        return <span className="badge badge-todo">Todo</span>;
  if (status === "IN_PROGRESS") return <span className="badge badge-inprogress">In Progress</span>;
  if (status === "DONE")        return <span className="badge badge-done">Done</span>;
  return null;
}

function TaskModal({ task, projects, onClose, onSaved }) {
  const editing = !!task;
  const [title, setTitle]             = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus]           = useState(task?.status || "TODO");
  const [deadline, setDeadline]       = useState(task?.deadline || "");
  const [projectId, setProjectId]     = useState(task?.project?.id || "");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editing && !projectId) { setError("Please select a project."); return; }
    setSaving(true); setError("");
    try {
      const payload = { title, description, status, deadline };
      if (editing) await updateTask(task.id, payload);
      else await createTask(payload, projectId);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{editing ? "Edit Task" : "New Task"}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input className="form-control" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          {!editing && (
            <div className="form-group">
              <label>Project</label>
              <select className="form-control" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                <option value="">-- Select a project --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignModal({ task, users, onClose, onSaved }) {
  const [selected, setSelected] = useState((task.assignedUsers || []).map(u => u.id));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  function toggle(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await assignUsersToTask(task.id, selected);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Assign Users — {task.title}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "260px", overflowY: "auto", marginBottom: "16px" }}>
            {users.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No users found.</div>}
            {users.map(user => (
              <label key={user.id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px", borderRadius: "8px", background: selected.includes(user.id) ? "var(--accent-dim)" : "transparent" }}>
                <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggle(user.id)} style={{ accentColor: "var(--accent)" }} />
                <span style={{ fontSize: "13px" }}>{user.fullName || user.username}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto" }}>@{user.username}</span>
              </label>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Assign"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [modal, setModal]           = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus]   = useState("all");

  const load = useCallback(async () => {
    setError("");
    try {
      const [t, p, u] = await Promise.all([getTasks(), getProjects(), getUsers()]);
      setTasks(t || []);
      setProjects(p || []);
      setUsers(u || []);
    } catch (e) {
      setError("Failed to load data: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      await load(); // refetch immediately
    } catch (e) {
      setError(e.message);
    }
  }

  function closeModal() { setModal(null); setSelectedTask(null); }

  async function onSaved() {
    closeModal();
    await load(); // refetch immediately after any save
  }

  const filtered = tasks.filter(t => {
    const matchProject = filterProject === "all" || String(t.project?.id) === filterProject;
    const matchStatus  = filterStatus  === "all" || t.status === filterStatus;
    return matchProject && matchStatus;
  });

  if (loading && tasks.length === 0)
    return <div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Tasks</div>
        <div className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <div style={{ display: "flex", gap: "10px" }}>
          <select className="form-control" style={{ width: "auto", padding: "8px 12px" }} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            <option value="all">All projects</option>
            {projects.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
          <select className="form-control" style={{ width: "auto", padding: "8px 12px" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("create")}>+ New Task</button>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">◆</div><p>No tasks match your filters.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Status</th><th>Project</th><th>Deadline</th><th>Assigned</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: "500" }}>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {task.description.length > 60 ? task.description.slice(0, 60) + "…" : task.description}
                        </div>
                      )}
                    </td>
                    <td>{statusBadge(task.status)}</td>
                    <td style={{ color: "var(--text-muted)" }}>{task.project?.name || "—"}</td>
                    <td style={{ color: "var(--text-muted)" }}>{task.deadline || "—"}</td>
                    <td>
                      {(task.assignedUsers || []).length === 0
                        ? <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>None</span>
                        : (task.assignedUsers || []).map(u => (
                            <span key={u.id} style={{ display: "inline-block", marginRight: "4px", marginBottom: "2px", background: "var(--accent-dim)", color: "var(--accent)", borderRadius: "20px", padding: "2px 8px", fontSize: "11px" }}>
                              {u.username}
                            </span>
                          ))
                      }
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedTask(task); setModal("edit"); }}>Edit</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedTask(task); setModal("assign"); }}>Assign</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === "create" && <TaskModal projects={projects} onClose={closeModal} onSaved={onSaved} />}
      {modal === "edit" && selectedTask && <TaskModal task={selectedTask} projects={projects} onClose={closeModal} onSaved={onSaved} />}
      {modal === "assign" && selectedTask && <AssignModal task={selectedTask} users={users} onClose={closeModal} onSaved={onSaved} />}
    </div>
  );
}
