import React from 'react';
// Local minimal presentational view (no shared component)

export default function ArchiveEvents() {
  const columns = [
    { key: 'name', label: 'Event' },
    { key: 'ended', label: 'Ended' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'rating', label: 'Rating' },
  ];
  const data = [
    { name: 'Tech Talk Series', ended: '2025-07-12', attendance: 420, rating: '4.6/5' },
    { name: 'Photography Expo', ended: '2025-08-01', attendance: 188, rating: '4.2/5' },
  ];
  const stats = [
    { label: 'Archived', value: 25 },
    { label: 'Avg Rating', value: '4.4' },
    { label: 'Total Attendance', value: '6,230' },
    { label: 'Best Event', value: 'AI & Robotics' },
  ];
    return (
      <div>
        <h1>Archive Events</h1>
        <p>Archived events (dummy).</p>
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
