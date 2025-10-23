import React from 'react';
// Local minimal presentational view (no shared component)

export default function PublicReviews() {
  const columns = [
    { key: 'event', label: 'Event' },
    { key: 'user', label: 'User' },
    { key: 'rating', label: 'Rating' },
    { key: 'comment', label: 'Comment' },
  ];
  const data = [
    { event: 'AI Workshop', user: 'Priya', rating: '5/5', comment: 'Amazing!' },
    { event: 'Cultural Night', user: 'Rohit', rating: '4/5', comment: 'Great vibe' },
  ];
  const stats = [
    { label: 'Reviews', value: 128 },
    { label: 'Avg Rating', value: '4.5' },
    { label: 'With Comments', value: 92 },
    { label: 'Flagged', value: 3 },
  ];
  return (
    <div>
      <h1>Public Reviews</h1>
      <p>Platform-wide reviews (dummy).</p>
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
