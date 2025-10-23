import React from 'react';
// Local minimal presentational view (no shared component)

export default function EventCategory() {
  const columns = [
    { key: 'category', label: 'Category' },
    { key: 'events', label: 'Events' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { category: 'Technology', events: 18, status: 'Active' },
    { category: 'Cultural', events: 9, status: 'Active' },
    { category: 'Sports', events: 7, status: 'Active' },
  ];
  const stats = [
    { label: 'Categories', value: 12 },
    { label: 'Active', value: 11 },
    { label: 'Hidden', value: 1 },
    { label: 'Lifetime Events', value: 342 },
  ];
  return (
  <div>
      <h1>Event Categories</h1>
      <p>Organize events by category (dummy).</p>
      <ul>
        {stats.map((s, i) => (<li key={i}>{s.label}: {s.value}</li>))}
      </ul>
      <table>
        <thead><tr>{columns.map(c => (<th key={c.key}>{c.label}</th>))}</tr></thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>{columns.map(c => (<td key={c.key}>{String(row[c.key] ?? '')}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
