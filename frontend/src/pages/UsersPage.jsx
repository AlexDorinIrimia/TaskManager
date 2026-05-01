// src/pages/UsersPage.jsx
import { useEffect, useState, useCallback } from "react";
import { getUsers } from "../services/api.js";

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ color: "var(--text-muted)", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="page-title">Users</div>
            <div className="page-subtitle">{users.length} registered user{users.length !== 1 ? "s" : ""}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {users.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">◉</div><p>No users found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Username</th><th>Full Name</th><th>Role</th></tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td style={{ fontWeight: "500" }}>@{user.username}</td>
                    <td>{user.fullName || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                    <td>
                      <span style={{ background: "var(--accent-dim)", color: "var(--accent)", borderRadius: "20px", padding: "2px 10px", fontSize: "11px" }}>
                        {user.role || "USER"}
                      </span>
                    </td>
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
