import React, { useEffect, useRef, useState, useMemo } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiUpload, FiDownload, FiChevronUp, FiChevronDown, FiSave } from "react-icons/fi";
import "./EventCategory.css";

const LOCAL_KEY = "eventCategories";

const DEFAULT = [
  { id: 1, name: "Conferences", color: "#6c5ce7", icon: "🎤", order: 1 },
  { id: 2, name: "Workshops", color: "#00b894", icon: "🛠️", order: 2 },
  { id: 3, name: "Meetups", color: "#0984e3", icon: "🤝", order: 3 },
  { id: 4, name: "Webinars", color: "#fdcb6e", icon: "💻", order: 4 },
];

const EventCategory = () => {
  const [items, setItems] = useState(() => {
    const s = localStorage.getItem(LOCAL_KEY);
    return s ? JSON.parse(s) : DEFAULT;
  });
  const [dragId, setDragId] = useState(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }, [items]);

  const totalCategories = useMemo(() => items.length, [items]);
  const palettePreview = useMemo(() => items.slice(0, 5).map((c) => c.color), [items]);

  const saveNew = (cat) => {
    if (cat.id) {
      setItems((s) => s.map((it) => (it.id === cat.id ? { ...it, ...cat } : it)));
    } else {
      const next = { ...cat, id: Date.now(), order: items.length + 1 };
      setItems((s) => [...s, next]);
    }
    setOpen(false);
  };

  const doDelete = (id) => {
    setItems((s) => s.filter((it) => it.id !== id).map((it, i) => ({ ...it, order: i + 1 })));
    setConfirm(null);
  };

  const move = (id, dir) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const swap = dir === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= items.length) return;
    const next = items.slice();
    const tmp = next[swap];
    next[swap] = { ...next[swap], order: next[idx].order };
    next[idx] = { ...next[idx], order: tmp.order };
    // reorder by order
    next.sort((a, b) => a.order - b.order);
    setItems(next);
  };

  // Drag and drop reorder
  const onDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, targetId) => {
    e.preventDefault();
    if (dragId == null) return;
    if (dragId === targetId) { setDragId(null); return; }
    const srcIdx = items.findIndex((i) => i.id === dragId);
    const dstIdx = items.findIndex((i) => i.id === targetId);
    if (srcIdx === -1 || dstIdx === -1) return;
    const next = items.slice();
    const [moved] = next.splice(srcIdx, 1);
    next.splice(dstIdx, 0, moved);
    // reassign order based on new index
    const normalized = next.map((it, i) => ({ ...it, order: i + 1 }));
    setItems(normalized);
    setDragId(null);
  };

  const highlight = (text, q) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>
    );
  };

  const filtered = items.filter((it) => it.name.toLowerCase().includes(q.toLowerCase()));

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event-categories.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result);
        if (Array.isArray(parsed)) {
          // normalize
          const next = parsed.map((p, i) => ({ id: p.id ?? Date.now() + i, name: p.name ?? "Untitled", color: p.color ?? "#888", icon: p.icon ?? "🎫", order: i + 1 }));
          setItems(next);
        }
      } catch (err) {
        console.error(err);
        alert("Invalid JSON file");
      }
    };
    r.readAsText(f);
  };

  return (
    <div className="ec-page">
      <div className="ec-head">
        <div>
          <h2>Event Categories</h2>
          <p className="muted">Manage categories used when creating events. Add icons, colors and reorder.</p>
          <div className="ec-hero">
            <div className="hero-left">
              <div className="hero-title">Categories</div>
              <div className="hero-value">{totalCategories}</div>
            </div>
            <div className="hero-palette">
              {palettePreview.map((c, i) => (
                <span key={i} className="dot" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>

        <div className="ec-actions">
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJSON} />
          <button className="btn" onClick={() => fileRef.current?.click()} title="Import"><FiUpload /> Import</button>
          <button className="btn" onClick={exportJSON} title="Export"><FiDownload /> Export</button>
          <button className="btn primary" onClick={() => { setEditing(null); setOpen(true); }}><FiPlus /> Add Category</button>
        </div>
      </div>

      <div className="ec-controls">
        <input placeholder="Search categories..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="ec-list card">
        {filtered.length === 0 && <div className="empty">No categories found.</div>}
        {filtered.map((it, idx) => (
          <div
            className={`ec-item ${dragId === it.id ? "dragging" : ""}`}
            key={it.id}
            draggable
            onDragStart={(e) => onDragStart(e, it.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, it.id)}
          >
            <div className="left">
              <div className="badge" style={{ background: it.color }}>{it.icon}</div>
              <div className="meta">
                <div className="name">{highlight(it.name, q)}</div>
                <div className="small muted">Order: {it.order}</div>
              </div>
            </div>

            <div className="right">
              <button className="btn small" onClick={() => move(it.id, 'up')} title="Move up"><FiChevronUp /></button>
              <button className="btn small" onClick={() => move(it.id, 'down')} title="Move down"><FiChevronDown /></button>
              <button className="btn small ghost" onClick={() => { setEditing(it); setOpen(true); }} title="Edit"><FiEdit2 /></button>
              <button className="btn small danger" onClick={() => setConfirm(it)} title="Delete"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <CategoryModal onClose={() => setOpen(false)} onSave={saveNew} initial={editing} />
      )}

      {confirm && (
        <div className="confirm">
          <div className="confirm-card">
            <h3>Delete category?</h3>
            <p>Are you sure you want to delete <strong>{confirm.name}</strong>? This will remove it from existing events.</p>
            <div className="row">
              <button className="btn" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn danger" onClick={() => doDelete(confirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryModal = ({ onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? "#888");
  const [icon, setIcon] = useState(initial?.icon ?? "🎫");

  const submit = () => {
    if (!name.trim()) return alert("Please enter a name");
    onSave({ id: initial?.id, name: name.trim(), color, icon, order: initial?.order });
  };

  return (
    <div className="modal">
      <div className="modal-card">
        <h3>{initial ? "Edit category" : "Add category"}</h3>
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field two">
          <div>
            <label>Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div>
            <label>Icon (emoji)</label>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={submit}><FiSave /> Save</button>
        </div>
      </div>
    </div>
  );
};

export default EventCategory;
