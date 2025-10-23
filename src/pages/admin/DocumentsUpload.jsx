import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiUpload,
  FiFileText,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiX,
  FiZoomIn,
  FiZoomOut,
  FiDownload,
} from "react-icons/fi";
import "./DocumentsUpload.css";

const ACCEPTED_EXTS = [
  // Images
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  // Documents
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".csv",
];

function bytesToSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function extFromName(name) {
  const idx = name.lastIndexOf(".");
  return idx > -1 ? name.slice(idx).toLowerCase() : "";
}

function typeFromExt(ext) {
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext)) return "Image";
  if ([".pdf"].includes(ext)) return "PDF";
  if ([".doc", ".docx"].includes(ext)) return "Word";
  if ([".ppt", ".pptx"].includes(ext)) return "PowerPoint";
  if ([".xls", ".xlsx"].includes(ext)) return "Excel";
  if ([".txt"].includes(ext)) return "Text";
  if ([".csv"].includes(ext)) return "CSV";
  return "Document";
}

export default function DocumentsUpload() {
  const [items, setItems] = useState([]); // {id, file, name, size, ext, type, status, progress, error}
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const timersRef = useRef(new Map());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const EVENT_OPTIONS = useMemo(() => [
    "Orientation Week",
    "Tech Expo",
    "App Launch",
    "Volunteer Drive",
    "Safety Workshop",
    "General",
  ], []);
  const [selectedEvent, setSelectedEvent] = useState("General");
  const [filterEvent, setFilterEvent] = useState("All Events");
  const [preview, setPreview] = useState({ open: false, mode: "none", url: "", text: "", name: "", file: null });
  const docxContainerRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current; // capture current ref value for cleanup
    return () => {
      timers.forEach((t) => clearInterval(t));
      timers.clear();
    };
  }, []);

  const onBrowse = () => inputRef.current?.click();

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    setItems((prev) => {
      const existingKeys = new Set(prev.map((p) => `${p.name}|${p.size}|${p.event || ""}`));
      const next = [...prev];
      for (const file of incoming) {
        const ext = extFromName(file.name);
        if (!ACCEPTED_EXTS.includes(ext)) continue; // skip unsupported types
        const key = `${file.name}|${file.size}|${selectedEvent}`;
        if (existingKeys.has(key)) continue; // prevent duplicates
        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          name: file.name,
          size: file.size,
          ext,
          type: typeFromExt(ext),
          status: "Ready",
          progress: 0,
          error: "",
          event: selectedEvent,
        });
      }
      return next;
    });
  }, [selectedEvent]);

  const handleInput = (e) => {
    addFiles(e.target.files);
    // Allow selecting the same file again
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const startUpload = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, status: "Uploading", progress: 0, error: "" }
          : it
      )
    );
    const t = setInterval(() => {
      setItems((prev) => {
        const it = prev.find((x) => x.id === id);
        if (!it || it.status !== "Uploading") return prev;
        const bump = Math.min(100, it.progress + Math.floor(Math.random() * 15) + 5);
        const updated = prev.map((row) =>
          row.id === id ? { ...row, progress: bump } : row
        );
        if (bump >= 100) {
          clearInterval(t);
          timersRef.current.delete(id);
          return updated.map((row) =>
            row.id === id ? { ...row, status: "Uploaded" } : row
          );
        }
        return updated;
      });
    }, 350);
    timersRef.current.set(id, t);
  };

  const uploadAll = () => {
    const eligible = items.filter((it) => ["Ready", "Error"].includes(it.status));
    eligible.forEach((it) => startUpload(it.id));
  };

  const removeItem = (id) => {
    const t = timersRef.current.get(id);
    if (t) {
      clearInterval(t);
      timersRef.current.delete(id);
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const retryItem = (id) => {
    startUpload(id);
  };

  const anyUploading = useMemo(() => items.some((i) => i.status === "Uploading"), [items]);
  const uploadedCount = useMemo(() => items.filter((i) => i.status === "Uploaded").length, [items]);
  const selectedCount = selectedIds.size;

  const presentEvents = useMemo(
    () => Array.from(new Set(items.map((i) => i.event).filter(Boolean))),
    [items]
  );
  const filteredItems = useMemo(
    () => items.filter((i) => filterEvent === "All Events" || i.event === filterEvent),
    [items, filterEvent]
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const uploadSelected = () => {
    const eligible = items.filter((it) => selectedIds.has(it.id) && ["Ready", "Error"].includes(it.status));
    eligible.forEach((it) => startUpload(it.id));
  };

  const removeSelected = () => {
    const removable = items.filter((it) => selectedIds.has(it.id) && it.status !== "Uploading");
    removable.forEach((it) => removeItem(it.id));
  };

  const isImageExt = (ext) => [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);
  const isPdfExt = (ext) => ext === ".pdf";
  const isTextExt = (ext) => [".txt", ".csv"].includes(ext);
  const isWordExt = (ext) => [".doc", ".docx"].includes(ext); // .doc falls back
  const isPptExt = (ext) => [".ppt", ".pptx"].includes(ext);   // .ppt falls back

  const closePreview = () => {
    if (preview.url) {
      try { URL.revokeObjectURL(preview.url); } catch (_) {}
    }
    setPreview({ open: false, mode: "none", url: "", text: "", name: "", file: null });
    setZoom(1);
  };

  const openPreview = async (it) => {
    if (!it?.file) {
      setPreview({ open: true, mode: "none", url: "", text: "", name: it?.name || "", file: null });
      return;
    }
    const ext = it.ext.toLowerCase();
    if (isImageExt(ext) || isPdfExt(ext)) {
      const url = URL.createObjectURL(it.file);
      setPreview({ open: true, mode: isImageExt(ext) ? "image" : "pdf", url, text: "", name: it.name, file: it.file });
      setZoom(1);
      return;
    }
    if (isWordExt(ext)) {
      try {
        // Only .docx can be rendered; .doc will fall back to none
        if (ext === ".docx") {
          setPreview({ open: true, mode: "docx", url: "", text: "", name: it.name, file: it.file });
          setZoom(1);
          // Render into container after state updates in next tick
          setTimeout(async () => {
            const container = docxContainerRef.current;
            if (container) {
              container.innerHTML = "";
              const mod = await import("docx-preview");
              const renderDocx = mod.renderAsync || mod.default?.renderAsync;
              if (renderDocx) {
                await renderDocx(it.file, container, undefined, { inWrapper: true });
              }
            }
          }, 0);
          return;
        }
      } catch (e) {
        console.warn("DOCX preview failed", e);
      }
      setPreview({ open: true, mode: "none", url: "", text: "", name: it.name, file: it.file });
      setZoom(1);
      return;
    }
    if (isPptExt(ext)) {
      // No preview available for PowerPoint files
      setPreview({ open: true, mode: "none", url: "", text: "", name: it.name, file: it.file });
      setZoom(1);
      return;
    }
    if (isTextExt(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview({ open: true, mode: "text", url: "", text: String(reader.result || ""), name: it.name, file: it.file });
        setZoom(1);
      };
      reader.onerror = () => {
        setPreview({ open: true, mode: "none", url: "", text: "", name: it.name, file: it.file });
        setZoom(1);
      };
      reader.readAsText(it.file);
      return;
    }
    setPreview({ open: true, mode: "none", url: "", text: "", name: it.name, file: it.file });
    setZoom(1);
  };

  const downloadCurrent = () => {
    if (!preview.open) return;
    let url = preview.url;
    let revokeAfter = false;
    if (!url && preview.file) {
      url = URL.createObjectURL(preview.file);
      revokeAfter = true;
    }
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = preview.name || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (revokeAfter) {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }
  };

  const zoomIn = () => setZoom(z => Math.min(3, parseFloat((z + 0.1).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))));
  const resetZoom = () => setZoom(1);

  return (
    <div className="docs-page">
      <header className="docs-header">
        <div className="titles">
          <h1 className="page-title">
            <FiUpload /> Documents Upload
          </h1>
          <p className="subtitle">Upload and manage event documents (frontend-only).</p>
        </div>
      </header>

      <section className="docs-actions">
        <div className="event-select" role="group" aria-label="Upload target event">
          <label htmlFor="event-select">Upload to event:</label>
          <select id="event-select" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
            {EVENT_OPTIONS.map((ev) => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
        </div>
        <div
          className={`dropzone ${isDragging ? "dragging" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="button"
          tabIndex={0}
          onClick={onBrowse}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTS.join(",")}
            multiple
            onChange={handleInput}
            onClick={(e) => { e.currentTarget.value = ""; }}
            style={{ display: "none" }}
          />
          <div className="dz-icon">
            <FiUpload />
          </div>
          <div className="dz-text">
            <strong>Drag & drop</strong> files here, or <span className="link">browse</span>
            <div className="muted">Accepted: {ACCEPTED_EXTS.join(", ")}</div>
          </div>
        </div>
        <div className="docs-buttons">
          <button className="btn primary" onClick={uploadAll} disabled={!items.length || anyUploading}>
            <FiUpload /> Upload All
          </button>
          <button className="btn" onClick={uploadSelected} disabled={!selectedCount}>
            <FiUpload /> Upload Selected
          </button>
          <button className="btn" onClick={removeSelected} disabled={!selectedCount}>
            <FiTrash2 /> Remove Selected
          </button>
          <div className="stats">
            <span className="badge">Selected: {selectedCount}</span>
            <span className="badge success">Uploaded: {uploadedCount}</span>
          </div>
        </div>
        <div className="filter-select" role="group" aria-label="Filter by event">
          <label htmlFor="filter-select">Filter by event:</label>
          <select id="filter-select" value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
            <option>All Events</option>
            {presentEvents.map((ev) => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="docs-table-container">
        <table className="docs-table">
          <thead>
            <tr>
              <th className="select-cell">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={filteredItems.length > 0 && filteredItems.every((i) => selectedIds.has(i.id))}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (checked) {
                        filteredItems.forEach((i) => next.add(i.id));
                      } else {
                        filteredItems.forEach((i) => next.delete(i.id));
                      }
                      return next;
                    });
                  }}
                />
              </th>
              <th>File</th>
              <th>Event</th>
              <th>Type</th>
              <th>Size</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-rows">{items.length ? 'No files for this event.' : 'No files added yet.'}</td>
              </tr>
            ) : (
              filteredItems.map((it) => (
                <tr key={it.id}>
                  <td className="select-cell">
                    <input
                      type="checkbox"
                      aria-label={`Select ${it.name}`}
                      checked={selectedIds.has(it.id)}
                      onChange={() => toggleSelect(it.id)}
                    />
                  </td>
                  <td>
                    <div className="file-cell">
                      <FiFileText className="ficon" />
                      <div className="meta">
                        <div className="name" title={it.name}>{it.name}</div>
                        <div className="muted">{it.ext.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td>{it.event}</td>
                  <td>{it.type}</td>
                  <td>{bytesToSize(it.size)}</td>
                  <td>
                    {it.status === "Uploaded" && (
                      <span className="chip success"><FiCheckCircle /> Uploaded</span>
                    )}
                    {it.status === "Uploading" && (
                      <span className="chip info">Uploading…</span>
                    )}
                    {it.status === "Ready" && (
                      <span className="chip">Ready</span>
                    )}
                    {it.status === "Error" && (
                      <span className="chip danger"><FiAlertCircle /> Error</span>
                    )}
                  </td>
                  <td>
                    <div className="progress">
                      <div className="bar" style={{ width: `${it.progress}%` }} />
                    </div>
                    <div className="muted small">{it.progress}%</div>
                  </td>
                  <td className="actions">
                    <button className="icon-btn" onClick={() => openPreview(it)} title="Preview">
                      <FiEye />
                    </button>
                    {it.status === "Ready" && (
                      <button className="icon-btn" onClick={() => startUpload(it.id)} title="Upload">
                        <FiUpload />
                      </button>
                    )}
                    {it.status === "Error" && (
                      <button className="icon-btn" onClick={() => retryItem(it.id)} title="Retry">
                        <FiRefreshCw />
                      </button>
                    )}
                    <button className="icon-btn danger" onClick={() => removeItem(it.id)} title="Remove" disabled={it.status === "Uploading"}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {preview.open && (
        <div className={"docs-modal"} role="dialog" aria-modal="true" onClick={closePreview}>
          <div className={"docs-modal__panel"} onClick={(e) => e.stopPropagation()}>
            <div className="docs-modal__header">
              <h3 className="docs-modal__title">Preview — {preview.name}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="icon-btn" onClick={downloadCurrent} aria-label="Download file"><FiDownload /></button>
                <button className="icon-btn" onClick={zoomOut} aria-label="Zoom out"><FiZoomOut /></button>
                <button className="icon-btn" onClick={resetZoom} aria-label="Reset zoom"><FiRefreshCw /></button>
                <button className="icon-btn" onClick={zoomIn} aria-label="Zoom in"><FiZoomIn /></button>
                <button className="icon-btn" onClick={closePreview} aria-label="Close preview"><FiX /></button>
              </div>
            </div>
            <div className="docs-modal__body">
              <div className="preview-viewport">
                <div className="preview-canvas" style={{ transform: `scale(${zoom})` }}>
                  {preview.mode === "image" && (
                    <img src={preview.url} alt={preview.name} className="preview-image" />
                  )}
                  {preview.mode === "pdf" && (
                    <iframe title="PDF Preview" src={preview.url} className="preview-frame" />
                  )}
                  {preview.mode === "docx" && (
                    <div className="preview-docx" ref={docxContainerRef} />
                  )}
                  {preview.mode === "text" && (
                    <pre className="preview-text">{preview.text}</pre>
                  )}
                  {preview.mode === "none" && (
                    <div className="preview-none">No preview available for this file type.</div>
                  )}
                </div>
              </div>
              <div className="zoom-indicator">{Math.round(zoom * 100)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
