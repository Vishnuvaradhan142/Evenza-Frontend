import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiSave, FiDownload, FiUpload, FiX } from "react-icons/fi";
import "./RegistrationFormDesigner.css";

const DEFAULT_FIELDS = [
  { id: 1, type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
  { id: 2, type: "email", label: "Email", placeholder: "name@example.com", required: true },
];

const fieldTypes = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Paragraph" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
  { type: "number", label: "Number" },
  { type: "date", label: "Date" },
  { type: "select", label: "Select" },
  { type: "checkbox", label: "Checkbox" },
  // Event-wise special fields
  { type: "ticket", label: "Ticket" },
  { type: "payment", label: "Payment (QR + Proof)" },
  { type: "consent", label: "Consent Form (PDF)" },
  { type: "year", label: "Year" },
  { type: "section", label: "Section" },
];

const STORAGE_KEY_PREFIX = "evenza.registration.form.design."; // store per event id

const MOCK_ACTIVE_EVENTS = [
  { id: "E-201", name: "TechNova Hackathon 2025", date: "2025-10-18", image: "https://source.unsplash.com/640x360/?hackathon,tech", status: "Upcoming" },
  { id: "E-202", name: "Annual Cultural Fest", date: "2025-11-05", image: "https://source.unsplash.com/640x360/?festival,concert", status: "Upcoming" },
  { id: "E-203", name: "AI & Robotics Expo", date: "2025-12-01", image: "https://source.unsplash.com/640x360/?robotics,ai", status: "Upcoming" },
  { id: "E-204", name: "Photography Masterclass", date: "2025-09-20", image: "https://source.unsplash.com/640x360/?photography,class", status: "Ongoing" },
];

