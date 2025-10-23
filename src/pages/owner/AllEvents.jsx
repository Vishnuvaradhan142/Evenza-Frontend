import React from 'react';
// Local minimal presentational view (no shared component)

export default function AllEvents() {
  const columns = [
    { key: 'name', label: 'Event' },
    { key: 'date', label: 'Date' },
    { key: 'owner', label: 'Owner' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { name: 'Intra-College Sports Meet', date: '2025-09-18', owner: 'Athletics', status: 'Live' },
    { name: 'Cultural Night', date: '2025-10-04', owner: 'Cultural Club', status: 'Scheduled' },
  ];
  const stats = [
    { label: 'Total', value: 52 },
    { label: 'Live', value: 6 },
    { label: 'Scheduled', value: 21 },
    { label: 'Archived', value: 25 },
  ];
  return (
    <div>
      <h1>All Events</h1>
      <p>All events across the platform (dummy).</p>
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
