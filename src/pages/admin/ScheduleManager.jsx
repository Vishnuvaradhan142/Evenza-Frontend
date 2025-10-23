import React, { useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import { FiCalendar, FiClock, FiMapPin, FiHome } from 'react-icons/fi';
import './ScheduleManager.css';

export default function ScheduleManager() {
  // Calendar only view matching user calendar style
  const [date, setDate] = useState(new Date());

  // Mock rooms & events (college-wide) using relative offsets
  const rooms = useMemo(() => [
    { name: 'Auditorium', capacity: 500 },
    { name: 'Hall A', capacity: 200 },
    { name: 'Hall B', capacity: 150 },
    { name: 'Seminar Room', capacity: 50 },
    { name: 'Workshop Lab', capacity: 30 },
    { name: 'Conference 1', capacity: 25 }
  ], []);

  const allEvents = useMemo(() => [
    { id: 'e1', title: 'Orientation', date: offsetDate(0), start: '09:00', end: '10:30', room: 'Auditorium' },
    { id: 'e2', title: 'Robotics Talk', date: offsetDate(1), start: '11:00', end: '12:00', room: 'Hall A' },
    { id: 'e3', title: 'AI Panel', date: offsetDate(2), start: '14:00', end: '15:15', room: 'Hall B' },
    { id: 'e4', title: 'Cultural Rehearsal', date: offsetDate(2), start: '16:00', end: '18:00', room: 'Auditorium' },
    { id: 'e5', title: 'Hackathon Kickoff', date: offsetDate(5), start: '08:30', end: '09:00', room: 'Seminar Room' },
    { id: 'e6', title: 'Design Workshop', date: offsetDate(5), start: '10:00', end: '12:00', room: 'Workshop Lab' },
    { id: 'e7', title: 'Guest Lecture', date: offsetDate(8), start: '13:00', end: '14:30', room: 'Auditorium' },
    { id: 'e8', title: 'Career Fair', date: offsetDate(10), start: '09:00', end: '16:00', room: 'Hall A' },
    { id: 'e9', title: 'Drama Practice', date: offsetDate(10), start: '17:00', end: '19:00', room: 'Hall B' },
    { id: 'e10', title: 'Startup Pitch', date: offsetDate(15), start: '11:00', end: '13:00', room: 'Conference 1' },
    { id: 'e11', title: 'Music Club Meet', date: offsetDate(15), start: '15:00', end: '16:00', room: 'Seminar Room' },
    { id: 'e12', title: 'Art Expo Setup', date: offsetDate(15), start: '07:00', end: '09:30', room: 'Hall A' },
    { id: 'e13', title: 'Art Expo', date: offsetDate(15), start: '10:00', end: '17:00', room: 'Hall A' },
    { id: 'e14', title: 'Coding Finals', date: offsetDate(15), start: '09:00', end: '12:30', room: 'Workshop Lab' },
    { id: 'e15', title: 'Faculty Meeting', date: offsetDate(25), start: '10:00', end: '11:30', room: 'Conference 1' },
  ], []);

  function offsetDate(offset) {
    const base = new Date();
    const target = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    // store as YYYY-MM-DD for easier comparison
    return target.toISOString().split('T')[0];
  }

  const toLocalDayISO = (d) => {
    if (!d) return null;
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth()+1).padStart(2,'0');
    const day = String(dt.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };

  const events = useMemo(() => allEvents.map(e => ({...e, _dayISO: e.date })), [allEvents]);
  const eventsForDay = (day) => {
    const dayStr = toLocalDayISO(day);
    return events.filter(e => e._dayISO === dayStr);
  };

  const roomStatusForSelected = useMemo(() => {
    // inline day string conversion to avoid extra function dependency warnings
    const dt = date instanceof Date ? date : new Date(date);
    const dayStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    const occupiedRooms = new Set(events.filter(e => e._dayISO === dayStr).map(e => e.room));
    
    return rooms.map(room => ({
      ...room,
      status: occupiedRooms.has(room.name) ? 'occupied' : 'free'
    }));
  }, [date, rooms, events]);

  return (
    <div className="admin-calendar-view">
      <div className="calendar-header">
        <h1 className="page-title"><FiCalendar /> Event Calendar</h1>
        <p className="subtitle">College-wide events (mock data)</p>
      </div>
      <div className="calendar-container">
        <div className="calendar-wrapper">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={({ date: tileDate, view }) => {
              if (view !== 'month') return null;
              const dailyEvents = eventsForDay(tileDate);
              return dailyEvents.length > 0 ? (
                <div className="event-dots" aria-hidden>
                  {dailyEvents.map((_, i) => <div key={i} className="event-dot" />)}
                </div>
              ) : null;
            }}
            tileClassName={({ date: tileDate }) => {
              const dayStr = toLocalDayISO(tileDate);
              const todayStr = toLocalDayISO(new Date());
              return dayStr === todayStr ? 'today-tile' : '';
            }}
          />
        </div>
        <div className="event-list">
          <div className="event-list-header">
            <h2><FiCalendar /> Events on {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
            <span className="events-count">{eventsForDay(date).length}</span>
          </div>
          {eventsForDay(date).length > 0 ? (
            <ul className="events-container">
              {eventsForDay(date).map(ev => (
                <li key={ev.id} className="event-item">
                  <div className="event-content">
                    <h3>{ev.title}</h3>
                    <div className="event-meta">
                      <span><FiClock /> {ev.start} – {ev.end}</span>
                      <span><FiMapPin /> {ev.room}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-events"><p>No events this day</p></div>
          )}
        </div>
        <div className="room-status-sidebar">
          <div className="room-sidebar-header">
            <FiHome />
            <h3>Room Status</h3>
          </div>
          <div className="rooms-table-container">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {roomStatusForSelected.map(room => (
                  <tr key={room.name}>
                    <td className="room-name">{room.name}</td>
                    <td className="room-capacity">{room.capacity}</td>
                    <td>
                      <span className={`status-badge ${room.status === 'free' ? 'status-free' : 'status-occupied'}`}>
                        {room.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="room-count-summary">
            <span className="count-free">
              Free: {roomStatusForSelected.filter(r => r.status === 'free').length}
            </span>
            <span className="count-occupied">
              Occupied: {roomStatusForSelected.filter(r => r.status === 'occupied').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// No additional helpers

