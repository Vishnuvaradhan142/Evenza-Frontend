import React, { useEffect, useState } from 'react';
import { FiDownload, FiUpload, FiRefreshCw } from 'react-icons/fi';
import './DesignEditor.css';

const DEFAULT = {
  '--primary': '#6366f1',
  '--background': '#ffffff',
  '--text': '#111827',
  '--muted': '#6b7280',
  '--radius': '12px',
  'fontFamily': 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
};

const KEY = 'designVariables_v1';

export default function DesignEditor(){
  const [vars, setVars] = useState(()=>{
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : DEFAULT;
  });

  useEffect(()=>{
    // apply CSS variables
    Object.keys(vars).forEach(k=>{
      if(k.startsWith('--')) document.documentElement.style.setProperty(k, vars[k]);
      else if(k==='fontFamily') document.documentElement.style.setProperty('--font-family', vars[k]);
    });
    localStorage.setItem(KEY, JSON.stringify(vars));
  }, [vars]);

  const update = (k,v) => setVars(s=> ({ ...s, [k]: v }));

  const reset = ()=>{
    setVars(DEFAULT);
  };

  const exportJSON = ()=>{
    const blob = new Blob([JSON.stringify(vars, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='design-vars.json'; a.click(); URL.revokeObjectURL(url);
  };

  const importJSON = (file)=>{
    const r = new FileReader(); r.onload = ()=>{
      try{ const data = JSON.parse(r.result); setVars({...DEFAULT, ...data}); }catch(e){ alert('Invalid file'); }
    }; r.readAsText(file);
  };

  return (
    <div className="de-page">
      <header className="de-header">
        <div>
          <h2>Design Editor</h2>
          <p className="muted">Edit theme variables live. Changes apply immediately to the app for quick preview.</p>
        </div>
        <div className="de-actions">
          <button className="btn" onClick={exportJSON}><FiDownload /> Export</button>
          <label className="btn"><FiUpload /> Import<input type="file" hidden onChange={e=> e.target.files && importJSON(e.target.files[0])} /></label>
          <button className="btn" onClick={reset}><FiRefreshCw /> Reset</button>
        </div>
      </header>

      <div className="de-grid">
        <div className="de-card card">
          <h3>Colors</h3>
          <div className="row">
            <label>Primary</label>
            <input type="color" value={vars['--primary']} onChange={e=> update('--primary', e.target.value)} />
          </div>
          <div className="row">
            <label>Background</label>
            <input type="color" value={vars['--background']} onChange={e=> update('--background', e.target.value)} />
          </div>
          <div className="row">
            <label>Text</label>
            <input type="color" value={vars['--text']} onChange={e=> update('--text', e.target.value)} />
          </div>
        </div>

        <div className="de-card card">
          <h3>Layout</h3>
          <div className="row">
            <label>Radius</label>
            <input value={vars['--radius']} onChange={e=> update('--radius', e.target.value)} />
          </div>
          <div className="row">
            <label>Font family</label>
            <input value={vars['fontFamily']} onChange={e=> update('fontFamily', e.target.value)} />
          </div>
        </div>

        <div className="de-preview card">
          <h3>Preview</h3>
          <div className="preview-sample">
            <div className="sample-card">
              <h4 style={{ color: 'var(--primary)' }}>Event Title</h4>
              <p style={{ color: 'var(--text)' }}>This is a preview of the design system — buttons, cards and text will reflect the chosen variables.</p>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn primary">Primary</button>
                <button className="btn">Neutral</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

