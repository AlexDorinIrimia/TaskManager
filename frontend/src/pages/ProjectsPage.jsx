// src/pages/ProjectsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { getProjects, createProject, deleteProject } from "../services/api.js";

export default function ProjectsPage() {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]         = useState("");
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getProjects();
      setProjects(data || []);
    } catch (e) {
      setError("Failed to load projects: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createProject({ name, description });
      setName(""); setDescription("");
      setShowModal(false);
      await load(); // refetch immediately after creating
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this project?")) return;
    setError("");
    try {
      await deleteProject(id);
      await load(); // refetch immediately after deleting
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Projects</div>
        <div className="page-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""}</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <span />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No projects yet. Create your first one.</p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {projects.map(project => (
            <div className="card" key={project.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div style={{ fontWeight: "600", fontSize: "15px" }}>{project.name}</div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project.id)}>Delete</button>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                {project.description || <em>No description</em>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">New Project</div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