export default function RegistrationFormDesigner() {
  // event selection
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fields, setFields] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formTitle, setFormTitle] = useState("Event Registration");
  const [formDesc, setFormDesc] = useState("Please complete the form below.");
  const [notice, setNotice] = useState("");
  // Close on ESC
  useEffect(() => {
    if (!selectedEvent) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedEvent(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEvent]);

  // load active events (mock; replace with API if available)
  useEffect(() => {
    setEvents(MOCK_ACTIVE_EVENTS);
  }, []);

  // whenever an event is picked, load its saved design
  useEffect(() => {
    if (!selectedEvent) return;
    const key = STORAGE_KEY_PREFIX + selectedEvent.id;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        let loaded = parsed.fields || DEFAULT_FIELDS;
        // Migration: consolidate paymentQr/paymentProof into a single 'payment' field
        const hasPayment = loaded.some(f => f.type === 'payment');
        const hasQR = loaded.some(f => f.type === 'paymentQr');
        const hasProof = loaded.some(f => f.type === 'paymentProof');
        if (!hasPayment && (hasQR || hasProof)) {
          const required = !!loaded.find(f => f.type === 'paymentQr' || f.type === 'paymentProof')?.required;
          loaded = loaded.filter(f => f.type !== 'paymentQr' && f.type !== 'paymentProof');
          loaded.push({ id: Date.now(), type: 'payment', label: 'Payment', required });
        }
        setFields(loaded);
        setFormTitle(parsed.title || `${selectedEvent.name} Registration`);
        setFormDesc(parsed.desc || "Please complete the form below.");
        return;
      }
    } catch {}
    setFields(DEFAULT_FIELDS);
    setFormTitle(`${selectedEvent.name} Registration`);
    setFormDesc("Please complete the form below.");
  }, [selectedEvent]);

  const addField = (type) => {
    // Uniqueness: allow multiples only for text and textarea
    const allowMultiple = ["text", "textarea"]; 
    if (!allowMultiple.includes(type) && fields.some(f => f.type === type)) {
      setNotice(`"${fieldTypes.find(ft=>ft.type===type)?.label || type}" can be added only once.`);
      setTimeout(()=>setNotice(""), 2200);
      return;
    }
    const id = Date.now();
    const human = (s)=> s.charAt(0).toUpperCase() + s.slice(1);
    const base = { id, type, label: `${human(type)}${type==='text'?' Field':''}`, required: false };
    if (type === "select") base.options = "Option A, Option B, Option C"; // comma separated editing UI
    if (["text","email","phone","number","date","textarea"].includes(type)) base.placeholder = "";
    if (type === "ticket") { base.label = "Ticket"; base.options = "General, VIP"; }
  if (type === "payment") { base.label = "Payment"; base.qrUrl = ""; }
  if (type === "consent") { base.label = "Consent Form (Parent)"; }
    if (type === "year") { base.label = "Year"; base.options = "1st Year, 2nd Year, 3rd Year, 4th Year"; }
    if (type === "section") { base.label = "Section"; base.options = "A, B, C, D"; }
    setFields((f) => [...f, base]);
    setSelected(id);
  };

  const updateField = (id, patch) => setFields((f) => f.map(x => x.id === id ? { ...x, ...patch } : x));
  const removeField = (id) => {
    setFields((f) => f.filter(x => x.id !== id));
    if (selected === id) setSelected(null);
  };

  const moveField = (id, dir) => {
    setFields((arr) => {
      const idx = arr.findIndex(x => x.id === id);
      const nextIdx = dir === "up" ? Math.max(0, idx - 1) : Math.min(arr.length - 1, idx + 1);
      if (idx === nextIdx || idx === -1) return arr;
      const copy = arr.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    });
  };

  const saveDesign = () => {
    if (!selectedEvent) return;
    const payload = { title: formTitle, desc: formDesc, fields };
    localStorage.setItem(STORAGE_KEY_PREFIX + selectedEvent.id, JSON.stringify(payload));
    alert("Saved locally for " + selectedEvent.name);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ title: formTitle, desc: formDesc, fields, event: selectedEvent }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${selectedEvent ? selectedEvent.id + "-" : ""}registration-form.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result || '{}'));
        setFormTitle(obj.title || formTitle);
        setFormDesc(obj.desc || formDesc);
        setFields(Array.isArray(obj.fields) ? obj.fields : fields);
      } catch {}
    };
    reader.readAsText(file);
  };

  const preview = useMemo(() => fields.map((f) => {
    const common = (
      <label className="rfd-label">
        {f.label}{f.required && <span className="req">*</span>}
      </label>
    );
    if (f.type === "select" || f.type === "ticket" || f.type === "year" || f.type === "section") {
      const opts = String(f.options || "").split(",").map(s => s.trim()).filter(Boolean);
      return (
        <div key={f.id} className="rfd-form-row">
          {common}
          <select required={f.required} className="rfd-input">
            <option value="">Select...</option>
            {opts.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    if (f.type === "checkbox") {
      return (
        <div key={f.id} className="rfd-form-row">
          <label className="rfd-checkbox">
            <input type="checkbox" required={f.required} /> {f.label}
          </label>
        </div>
      );
    }
    if (f.type === "payment") {
      return (
        <div key={f.id} className="rfd-form-row">
          {common}
          <div className="rfd-subgroup">
            {(f.qrData || f.qrUrl) ? (
              <img className="rfd-qr-preview" src={f.qrData || f.qrUrl} alt="Payment QR" />
            ) : (
              <div className="rfd-sublabel">QR image not set (configure in builder)</div>
            )}
            <label className="rfd-sublabel">Payment Proof (PDF)</label>
            <input className="rfd-input" type="file" accept="application/pdf" required={f.required} />
          </div>
        </div>
      );
    }
    if (f.type === "consent") {
      return (
        <div key={f.id} className="rfd-form-row">
          {common}
          <input className="rfd-input" type="file" accept="application/pdf" required={f.required} />
        </div>
      );
    }
    const typeMap = { text:"text", email:"email", phone:"tel", number:"number", date:"date" };
    const inputType = typeMap[f.type] || (f.type === "textarea" ? null : "text");
    return (
      <div key={f.id} className="rfd-form-row">
        {common}
        {f.type === "textarea" ? (
          <textarea className="rfd-input" placeholder={f.placeholder || ""} required={f.required} rows={4} />
        ) : (
          <input className="rfd-input" type={inputType} placeholder={f.placeholder || ""} required={f.required} />
        )}
      </div>
    );
  }), [fields]);

  return (
    <div className="rfd-page">
      <header className="rfd-header">
        <div>
          <h1 className="rfd-title">Registration Form Designer</h1>
          <p className="rfd-sub">Pick an active event to design its registration form. Designs are saved per event.</p>
        </div>
      </header>

      {/* Active Events Grid */}
      <section className="rfd-events">
        <div className="rfd-event-grid">
          {events.filter(ev => ev.status === 'Upcoming').map((ev) => (
            <button key={ev.id} className="rfd-event-card" onClick={() => setSelectedEvent(ev)}>
              <div className="rfd-event-img" style={{backgroundImage:`url(${ev.image})`}} />
              <div className="rfd-event-info">
                <h4 className="rfd-event-name">{ev.name}</h4>
                <div className="rfd-event-meta">{new Date(ev.date).toDateString()} • {ev.status}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Designer Modal */}
      {selectedEvent && (
        <div className="rfd-modal" role="dialog" aria-modal="true">
          <div className="rfd-modal__backdrop" onClick={() => setSelectedEvent(null)} />
          <div className="rfd-modal__panel">
            <div className="rfd-modal__header">
              <div className="rfd-modal__title">
                <img src={selectedEvent.image} alt="event" />
                <div>
                  <h3>{selectedEvent.name}</h3>
                  <p>{new Date(selectedEvent.date).toDateString()} • {selectedEvent.status}</p>
                </div>
              </div>
              <div className="rfd-actions">
                <label className="btn ghost" title="Import JSON">
                  <FiUpload /> Import
                  <input type="file" accept="application/json" onChange={onImport} style={{ display:'none' }} />
                </label>
                <button className="btn ghost" onClick={saveDesign}><FiSave /> Save</button>
                <button className="btn ghost" onClick={exportJSON}><FiDownload /> Export</button>
                <button className="btn" onClick={() => setSelectedEvent(null)} aria-label="Close"><FiX /> Close</button>
              </div>
            </div>

            <section className="rfd-grid">
        {/* Palette */}
        <aside className="rfd-palette">
          <h3>Fields</h3>
          <div className="rfd-palette-grid">
            {fieldTypes.map(ft => (
              <button key={ft.type} className="chip" onClick={() => addField(ft.type)}><FiPlus /> {ft.label}</button>
            ))}
          </div>
          {notice && <div style={{marginTop:8, color:'#b91c1c', fontWeight:700}}>{notice}</div>}
          <div className="rfd-form-meta">
            <label>Form Title
              <input value={formTitle} onChange={(e)=>setFormTitle(e.target.value)} />
            </label>
            <label>Tagline
              <input value={formDesc} onChange={(e)=>setFormDesc(e.target.value)} />
            </label>
          </div>
        </aside>

        {/* Builder list */}
        <main className="rfd-builder">
          {fields.length === 0 ? (
            <div className="rfd-empty">No fields yet. Use the palette to add fields.</div>
          ) : (
            fields.map((f, idx) => (
              <div key={f.id} className={`rfd-item ${selected===f.id? 'active':''}`} onClick={()=>setSelected(f.id)}>
                <div className="rfd-item-row">
                  <strong>{f.label}</strong>
                  <div className="rfd-item-actions">
                    <button title="Move up" onClick={()=>moveField(f.id,'up')}><FiArrowUp /></button>
                    <button title="Move down" onClick={()=>moveField(f.id,'down')}><FiArrowDown /></button>
                    <button title="Remove" className="danger" onClick={()=>removeField(f.id)}><FiTrash2 /></button>
                  </div>
                </div>
                <div className="rfd-edit-grid">
                  <label>Label<input value={f.label} onChange={(e)=>updateField(f.id,{label:e.target.value})} /></label>
                  {!(f.type === 'checkbox' || f.type === 'consent' || f.type === 'payment') && (
                    <label>Placeholder<input value={f.placeholder||''} onChange={(e)=>updateField(f.id,{placeholder:e.target.value})} /></label>
                  )}
                  {(f.type==='select' || f.type==='ticket' || f.type==='year' || f.type==='section') && (
                    <label>Options (comma separated)
                      <input value={f.options||''} onChange={(e)=>updateField(f.id,{options:e.target.value})} />
                    </label>
                  )}
                  {f.type==='payment' && (
                    <>
                      <label>QR Image URL
                        <input value={f.qrUrl || ''} onChange={(e)=>updateField(f.id,{qrUrl:e.target.value})} placeholder="https://..." />
                      </label>
                      <label>Upload QR Image
                        <input type="file" accept="image/*" onChange={(e)=>{
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => updateField(f.id, { qrData: reader.result });
                          reader.readAsDataURL(file);
                        }} />
                      </label>
                    </>
                  )}
                  <label className="rfd-row-inline">
                    <input type="checkbox" checked={!!f.required} onChange={(e)=>updateField(f.id,{required:e.target.checked})} /> Required
                  </label>
                  <div className="rfd-type-tag">Type: {f.type}</div>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Preview */}
        <aside className="rfd-preview">
          <div className="preview-card">
            <h3 className="pv-title">{formTitle}</h3>
            <p className="pv-sub">{formDesc}</p>
            <form className="pv-form" onSubmit={(e)=>e.preventDefault()}>
              {preview}
              <div className="pv-actions">
                <button className="btn primary" type="submit">Submit</button>
              </div>
            </form>
          </div>
        </aside>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
