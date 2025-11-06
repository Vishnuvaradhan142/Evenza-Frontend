import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiPlus, FiTrash2, FiEdit, FiMail, FiUpload, FiDownload, FiBold, FiItalic } from "react-icons/fi";
import API from "../../api";
import './EmailTemplates.css';

const SAMPLE = [
  { id: 1, name: 'Welcome - Attendee', subject: 'Welcome to {{event}}', body: '<p>Hi {{name}},</p><p>Thanks for joining {{event}}. We\'re excited to have you!</p>', updated_at: '2025-10-10' },
  { id: 2, name: 'Reminder - 3 days', subject: 'Reminder: {{event}} starts soon', body: '<p>Hi {{name}},</p><p>Just a reminder that {{event}} starts on {{date}}.</p>', updated_at: '2025-09-30' },
];

const KEY = 'emailTemplates_v1';

export default function EmailTemplates(){
  const [templates, setTemplates] = useState(()=>{
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SAMPLE;
  });
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // template being edited
  const [previewHtml, setPreviewHtml] = useState('');
  const [sampleData, setSampleData] = useState({ name: 'Alex', event: 'Autumn Innovators Summit', date: 'Nov 12, 2025' });

  useEffect(()=> localStorage.setItem(KEY, JSON.stringify(templates)), [templates]);

  const filtered = useMemo(()=> templates.filter(t=> t.name.toLowerCase().includes(q.toLowerCase()) || t.subject.toLowerCase().includes(q.toLowerCase())), [templates,q]);

  const create = ()=>{
    const t = { id: Date.now(), name: 'New template', subject: '', body: '<p>Write your template here</p>', updated_at: new Date().toISOString().slice(0,10) };
    setTemplates(s=>[t,...s]);
    setEditing(t);
  };

  const save = async (tpl)=>{
    // attempt API persist
    try{ await API.post('/email-templates', tpl).catch(()=>null); }catch(e){}
    setTemplates(s=> s.map(x=> x.id===tpl.id ? {...tpl, updated_at: new Date().toISOString().slice(0,10)} : x));
    setEditing(null);
  };

  const remove = async (id)=>{
    if(!window.confirm('Delete template?')) return;
    try{ await API.delete(`/email-templates/${id}`).catch(()=>null); }catch(e){}
    setTemplates(s=> s.filter(x=>x.id!==id));
  };

  const sendTest = async (tpl)=>{
    const to = window.prompt('Send test to email (address)');
    if(!to) return;
    try{ await API.post(`/email-templates/${tpl.id}/send-test`, { to }).catch(()=>null); alert('Test sent (or simulated).'); }catch(e){ alert('Failed to send test.'); }
  };

  const exportJSON = ()=>{
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download = 'email-templates.json'; a.click(); URL.revokeObjectURL(url);
  };

  const importJSON = (file)=>{
    const r = new FileReader(); r.onload = (e)=>{
      try{ const data = JSON.parse(e.target.result); if(Array.isArray(data)) setTemplates(data.concat(templates)); else alert('Invalid file'); }catch(err){ alert('Invalid JSON'); }
    }; r.readAsText(file);
  };

  const insertAtCaret = (value) => {
    if(!editing) return;
    // naive insertion: append to body
    setEditing(e=> ({ ...e, body: (e.body||'') + value }));
    setPreviewHtml(prev => prev + value);
  };

  const renderPreview = (html) => {
    // quick variable replacement with sample data
    if(!html) return '';
    return html.replace(/{{\s*name\s*}}/g, sampleData.name)
               .replace(/{{\s*event\s*}}/g, sampleData.event)
               .replace(/{{\s*date\s*}}/g, sampleData.date);
  };

  return (
    <div className="et-page">
      <header className="et-header">
        <div>
          <h2>Email Templates</h2>
          <p className="muted">Design reusable email templates for event communications. Use variables like <code>{"{{name}}"}</code> and <code>{"{{event}}"}</code>.</p>
        </div>
        <div className="et-actions">
          <div className="et-search"><FiSearch /> <input placeholder="Search templates..." value={q} onChange={e=>setQ(e.target.value)} /></div>
          <button className="btn primary" onClick={create}><FiPlus /> New</button>
          <button className="btn" onClick={exportJSON}><FiDownload /> Export</button>
          <label className="btn"><FiUpload /> Import<input type="file" hidden onChange={e=> e.target.files && importJSON(e.target.files[0])} /></label>
        </div>
      </header>

      <div className="et-grid">
        <aside className="et-list card">
          {filtered.map(t=> (
            <div key={t.id} className="et-row">
              <div>
                <div className="name">{t.name}</div>
                <div className="subject muted">{t.subject}</div>
              </div>
              <div className="row-actions">
                <button className="btn" title="Edit" onClick={()=>{ setEditing(t); setPreviewHtml(t.body); }}><FiEdit /></button>
                <button className="btn" title="Send test" onClick={()=>sendTest(t)}><FiMail /></button>
                <button className="btn danger" title="Delete" onClick={()=>remove(t.id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </aside>

        <main className="et-card card">
          {!editing && <div className="empty">Select a template to preview or create a new one.</div>}
          {editing && (
            <div className="editor">
              <div className="et-toolbar card">
                <div className="tools">
                  <button className="btn" onClick={()=> insertAtCaret('<strong>') } title="Bold"><FiBold /></button>
                  <button className="btn" onClick={()=> insertAtCaret('<em>') } title="Italic"><FiItalic /></button>
                  <button className="btn" onClick={()=> insertAtCaret('{{name}}') } title="Insert name">{"{{name}}"}</button>
                  <button className="btn" onClick={()=> insertAtCaret('{{event}}') } title="Insert event">{"{{event}}"}</button>
                  <button className="btn" onClick={()=> insertAtCaret('{{date}}') } title="Insert date">{"{{date}}"}</button>
                </div>
                <div className="sample-inputs">
                  <input value={sampleData.name} onChange={e=> setSampleData(s=>({...s, name:e.target.value}))} placeholder="Sample name" />
                  <input value={sampleData.event} onChange={e=> setSampleData(s=>({...s, event:e.target.value}))} placeholder="Sample event" />
                  <input value={sampleData.date} onChange={e=> setSampleData(s=>({...s, date:e.target.value}))} placeholder="Sample date" />
                </div>
              </div>
              <input value={editing.name} onChange={e=> setEditing({...editing, name: e.target.value})} className="et-input" />
              <input value={editing.subject} onChange={e=> setEditing({...editing, subject: e.target.value})} className="et-input" />
              <textarea rows={12} value={editing.body} onChange={e=> { setEditing({...editing, body: e.target.value}); setPreviewHtml(e.target.value); }} />
              <div className="editor-actions">
                <button className="btn" onClick={()=> setEditing(null)}>Cancel</button>
                <button className="btn primary" onClick={()=> save(editing)}>Save template</button>
              </div>
              <div className="preview">
                <h4>Live preview</h4>
                <div className="preview-card" dangerouslySetInnerHTML={{ __html: renderPreview(previewHtml) }} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
