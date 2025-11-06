import React, { useEffect, useState, useMemo } from "react";
import "./RolesManager.css";

const STORAGE_KEY = "owner_roles_v1";

const DEFAULT_PERMISSIONS = [
  "events:create",
  "events:edit",
  "events:archive",
  "events:delete",
  "reports:view",
  "users:manage",
  "billing:view",
];

const sampleRoles = [
  { id: "role_owner", name: "Owner", permissions: DEFAULT_PERMISSIONS },
  { id: "role_admin", name: "Admin", permissions: ["events:create","events:edit","events:archive","reports:view","users:manage"] },
  { id: "role_staff", name: "Staff", permissions: ["events:edit","reports:view"] },
];

function exportCSV(roles) {
  const rows = ["id,name,permissions", ...roles.map(r => `${r.id},"${r.name}","${r.permissions.join(";")}"`)];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "roles.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const RolesManager = () => {
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/roles");
        if (!res.ok) throw new Error("no roles api");
        const data = await res.json();
        if (mounted) {
          setRoles(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } catch (e) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setRoles(JSON.parse(saved));
        else setRoles(sampleRoles);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.permissions.join(" ").toLowerCase().includes(q));
  }, [roles, query]);

  const openNew = () => {
    setEditing({ id: `role_${Date.now()}`, name: "", permissions: [] });
    setShowModal(true);
  };

  const startEdit = (role) => {
    setEditing({ ...role });
    setShowModal(true);
  };

  const saveRole = async (role) => {
    const next = roles.some(r => r.id === role.id) ? roles.map(r => r.id === role.id ? role : r) : [role, ...roles];
    setRoles(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setShowModal(false);
    setEditing(null);
    // Try to persist
    try {
      await fetch(`/api/roles/${role.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(role) });
    } catch (e) {
      // swallow — local fallback already applied
    }
  };

  const removeRole = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    const next = roles.filter(r => r.id !== id);
    setRoles(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    try {
      await fetch(`/api/roles/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  return (
    <div className="rm-container">
      <div className="rm-header">
        <h2>Roles & Permissions</h2>
        <div className="rm-actions">
          <input className="rm-search" placeholder="Search roles or permissions..." value={query} onChange={e=>setQuery(e.target.value)} />
          <button className="btn primary" onClick={openNew}>New Role</button>
          <button className="btn export-btn" onClick={() => exportCSV(roles)}>Export CSV</button>
        </div>
      </div>

      <div className="rm-list">
        <table className="rm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td>
                <td>{r.name}</td>
                <td>
                  <div className="perm-list">
                    {r.permissions.slice(0,6).map(p => <span key={p} className="perm">{p}</span>)}
                    {r.permissions.length > 6 && <span className="perm more">+{r.permissions.length-6}</span>}
                  </div>
                </td>
                <td>
                  <button className="btn edit sm" onClick={()=>startEdit(r)}>Edit</button>
                  <button className="btn delete sm" onClick={()=>removeRole(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="muted">No roles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && editing && (
        <div className="rm-modal">
          <div className="rm-modal-inner">
            <h3>{roles.some(r=>r.id===editing.id) ? 'Edit Role' : 'Create Role'}</h3>
            <div className="form-row">
              <label>Role ID</label>
              <input value={editing.id} onChange={e=>setEditing({...editing,id:e.target.value})} disabled />
            </div>
            <div className="form-row">
              <label>Name</label>
              <input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} />
            </div>
            <div className="form-row permissions">
              <label>Permissions</label>
              <div className="perms-grid">
                {DEFAULT_PERMISSIONS.map(p => (
                  <label key={p} className="perm-checkbox">
                    <input
                      type="checkbox"
                      checked={editing.permissions.includes(p)}
                      onChange={e=>{
                        const perms = new Set(editing.permissions);
                        if (e.target.checked) perms.add(p); else perms.delete(p);
                        setEditing({...editing, permissions: Array.from(perms)});
                      }}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={()=>{ setShowModal(false); setEditing(null); }}>Cancel</button>
              <button className="btn primary" onClick={()=>saveRole(editing)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManager;
