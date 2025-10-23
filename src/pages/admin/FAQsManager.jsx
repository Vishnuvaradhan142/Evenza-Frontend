import React, { useMemo, useRef, useState } from 'react';
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiTag, FiHelpCircle, FiMove } from 'react-icons/fi';
import './FAQsManager.css';

// Admin FAQ Config: Manage FAQs in one place (local state only)
export default function FAQsManager() {
  const [faqs, setFaqs] = useState([
    { id: 1, question: 'How to register?', answer: 'Go to event page and click Register.', category: 'General', updatedAt: '2d ago' },
    { id: 2, question: 'Refund policy?', answer: 'Refunds available 48 hours before event.', category: 'Payments', updatedAt: '5d ago' },
    { id: 3, question: 'Where is the venue?', answer: 'Main Auditorium, Block A.', category: 'Logistics', updatedAt: '1d ago' },
  ]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [draft, setDraft] = useState({ question: '', answer: '', category: 'General' });
  const [editingId, setEditingId] = useState(null);
  const dragIndex = useRef(null);

  const categories = useMemo(() => {
    const set = new Set(faqs.map(f => f.category));
    return ['General', 'Payments', 'Logistics', ...Array.from(set).filter(c => !['General','Payments','Logistics'].includes(c))];
  }, [faqs]);

  const filtered = useMemo(() => {
    let list = [...faqs];
    if (filterCategory !== 'all') list = list.filter(f => f.category === filterCategory);
    const s = search.trim().toLowerCase();
    if (s) list = list.filter(f => f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s));
    return list;
  }, [faqs, search, filterCategory]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({ question: item.question, answer: item.answer, category: item.category });
  };
  const cancelEdit = () => { setEditingId(null); setDraft({ question: '', answer: '', category: 'General' }); };

  const add = () => {
    if (!draft.question.trim() || !draft.answer.trim()) return;
    setFaqs(prev => [
      { id: Date.now(), ...draft, updatedAt: 'just now' },
      ...prev,
    ]);
    setDraft({ question: '', answer: '', category: 'General' });
  };
  const save = () => {
    if (!editingId) return;
    setFaqs(prev => prev.map(f => f.id === editingId ? { ...f, ...draft, updatedAt: 'just now' } : f));
    cancelEdit();
  };
  const remove = (id) => setFaqs(prev => prev.filter(f => f.id !== id));

  // Drag & drop reorder (local only)
  const onDragStart = (idx) => (e) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (idx) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (idx) => (e) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === idx) return;
    setFaqs(prev => {
      const clone = [...prev];
      const [moved] = clone.splice(from, 1);
      clone.splice(idx, 0, moved);
      return clone;
    });
    dragIndex.current = null;
  };
  const onDragEnd = () => { dragIndex.current = null; };

  return (
    <div className="faq-config-page">
      <header className="faq-header">
        <h1 className="page-title"><FiHelpCircle /> FAQ Configuration</h1>
        <p className="subtitle">Create, edit, categorize and reorder FAQs displayed to users.</p>
      </header>

      <section className="fc-controls">
        <div className="fc-search-wrap">
          <div className="fc-search">
            <FiSearch />
            <input placeholder="Search question or answer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="faq-stats">
            <span className="stat-chip">Total: {faqs.length}</span>
            <span className="stat-chip">Showing: {filtered.length}</span>
          </div>
        </div>
        <div className="cat-chips" role="tablist" aria-label="FAQ categories">
          <button className={filterCategory === 'all' ? 'chip active' : 'chip'} onClick={() => setFilterCategory('all')}>All</button>
          {categories.map(c => (
            <button key={c} className={filterCategory === c ? 'chip active' : 'chip'} onClick={() => setFilterCategory(c)}>{c}</button>
          ))}
        </div>
      </section>

      <div className="fc-composer">
        <input placeholder="Question" value={draft.question} onChange={e => setDraft(d => ({ ...d, question: e.target.value }))} />
        <input placeholder="Answer" value={draft.answer} onChange={e => setDraft(d => ({ ...d, answer: e.target.value }))} />
        <div className="fc-inline">
          <FiTag />
          <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {editingId ? (
          <div className="row">
            <button className="btn primary" onClick={save}><FiSave /> Save</button>
            <button className="btn secondary" onClick={cancelEdit}><FiX /> Cancel</button>
          </div>
        ) : (
          <button className="btn primary" onClick={add}><FiPlus /> Add FAQ</button>
        )}
      </div>

      <div className="fc-list" aria-live="polite">
        {filtered.length === 0 ? (
          <div className="empty">No FAQs match current filters.</div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.id}
              className="fc-item"
              draggable
              onDragStart={onDragStart(idx)}
              onDragOver={onDragOver(idx)}
              onDrop={onDrop(idx)}
              onDragEnd={onDragEnd}
              aria-grabbed={false}
              aria-label={`FAQ: ${item.question}`}
            >
              <div className="drag-handle" title="Drag to reorder"><FiMove /></div>
              <div className="fc-q">{item.question}</div>
              <div className="fc-a">{item.answer}</div>
              <div className="fc-meta">
                <span className="pill">{item.category}</span>
                <span className="muted">Updated {item.updatedAt}</span>
              </div>
              <div className="actions">
                <button className="icon-btn" title="Edit" onClick={() => startEdit(item)}><FiEdit2 /></button>
                <button className="icon-btn" title="Delete" onClick={() => remove(item.id)}><FiTrash2 /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
