import React from 'react';
// Local minimal presentational view (no shared component)

export default function ContentModeration() {
  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'item', label: 'Item' },
    { key: 'reported', label: 'Reported' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { type: 'Comment', item: 'Post #145', reported: 'Abuse', status: 'In Review' },
    { type: 'Media', item: 'photo.png', reported: 'Inappropriate', status: 'Removed' },
  ];
  const stats = [
    { label: 'Open', value: 8 },
    { label: 'In Review', value: 4 },
    { label: 'Resolved', value: 18 },
    { label: 'Rejected', value: 3 },
  ];
  return (
    <div>
      <h1>Content Moderation</h1>
      <p>Moderate reported content (dummy).</p>
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
