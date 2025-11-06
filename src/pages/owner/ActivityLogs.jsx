import React, { useEffect, useState, useMemo } from "react";
import "./ActivityLogs.css";

const STORAGE_KEY = "owner_activity_v1";

const SAMPLE = [
  { id: '1', ts: Date.now()-1000*60*60, user: 'system', type: 'login', detail: 'System startup', ip: '127.0.0.1' },
  { id: '2', ts: Date.now()-1000*60*30, user: 'alice', type: 'login', detail: 'Successful login', ip: '+1.5551234567' },
  { id: '3', ts: Date.now()-1000*60*10, user: 'bob', type: 'update', detail: 'Edited event #42', ip: '52.12.34.56' },
];

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function exportCSV(items) {
  const rows = ["id,timestamp,user,type,ip,detail", ...items.map(i => `${i.id},"${new Date(i.ts).toISOString()}","${i.user}","${i.type}","${i.ip}","${(i.detail||'').replace(/"/g,'""')}"`)];
  const blob = new Blob([rows.join("\n")], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'activity_logs.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

const ActivityLogs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromTs, setFromTs] = useState("");
  const [toTs, setToTs] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/logs?limit=200');
        if (!res.ok) throw new Error('no api');
        const data = await res.json();
        if (mounted) { setItems(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
      } catch (e) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setItems(JSON.parse(saved)); else setItems(SAMPLE);
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      if (typeFilter && i.type !== typeFilter) return false;
      if (fromTs && new Date(i.ts) < new Date(fromTs)) return false;
      if (toTs && new Date(i.ts) > new Date(toTs)) return false;
      if (!q) return true;
      return (i.user||'').toLowerCase().includes(q) || (i.type||'').toLowerCase().includes(q) || (i.detail||'').toLowerCase().includes(q) || (i.ip||'').toLowerCase().includes(q);
    }).sort((a,b)=>b.ts - a.ts);
  }, [items, query, typeFilter, fromTs, toTs]);

  const clearLogs = async () => {
    if (!window.confirm('Clear activity logs?')) return;
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
    try { await fetch('/api/logs', { method: 'DELETE' }); } catch(e){}
  };

  return (
    <div className="al-container">
      <div className="al-header">
        <h2>Activity Logs</h2>
        <div className="al-actions">
          <input placeholder="Search user/type/detail/ip" value={query} onChange={e=>setQuery(e.target.value)} className="al-search" />
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="login">Login</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="system">System</option>
          </select>
          <input type="datetime-local" value={fromTs} onChange={e=>setFromTs(e.target.value)} />
          <input type="datetime-local" value={toTs} onChange={e=>setToTs(e.target.value)} />
          <button className="btn" onClick={()=>exportCSV(filtered)}>Export CSV</button>
          <button className="btn danger" onClick={clearLogs}>Clear</button>
        </div>
      </div>

      <div className="al-list">
        {loading ? <div className="muted">Loading…</div> : (
          <table className="al-table">
            <thead>
              <tr><th>Time</th><th>User</th><th>Type</th><th>IP</th><th>Detail</th></tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id}>
                  <td className="mono">{formatDate(i.ts)}</td>
                  <td>{i.user}</td>
                  <td><span className={`chip ${i.type}`}>{i.type}</span></td>
                  <td className="mono">{i.ip}</td>
                  <td className="detail">{i.detail}</td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={5} className="muted">No activity found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;

