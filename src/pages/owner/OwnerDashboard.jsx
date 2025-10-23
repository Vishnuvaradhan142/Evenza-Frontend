import React from 'react';
// Local minimal presentational view (no shared component)

export default function OwnerDashboard() {
  const stats = [
    { label: 'Live Events', value: 6 },
    { label: 'Revenue (M)', value: '₹1.2L' },
    { label: 'Registrations', value: 6230 },
    { label: 'Avg Rating', value: '4.6/5' },
  ];
  const columns = [
    { key: 'name', label: 'Event' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'registrations', label: 'Regs' },
  ];
  const data = [
    { name: 'TechFest Hackathon', date: '2025-09-25', status: 'Live', registrations: 420 },
    { name: 'Cultural Night', date: '2025-10-04', status: 'Scheduled', registrations: 188 },
  ];
  return (
    <div>
      <h1>Owner Dashboard</h1>
      <p>Overview with sample data.</p>
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
