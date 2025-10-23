// BadgesCertificates.jsx
import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import html2canvas from 'html2canvas';
import { PDFDownloadLink, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';
import { FiDownload, FiShare2, FiX, FiAward, FiFileText } from 'react-icons/fi';
import 'react-circular-progressbar/dist/styles.css';
import './BadgesCertificates.css';

// Keep your original PDF styles name
const PDFStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#f9fff9'
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20
  },
  content: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10
  },
  highlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00bcd4'
  }
});

const CertificatePDF = ({ cert, userName }) => (
  <Document>
    <Page size="A4" style={PDFStyles.page}>
      <Text style={PDFStyles.title}>🏅 Certificate of Achievement</Text>
      <Text style={PDFStyles.content}>This certifies that</Text>
      <Text style={PDFStyles.highlight}>{userName}</Text>
      <Text style={PDFStyles.content}>has successfully completed</Text>
      <Text style={PDFStyles.highlight}>{cert.title}</Text>
      <Text style={PDFStyles.content}>{cert.details}</Text>
      <Text style={PDFStyles.content}>Issued on: {cert.issued}</Text>
    </Page>
  </Document>
);

/*
  IMPORTANT:
  - This component expects these backend endpoints:
    GET  /api/achievements/badges
      -> returns { badges: [...], reviewCount: n, eventCount: n }
    GET  /api/achievements/certificates
      -> returns array of completed events with optional certificate info:
         [{ event_id, title, end_time, location, certificate: { issued_at, file_path } | null }, ...]
    POST /api/achievements/certificates/:event_id/issue
      -> issues certificate for user event; returns { message, certificate }
  - Auth token must be in localStorage under "token"
*/

