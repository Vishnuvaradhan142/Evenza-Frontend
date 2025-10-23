import React from 'react';
// Local minimal presentational view (no shared component)

export default function RolesManager() {
  const columns = [
    { key: 'role', label: 'Role' },
    { key: 'members', label: 'Members' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { role: 'Owner', members: 1, permissions: 'All', status: 'Active' },
    { role: 'Admin', members: 8, permissions: 'Manage', status: 'Active' },
  ];
  const stats = [
    { label: 'Roles', value: 5 },
    { label: 'Members', value: 41 },
    { label: 'Pending Invites', value: 3 },
    { label: 'Suspended', value: 1 },
  ];
  return (
    <div>
      <h1>Roles Manager</h1>
      <p>Configure platform roles (dummy).</p>
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
