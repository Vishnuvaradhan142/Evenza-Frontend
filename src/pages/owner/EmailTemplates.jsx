import React from 'react';

export default function EmailTemplates() {
  const columns = [
    { key: 'name', label: 'Template' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'updated', label: 'Updated' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { name: 'Registration Confirmation', purpose: 'Notify user', updated: '1d ago', status: 'Active' },
    { name: 'Event Reminder', purpose: 'Reminder', updated: '3d ago', status: 'Active' },
  ];
  const stats = [
    { label: 'Templates', value: 11 },
    { label: 'Active', value: 9 },
    { label: 'Drafts', value: 2 },
    { label: 'Locales', value: 3 },
  ];
    return (
      <div>
        <h1>Email Templates</h1>
        <p>Configure email templates (dummy).</p>
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
