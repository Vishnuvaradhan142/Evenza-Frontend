import React from 'react';

export default function TicketScanner() {
  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'ticket', label: 'Ticket' },
    { key: 'holder', label: 'Holder' },
    { key: 'status', label: 'Status' },
  ];
  const data = [
    { time: '09:58', ticket: 'QR-00342', holder: 'Nikhil', status: 'Valid' },
    { time: '10:02', ticket: 'QR-00343', holder: 'Meera', status: 'Valid' },
  ];
  const stats = [
    { label: 'Scanned', value: 142 },
    { label: 'Valid', value: 140 },
    { label: 'Invalid', value: 2 },
    { label: 'Pending', value: 0 },
  ];
    return (
        <div>
          <h1>Ticket Scanner</h1>
          <p>Scan tickets for events (static).</p>
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
