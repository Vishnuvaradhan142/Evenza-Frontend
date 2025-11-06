import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiCheckCircle, FiXCircle, FiAlertCircle, FiEdit, FiDownload } from 'react-icons/fi';
import API from '../../api';
import './ContentModeration.css';

const SAMPLE = [
  { id: 1, type: 'post', author: 'Jane Doe', text: 'Check out this amazing event!', status: 'pending', created_at: '2025-10-20', notes: [] },
  { id: 2, type: 'comment', author: 'Tom Lee', text: 'I had a bad experience with the venue.', status: 'pending', created_at: '2025-10-18', notes: [] },
  { id: 3, type: 'review', author: 'Ali Khan', text: 'Great talks but food was poor.', status: 'approved', created_at: '2025-09-29', notes: [] },
];

const KEY = 'contentModerationItems_v1';

export default function ContentModeration(){
  const [items, setItems] = useState(()=> {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SAMPLE;
  });
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(()=> localStorage.setItem(KEY, JSON.stringify(items)), [items]);

  useEffect(()=>{
    // try to load from API
    let mounted = true;
    (async ()=>{
      try{
        const res = await API.get('/content?moderation=pending').catch(()=>null);
        if(!mounted) return;
        if(res && Array.isArray(res.data)) setItems(res.data);
      }catch(e){}
    })();
    return ()=> mounted=false;
  }, []);

  const filtered = useMemo(()=> items.filter(it=>{
    if(filterType!=='all' && it.type!==filterType) return false;
    if(filterStatus!=='all' && it.status!==filterStatus) return false;
    if(q && !(`${it.author} ${it.text} ${it.type}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, filterType, filterStatus]);

  const doApprove = async (id)=>{
    try{ await API.post(`/content/${id}/approve`).catch(()=>null); }catch(e){}
    setItems(s=> s.map(i=> i.id===id ? {...i, status:'approved'} : i));
  };

  const doRemove = async (id)=>{
    try{ await API.post(`/content/${id}/remove`).catch(()=>null); }catch(e){}
    setItems(s=> s.map(i=> i.id===id ? {...i, status:'removed'} : i));
    setConfirmDelete(null);
  };

  const doWarn = async (id) =>{
    const msg = window.prompt('Enter a warning message to send to the user:');
    if(!msg) return;
    try{ await API.post(`/users/warn`, { id, message: msg }).catch(()=>null); }catch(e){}
    setItems(s=> s.map(i=> i.id===id ? {...i, notes: [...(i.notes||[]), { type:'warn', message: msg, at: new Date().toISOString() }]} : i));
  };

  const addNote = (id)=>{
    const msg = window.prompt('Add internal note (visible to admins):');
    if(!msg) return;
    setItems(s=> s.map(i=> i.id===id ? {...i, notes: [...(i.notes||[]), { type:'note', message: msg, at: new Date().toISOString() }]} : i));
  };

  const exportCSV = ()=>{
    const header = ['id','type','author','text','status','created_at','notes'].join(',');
    const rows = items.map(i=> [i.id, i.type, `"${i.author.replace(/"/g,'""')}"`, `"${i.text.replace(/"/g,'""')}"`, i.status, i.created_at, `"${JSON.stringify(i.notes||[]).replace(/"/g,'""')}"`].join(','));
    const csv = [header, ...rows].join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download = `content-moderation-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="cm-page">
      <header className="cm-header">
        <div>
          <h2>Content Moderation</h2>
          <p className="muted">Review and moderate user-generated content across the platform.</p>
        </div>
        <div className="cm-actions">
          <div className="cm-search"><FiSearch /> <input placeholder="Search content or author..." value={q} onChange={e=>setQ(e.target.value)} /></div>
          <select value={filterType} onChange={e=> setFilterType(e.target.value)}>
            <option value="all">All types</option>
            <option value="post">Posts</option>
            <option value="comment">Comments</option>
            <option value="review">Reviews</option>
          </select>
          <select value={filterStatus} onChange={e=> setFilterStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="removed">Removed</option>
          </select>
          <button className="btn" onClick={exportCSV}><FiDownload /> Export</button>
        </div>
      </header>

      <div className="cm-list card">
        {filtered.length===0 && <div className="empty">No content found.</div>}
        {filtered.map(it=> (
          <div key={it.id} className={`cm-item ${it.status}`}>
            <div className="left">
              <div className="meta small muted">{it.type.toUpperCase()} • {it.created_at}</div>
              <div className="text">{it.text}</div>
              <div className="author muted small">by {it.author}</div>
              {it.notes && it.notes.length>0 && <div className="notes">{it.notes.map((n,idx)=> <div key={idx} className="note">{n.type}: {n.message} <span className="note-at muted small">{n.at.slice(0,10)}</span></div>)}</div>}
            </div>
            <div className="right">
              {it.status!=='approved' && <button className="btn success" title="Approve" onClick={()=> doApprove(it.id)}><FiCheckCircle /> Approve</button>}
              {it.status!=='removed' && <button className="btn danger" title="Remove" onClick={()=> setConfirmDelete(it.id)}><FiXCircle /> Remove</button>}
              <button className="btn" title="Warn" onClick={()=> doWarn(it.id)}><FiAlertCircle /> Warn</button>
              <button className="btn" title="Note" onClick={()=> addNote(it.id)}><FiEdit /> Note</button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div className="cm-modal">
          <div className="cm-modal-card">
            <h3>Remove content?</h3>
            <p>This action marks the content as removed. You can add a note explaining the reason.</p>
            <div className="row">
              <button className="btn" onClick={()=> setConfirmDelete(null)}>Cancel</button>
              <button className="btn danger" onClick={()=> doRemove(confirmDelete)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

