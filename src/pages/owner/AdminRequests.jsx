import React from 'react';
// Local minimal presentational view (no shared component)

export default function AdminRequests() {
  const columns = [
    { key: 'request', label: 'Request' },
    { key: 'by', label: 'By' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { request: 'Access to Payments', by: 'Vikram', role: 'Admin', status: 'Pending' },
    { request: 'Edit Site Settings', by: 'Anita', role: 'Admin', status: 'Approved' },
  ];
  const stats = [
    { label: 'Pending', value: 2 },
    { label: 'Approved', value: 7 },
    { label: 'Rejected', value: 1 },
    { label: 'Auto-Expire (d)', value: 14 },
  ];
  return (
    <div>
      <h1>Admin Requests</h1>
      <p>Requests requiring owner action (dummy).</p>
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
