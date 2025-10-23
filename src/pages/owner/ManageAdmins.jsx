import React from 'react';
// Local minimal presentational view (no shared component)

export default function ManageAdmins() {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { name: 'Anita', email: 'anita@evenza', role: 'Admin', status: 'Active' },
    { name: 'Vikram', email: 'vikram@evenza', role: 'Admin', status: 'Invited' },
  ];
  const stats = [
    { label: 'Total Admins', value: 8 },
    { label: 'Active', value: 7 },
    { label: 'Invited', value: 1 },
    { label: 'Suspended', value: 0 },
  ];
  return (
    <div>
      <h1>Manage Admins</h1>
      <p>Admin management (dummy).</p>
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