const BadgesCertificates = () => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userName] = useState("");
  const [counts, setCounts] = useState({ reviews: 0, events: 0 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpTriggered, setLevelUpTriggered] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState('all');
  const certRef = useRef();

  // dynamic data from backend
  const [badgesData, setBadgesData] = useState([]);
  const [certificatesData, setCertificatesData] = useState([]);

  const [loadingBadges, setLoadingBadges] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // simple toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // helper toast
  const showToast = (msg, type = 'success', dur = 3000) => {
    setToast({ message: msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), dur);
  };

  useEffect(() => {
    // fetch badges and certificates on mount
    fetchBadges();
    fetchCertificates();
    // eslint-disable-next-line
  }, []);

  async function fetchBadges() {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingBadges(true);
    try {
      const res = await fetch(`${API_BASE}/api/achievements/badges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Badges fetch failed ${res.status}`);
      const data = await res.json();
      // expected shape: { badges: [...], reviewCount, eventCount }
      setBadgesData(data.badges || []);
      setCounts({ reviews: data.reviewCount || 0, events: data.eventCount || 0 });

      // confetti for newly unlocked badges (backend may mark awarded_at)
      const newAwarded = (data.badges || []).some(b => b.awarded_at && (Date.now() - new Date(b.awarded_at).getTime() < 5000));
      if (newAwarded) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      console.error('fetchBadges error', err);
      showToast('Failed to load badges', 'error');
    } finally {
      setLoadingBadges(false);
    }
  }

  async function fetchCertificates() {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingCerts(true);
    try {
      const res = await fetch(`${API_BASE}/api/achievements/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Certificates fetch failed ${res.status}`);
      const data = await res.json();
      // data expected: array of events { event_id, title, end_time, location, certificate }
      setCertificatesData(data || []);
    } catch (err) {
      console.error('fetchCertificates error', err);
      showToast('Failed to load certificates', 'error');
    } finally {
      setLoadingCerts(false);
    }
  }

  // When user clicks Issue Certificate
  const handleIssueCertificate = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) { showToast('Not authenticated', 'error'); return; }

    try {
      const res = await fetch(`${API_BASE}/api/achievements/certificates/${eventId}/issue`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Issue failed');
      }

      showToast(data.message || 'Certificate issued', 'success');
      // play confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // refresh certificates and badges
      await fetchCertificates();
      await fetchBadges();
    } catch (err) {
      console.error('issue certificate error', err);
      showToast(err.message || 'Failed to issue certificate', 'error');
    }
  };

  // client-side PNG download of a certificate preview (uses your certRef markup)
  const handleDownloadPNG = async () => {
    if (!certRef.current) return showToast('Nothing to download', 'error');
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2 });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `certificate-${Date.now()}.png`;
      link.click();
      showToast('Downloaded certificate PNG', 'success');
    } catch (err) {
      console.error('download error', err);
      showToast('Failed to generate image', 'error');
    }
  };

  // compute XP and level from badgesData (backend should return xp where applicable)
  const totalXP = badgesData.reduce((sum, b) => sum + (b.xp || 0) * (b.unlocked ? 1 : 0), 0);
  const level = Math.floor(totalXP / 100);
  const progress = totalXP % 100;

  useEffect(() => {
    if (level >= 1 && !levelUpTriggered) {
      setShowLevelUp(true);
      setLevelUpTriggered(true);
      setTimeout(() => setShowLevelUp(false), 4000);
    }
  }, [level, levelUpTriggered]);

  // timeline built from badges & certificates
  const timeline = [
    ...badgesData.filter(b => b.unlocked).map(b => ({
      title: `🏅 ${b.title} Badge`,
      date: b.awarded_at || null,
      type: 'badge',
      icon: <FiAward />
    })),
    ...certificatesData.filter(c => c.certificate).map(c => ({
      title: `📜 ${c.title} Certificate`,
      date: c.certificate?.issued_at || c.end_time,
      type: 'certificate',
      icon: <FiFileText />
    }))
  ].filter(Boolean).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const filteredTimeline = timelineFilter === 'all' ? timeline : timeline.filter(t => t.type === timelineFilter);

  return (
    <div className="badges-certificates-container">
      {showConfetti && <Confetti numberOfPieces={150} recycle={false} />}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast ${toast.type || ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 120 }}
          >
            <div style={{ padding: '8px 12px' }}>{toast.message}</div>
            <button onClick={() => setToast(null)} style={{ marginLeft: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="header-section">
        <h1 className="main-title">My Achievements</h1>
        <p className="subtitle">Track your progress and showcase your accomplishments</p>
      </div>
      <div
          className="stats-inline"
          style={{ display: "none" }}
        >
          <span>{counts.reviews} Reviews Written</span> •{" "}
          <span>{counts.events} Events Attended</span>
        </div>
      <div className="progress-section">
        <div className="xp-level-card">
          <div className="xp-ring">
            <CircularProgressbar
              value={progress}
              maxValue={100}
              text={`Level ${level}`}
              styles={buildStyles({
                pathColor: 'var(--primary, #4f46e5)',
                textColor: 'var(--text, #111827)',
                trailColor: 'var(--border, #e6e9ef)',
                textSize: '16px'
              })}
            />
          </div>
          <div className="xp-details">
            <h3>Your Progress</h3>
            <p className="xp-earned">{totalXP} XP earned</p>
            <div className="xp-bar">
              <div className="xp-progress" style={{ width: `${progress}%` }} />
            </div>
            <p className="next-level">{100 - progress} XP to next level</p>
          </div>
        </div>
      </div>

      <div className="badges-section">
        <h2 className="section-title"><FiAward className="section-icon" /> My Badges</h2>
        <div className="badges-grid">
          {loadingBadges && <div className="small-muted">Loading badges...</div>}
          {!loadingBadges && badgesData.length === 0 && <div className="muted">No badges yet.</div>}
          {badgesData.map(badge => (
            <motion.div
              key={badge.badge_id || badge.id}
              className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => { setSelectedBadge(badge); }}
            >
              <div className="badge-image-container">
                {badge.image ? <img src={badge.image} alt={badge.title} className="badge-image" /> : <div className="badge-placeholder">{badge.title?.[0] || 'B'}</div>}
                {!badge.unlocked && <div className="locked-overlay">🔒</div>}
              </div>
              <h3>{badge.title}</h3>
              <p className="badge-xp">{badge.xp || 0} XP</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="certificates-section">
        <h2 className="section-title"><FiFileText className="section-icon" /> My Certificates</h2>
        <div className="certificates-grid">
          {loadingCerts && <div className="small-muted">Loading certificates...</div>}
          {!loadingCerts && certificatesData.length === 0 && <div className="muted">No completed events eligible for certificates.</div>}

          {certificatesData.map(cert => (
            <motion.div key={cert.event_id} className="certificate-card" whileHover={{ scale: 1.01 }}>
              <div className="certificate-image-container">
                {cert.certificate?.file_path ? (
                  <img src={cert.certificate.file_path} alt={cert.title} className="certificate-image" />
                ) : (
                  <div className="certificate-placeholder">📜</div>
                )}
              </div>
              <div className="certificate-info">
                <h3>{cert.title}</h3>
                <p className="certificate-date">Completed: {new Date(cert.end_time).toLocaleDateString()}</p>
                <p className="certificate-details">{cert.details || ''}</p>
                <div className="certificate-actions">
                  {cert.certificate ? (
                    <>
                      {cert.certificate.file_path ? (
                        <a className="download-button" href={cert.certificate.file_path} target="_blank" rel="noreferrer">
                          <FiDownload /> Download
                        </a>
                      ) : (
                        <button className="download-button outline" onClick={() => showToast('Certificate preview not available', 'info')}>View</button>
                      )}
                    </>
                  ) : (
                    <button className="download-button" onClick={() => handleIssueCertificate(cert.event_id)}>Issue Certificate</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="timeline-section">
        <h2 className="section-title">Achievement Timeline</h2>
        <div className="timeline-filters">
          <button onClick={() => setTimelineFilter('all')} className={`filter-button ${timelineFilter === 'all' ? 'active' : ''}`}>All</button>
          <button onClick={() => setTimelineFilter('badge')} className={`filter-button ${timelineFilter === 'badge' ? 'active' : ''}`}>Badges</button>
          <button onClick={() => setTimelineFilter('certificate')} className={`filter-button ${timelineFilter === 'certificate' ? 'active' : ''}`}>Certificates</button>
        </div>
        <div className="timeline-container">
          {filteredTimeline.map((entry, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-icon">{entry.icon}</div>
              <div className="timeline-content">
                <h4>{entry.title}</h4>
                <p className="timeline-date">{entry.date ? new Date(entry.date).toLocaleDateString() : '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level Up Modal (keeps your original modal look) */}
      {showLevelUp && (
        <div className="modal-overlay">
          <div className="level-up-modal">
            <Confetti numberOfPieces={150} recycle={false} />
            <button className="close-modal-button" onClick={() => setShowLevelUp(false)}><FiX /></button>
            <div className="level-up-content">
              <h2>🎉 Level Up!</h2>
              <p className="level-up-message">Congratulations! You've reached <strong>Level {level}</strong></p>

              <div className="certificate-preview" ref={certRef}>
                <h3>Certificate of Achievement</h3>
                <p>This certifies that</p>
                <h4>{userName}</h4>
                <p>has reached <strong>Level {level}</strong> with</p>
                <p className="total-xp">{totalXP} Total XP</p>
                <p className="certificate-date">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="modal-actions">
                <button className="download-button" onClick={handleDownloadPNG}><FiDownload /> Download PNG</button>

                <PDFDownloadLink
                  document={
                    <Document>
                      <Page size="A4" style={PDFStyles.page}>
                        <Text style={PDFStyles.title}>Certificate of Achievement</Text>
                        <Text style={PDFStyles.content}>This certifies that</Text>
                        <Text style={PDFStyles.highlight}>{userName}</Text>
                        <Text style={PDFStyles.content}>has reached Level {level} with {totalXP} XP</Text>
                        <Text style={PDFStyles.content}>Date: {new Date().toLocaleDateString()}</Text>
                      </Page>
                    </Document>
                  }
                  fileName={`Level-${level}-Certificate.pdf`}
                  className="download-button"
                >
                  {({ loading }) => (<>{loading ? 'Generating...' : (<><FiDownload /> Download PDF</>)}</>)}
                </PDFDownloadLink>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="badge-detail-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <button className="close-modal-button" onClick={() => setSelectedBadge(null)}><FiX /></button>
              <div className="badge-modal-content">
                <div className="badge-image-container">
                  {selectedBadge.image ? <img src={selectedBadge.image} alt={selectedBadge.title} /> : null}
                </div>
                <div className="badge-details">
                  <h2>{selectedBadge.title}</h2>
                  <p className="badge-description">{selectedBadge.description}</p>
                  <p className="badge-xp">{selectedBadge.xp} XP • Earned: {selectedBadge.awarded_at ? new Date(selectedBadge.awarded_at).toLocaleDateString() : '—'}</p>

                  <div className="tasks-section">
                    <h4>Requirements:</h4>
                    <ul className="tasks-list">
                      {(selectedBadge.tasks || []).map((task, index) => (
                        <li key={index} className={selectedBadge.completedTasks?.includes(task) ? 'completed' : ''}>
                          {selectedBadge.completedTasks?.includes(task) ? '✓' : '○'} {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Detail Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="certificate-detail-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <button className="close-modal-button" onClick={() => setSelectedCert(null)}><FiX /></button>
              <div className="certificate-modal-content">
                <div className="certificate-image-container">
                  {selectedCert.image && <img src={selectedCert.image} alt={selectedCert.title} />}
                </div>
                <div className="certificate-details">
                  <h2>{selectedCert.title}</h2>
                  <p className="certificate-description">{selectedCert.details}</p>
                  <p className="certificate-date">Issued: {selectedCert.issued}</p>

                  <div className="certificate-actions">
                    <PDFDownloadLink document={<CertificatePDF cert={selectedCert} userName={userName} />} fileName={`${selectedCert.title}-Certificate.pdf`} className="download-button">
                      {({ loading }) => (<>{loading ? 'Generating...' : (<><FiDownload /> Download PDF</>)}</>)}
                    </PDFDownloadLink>

                    <div className="share-buttons">
                      <button className="share-button" onClick={() => showToast('Share to Twitter not implemented', 'info')}><FiShare2 /> Twitter</button>
                      <button className="share-button" onClick={() => showToast('Share to LinkedIn not implemented', 'info')}><FiShare2 /> LinkedIn</button>
                      <button className="share-button" onClick={() => showToast('Share by Email not implemented', 'info')}><FiShare2 /> Email</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgesCertificates;
