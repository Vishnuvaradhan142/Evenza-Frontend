import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiTrash2, FiCheckCircle, FiUserCheck, FiDownload } from 'react-icons/fi';
import API from '../../api';
import './ReportsIssues.css';

const SAMPLE = [
  { id: 1, title: 'Broken ticket links', date: '2025-10-20', reporter: 'alice@example.com', type: 'bug', status: 'open', details: 'Tickets not sending confirmation.' },
  { id: 2, title: 'Offensive comment', date: '2025-10-18', reporter: 'bob@example.com', type: 'abuse', status: 'review', details: 'Reported abusive comment in chat.' },
  { id: 3, title: 'Payment failed repeatedly', date: '2025-10-15', reporter: 'carol@example.com', type: 'payment', status: 'resolved', details: 'Payment gateway returned 502 intermittently.' },
];

const KEY = 'owner_reports_v1';

export default function ReportsIssues(){
  const [items, setItems] = useState(()=>{
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SAMPLE;
  });
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        setLoading(true);
        const res = await API.get('/reports').catch(()=>null);
        if(!mounted) return;
        if(res && Array.isArray(res.data)) setItems(res.data);
      }catch(e){}
      finally{ setLoading(false); }
    })();
    return ()=> mounted = false;
  },[]);

  const filtered = useMemo(()=> items.filter(it=>{
    if(filter==='open' && it.status!=='open') return false;
    if(filter==='review' && it.status!=='review') return false;
    if(filter==='resolved' && it.status!=='resolved') return false;
    if(q && !(`${it.title} ${it.reporter} ${it.details}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items,q,filter]);

  const resolve = async (id)=>{
    try{ await API.put(`/reports/${id}`, { status: 'resolved' }).catch(()=>null); }catch(e){}
    setItems(s=> s.map(it=> it.id===id ? {...it, status:'resolved'} : it));
  };

  const assign = async (id)=>{
    // in this quick UI we just mark assigned by adding assignedTo
    const me = 'owner@company.com';
    try{ await API.put(`/reports/${id}`, { assignedTo: me }).catch(()=>null); }catch(e){}
    setItems(s=> s.map(it=> it.id===id ? {...it, assignedTo: me, status: it.status==='open' ? 'review' : it.status } : it));
  };

  const remove = async (id)=>{
    try{ await API.delete(`/reports/${id}`).catch(()=>null); }catch(e){}
    setItems(s=> s.filter(it=> it.id!==id));
    setSelected(prev=> prev && prev.id===id ? null : prev);
  };

  const exportCSV = ()=>{
    const header = ['id','title','date','reporter','type','status','assignedTo','details'].join(',');
    const rows = items.map(r=> [r.id, `"${(r.title||'').replace(/"/g,'""')}"`, r.date, `"${(r.reporter||'').replace(/"/g,'""')}"`, r.type||'', r.status||'', r.assignedTo||'', `"${(r.details||'').replace(/"/g,'""')}"`].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `reports-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="ri-page">
      <header className="ri-header">
        <div>
          <h2>Reports & Issues</h2>
          <p className="muted">Monitor and act on user reports across the platform.</p>
        </div>
        <div className="ri-controls">
          <div className="ri-search"><FiSearch /> <input placeholder="Search reports..." value={q} onChange={e=>setQ(e.target.value)} /></div>
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="btn export" onClick={exportCSV}><FiDownload /> Export</button>
        </div>
      </header>

      <div className="ri-list card">
        {loading && <div className="ri-loading">Loading reports...</div>}
        {!loading && filtered.length===0 && <div className="ri-empty">No reports found.</div>}
        {filtered.map(it=> (
          <div key={it.id} className={`ri-item ${it.status}`} onClick={()=> setSelected(it)}>
            <div className="left">
              <div className="title">{it.title}</div>
              <div className="meta">{it.date} • {it.reporter} • {it.type}</div>
            </div>
            <div className="right">
              {it.assignedTo && <div className="assigned">Assigned to {it.assignedTo}</div>}
              <div className="actions">
                {it.status!=='resolved' && <button className="btn" onClick={(e)=>{ e.stopPropagation(); resolve(it.id); }}><FiCheckCircle /> Resolve</button>}
                <button className="btn" onClick={(e)=>{ e.stopPropagation(); assign(it.id); }}><FiUserCheck /> Assign</button>
                <button className="btn danger" onClick={(e)=>{ e.stopPropagation(); remove(it.id); }}><FiTrash2 /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="ri-side">
          <div className="ri-side-card">
            <div className="ri-side-header">
              <h3>{selected.title}</h3>
              <div className="muted">{selected.date} • {selected.reporter}</div>
            </div>
            <div className="ri-details">
              <p><strong>Type:</strong> {selected.type}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <p><strong>Assigned:</strong> {selected.assignedTo || '—'}</p>
              <hr />
              <p>{selected.details}</p>
            </div>
            <div className="ri-side-actions">
              {selected.status!=='resolved' && <button className="btn" onClick={()=>{ resolve(selected.id); setSelected({...selected, status:'resolved'}); }}><FiCheckCircle /> Mark resolved</button>}
              <button className="btn" onClick={()=>{ assign(selected.id); setSelected(s=> ({...s, assignedTo: 'owner@company.com'})); }}><FiUserCheck /> Assign to me</button>
              <button className="btn" onClick={()=> setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
