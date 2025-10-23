import React, { useState } from "react";
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUsers,
  FiFileText,
  FiSend,
  FiEye,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import "./EventSubmission.css";

export default function EventSubmission() {
  // Mock drafted events data (in real app, this would come from localStorage or API)
  const [draftedEvents, setDraftedEvents] = useState([
    {
      id: "draft-1",
      title: "Tech Conference 2025",
      description: "Annual technology conference featuring latest innovations and networking opportunities.",
      category: "Technology",
      date: "2025-03-15",
      time: "09:00",
      duration: "8",
      venue: "Convention Center",
      address: "123 Main St, City",
      capacity: "500",
      ticketPrice: "2500",
      contactEmail: "tech@example.com",
      contactPhone: "+91 9876543210",
      status: "Draft",
      createdFrom: "Add Events",
      lastModified: "2025-01-05",
      images: [
  { id: 1, name: "tech-banner.jpg", preview: "https://i.insider.com/5fbe98c550e71a0011557672?width=700" },
  { id: 2, name: "venue-photo.jpg", preview: "https://i.insider.com/5fbe98c550e71a0011557672?width=700" }
      ],
      documents: [
        { id: 1, name: "event-proposal.pdf", size: 1024576 },
        { id: 2, name: "speaker-list.docx", size: 512000 }
      ],
      sessions: [
        {
          id: 1,
          title: "Opening Keynote",
          speaker: "Dr. Sarah Johnson",
          time: "09:00 - 10:00",
          description: "Future of Technology and Innovation"
        },
        {
          id: 2,
          title: "AI in Business",
          speaker: "Mark Thompson",
          time: "10:30 - 11:30",
          description: "Practical applications of AI in modern business"
        },
        {
          id: 3,
          title: "Networking Break",
          speaker: "",
          time: "11:30 - 12:00",
          description: "Coffee and networking opportunity"
        }
      ],
      ticketTypes: [
        {
          id: 1,
          name: "Early Bird",
          price: 2000,
          description: "Limited time offer",
          available: 100,
          sold: 45
        },
        {
          id: 2,
          name: "Regular",
          price: 2500,
          description: "Standard admission",
          available: 300,
          sold: 120
        },
        {
          id: 3,
          name: "VIP",
          price: 5000,
          description: "Premium access with exclusive benefits",
          available: 50,
          sold: 12
        }
      ],
      config: {
        registrationOpen: true,
        maxRegistrations: 500,
        requiresApproval: false,
        allowWaitlist: true
      }
    },
    {
      id: "draft-2",
      title: "Art Exhibition Opening",
      description: "Showcasing contemporary art from local and international artists.",
      category: "Arts & Culture",
      date: "2025-04-10",
      time: "18:00",
      duration: "3",
      venue: "Art Gallery Downtown",
      address: "456 Art St, Creative District",
      capacity: "150",
      ticketPrice: "500",
      contactEmail: "gallery@example.com",
      contactPhone: "+91 9876543211",
      status: "Draft",
      createdFrom: "Event Config",
      lastModified: "2025-01-03",
      images: [
  { id: 3, name: "art-preview.jpg", preview: "https://i.insider.com/5fbe98c550e71a0011557672?width=700" }
      ],
      documents: [
        { id: 3, name: "artist-profiles.pdf", size: 2048000 },
        { id: 4, name: "exhibition-catalog.pdf", size: 3072000 }
      ],
      sessions: [
        {
          id: 1,
          title: "Gallery Welcome",
          speaker: "Curator Maria Rodriguez",
          time: "18:00 - 18:30",
          description: "Introduction to the exhibition"
        },
        {
          id: 2,
          title: "Artist Meet & Greet",
          speaker: "Featured Artists",
          time: "18:30 - 20:00",
          description: "Meet the artists and discuss their work"
        }
      ],
      ticketTypes: [
        {
          id: 1,
          name: "General Admission",
          price: 500,
          description: "Standard entry to exhibition",
          available: 120,
          sold: 67
        },
        {
          id: 2,
          name: "Premium",
          price: 800,
          description: "Includes catalog and refreshments",
          available: 30,
          sold: 18
        }
      ],
      config: {
        registrationOpen: true,
        maxRegistrations: 150,
        requiresApproval: true,
        allowWaitlist: false
      }
    },
    {
      id: "draft-3",
      title: "Business Workshop Series",
      description: "Multi-session workshop covering entrepreneurship, marketing, and financial planning.",
      category: "Business",
      date: "2025-05-20",
      time: "10:00",
      duration: "6",
      venue: "Business Hub",
      address: "789 Corporate Ave, Business District",
      capacity: "80",
      ticketPrice: "1500",
      contactEmail: "workshop@example.com",
      contactPhone: "+91 9876543212",
      status: "Draft",
      createdFrom: "Documents Upload",
      lastModified: "2025-01-01",
      images: [
        { id: 4, name: "workshop.jpg", preview: "https://i.insider.com/5fbe98c550e71a0011557672?width=700" }
      ],
      documents: [
        { id: 5, name: "workshop-outline.docx", size: 256000 },
        { id: 6, name: "presenter-bios.pdf", size: 1536000 },
        { id: 7, name: "resource-materials.zip", size: 5120000 }
      ],
      sessions: [
        {
          id: 1,
          title: "Business Fundamentals",
          speaker: "John Anderson",
          time: "10:00 - 12:00",
          description: "Core principles of starting a business"
        },
        {
          id: 2,
          title: "Marketing Strategies",
          speaker: "Lisa Chen",
          time: "13:00 - 15:00",
          description: "Digital marketing and brand building"
        },
        {
          id: 3,
          title: "Financial Planning",
          speaker: "Robert Davis",
          time: "15:30 - 17:30",
          description: "Managing finances and investments"
        }
      ],
      ticketTypes: [
        {
          id: 1,
          name: "Single Session",
          price: 800,
          description: "Access to one workshop session",
          available: 30,
          sold: 15
        },
        {
          id: 2,
          name: "Full Series",
          price: 1500,
          description: "Access to all workshop sessions",
          available: 50,
          sold: 25
        }
      ],
      config: {
        registrationOpen: false,
        maxRegistrations: 80,
        requiresApproval: true,
        allowWaitlist: true
      }
    }
  ]);

  // Only show events with status Draft
  const filteredEvents = draftedEvents.filter(event => event.status === "Draft");

  const [previewEvent, setPreviewEvent] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(""); // "", "submitting", "success", "error"
  const [imagePreview, setImagePreview] = useState(null);
  const [docPreview, setDocPreview] = useState(null);

  // Handle clicking an event card
  const handleEventClick = (event) => {
    setPreviewEvent(event);
  };

  // Handle submitting a single event
  const submitSingleEvent = async (eventId) => {
    setSubmitStatus("submitting");
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus("success");
      setTimeout(() => {
        setPreviewEvent(null);
        setSubmitStatus("");
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      setTimeout(() => {
        setSubmitStatus("");
      }, 3000);
    }
  };

  const closePreview = () => {
    setPreviewEvent(null);
    setImagePreview(null);
    setDocPreview(null);
  };

  const openImagePreview = (image) => {
    setImagePreview(image);
  };

  const closeImagePreview = () => {
    setImagePreview(null);
  };

  const openDocPreview = (doc) => {
    setDocPreview(doc);
  };

  const closeDocPreview = () => {
    setDocPreview(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Delete event handler
  const handleDeleteEvent = (eventId) => {
    setDraftedEvents(prev => prev.filter(event => event.id !== eventId));
  };

  return (
    <div className="event-submission-page">
      <header className="es-header">
        <div className="titles">
          <h1 className="page-title">
            <FiSend /> Event Submission Review
          </h1>
          <p className="subtitle">Review and submit your drafted events for final approval.</p>
        </div>
      </header>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <FiAlertCircle />
            <h3>No Draft Events Found</h3>
            <p>Create events in Add Events, Event Config, or Documents Upload to see them here.</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card simple" onClick={() => handleEventClick(event)}>
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
              </div>
              <button
                className="delete-btn"
                title="Delete Event"
                onClick={e => { e.stopPropagation(); handleDeleteEvent(event.id); }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewEvent && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-panel" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Event Preview & Submit</h2>
              <button className="close-btn" onClick={closePreview}>
                <FiX />
              </button>
            </div>
            
            <div className="preview-content">
              <div className="preview-section">
                <h3>{previewEvent.title}</h3>
                <p className="preview-category">{previewEvent.category}</p>
                <p className="preview-description">{previewEvent.description}</p>
              </div>

              <div className="preview-section">
                <h4>Event Details</h4>
                <div className="preview-details">
                  <div className="preview-detail">
                    <FiCalendar />
                    <span>{new Date(previewEvent.date).toLocaleDateString()} at {previewEvent.time}</span>
                  </div>
                  <div className="preview-detail">
                    <FiClock />
                    <span>{previewEvent.duration} hours</span>
                  </div>
                  <div className="preview-detail">
                    <FiMapPin />
                    <span>{previewEvent.venue}, {previewEvent.address}</span>
                  </div>
                  <div className="preview-detail">
                    <FiUsers />
                    <span>{previewEvent.capacity} capacity</span>
                  </div>
                </div>
              </div>

              <div className="preview-section">
                <h4>Contact Information</h4>
                <div className="preview-contact">
                  <p>Email: {previewEvent.contactEmail}</p>
                  {previewEvent.contactPhone && <p>Phone: {previewEvent.contactPhone}</p>}
                </div>
              </div>

              {previewEvent.images.length > 0 && (
                <div className="preview-section">
                  <h4>Images ({previewEvent.images.length})</h4>
                  <div className="preview-images">
                    {previewEvent.images.map(img => (
                      <div key={img.id} className="preview-image-container" onClick={() => openImagePreview(img)}>
                        <img 
                          src={img.preview} 
                          alt={img.name} 
                          className="preview-image clickable"
                        />
                        <div className="image-overlay">
                          <FiEye />
                          <span>Click to view</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewEvent.documents.length > 0 && (
                <div className="preview-section">
                  <h4>Documents ({previewEvent.documents.length})</h4>
                  <div className="preview-documents">
                    {previewEvent.documents.map(doc => (
                      <div key={doc.id} className="preview-document clickable" onClick={() => openDocPreview(doc)}>
                        <FiFileText />
                        <div className="doc-info">
                          <span className="doc-name">{doc.name}</span>
                          <span className="doc-size">{formatFileSize(doc.size)}</span>
                        </div>
                        <div className="doc-preview-btn">
                          <FiEye />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewEvent.sessions && previewEvent.sessions.length > 0 && (
                <div className="preview-section">
                  <h4>Sessions ({previewEvent.sessions.length})</h4>
                  <div className="preview-sessions">
                    {previewEvent.sessions.map(session => (
                      <div key={session.id} className="session-item">
                        <div className="session-header">
                          <h5 className="session-title">{session.title}</h5>
                          <span className="session-time">{session.time}</span>
                        </div>
                        {session.speaker && (
                          <p className="session-speaker">Speaker: {session.speaker}</p>
                        )}
                        <p className="session-description">{session.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewEvent.ticketTypes && previewEvent.ticketTypes.length > 0 && (
                <div className="preview-section">
                  <h4>Ticket Types ({previewEvent.ticketTypes.length})</h4>
                  <div className="preview-tickets">
                    {previewEvent.ticketTypes.map(ticket => (
                      <div key={ticket.id} className="ticket-item">
                        <div className="ticket-header">
                          <h5 className="ticket-name">{ticket.name}</h5>
                          <span className="ticket-price">₹{ticket.price}</span>
                        </div>
                        <p className="ticket-description">{ticket.description}</p>
                        <div className="ticket-availability">
                          <span>Available: {ticket.available - ticket.sold}</span>
                          <span>Sold: {ticket.sold}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="preview-section">
                <h4>Configuration</h4>
                <div className="preview-config">
                  <div className="config-item">
                    <span>Registration: {previewEvent.config.registrationOpen ? "Open" : "Closed"}</span>
                  </div>
                  <div className="config-item">
                    <span>Max Registrations: {previewEvent.config.maxRegistrations}</span>
                  </div>
                  <div className="config-item">
                    <span>Requires Approval: {previewEvent.config.requiresApproval ? "Yes" : "No"}</span>
                  </div>
                  <div className="config-item">
                    <span>Allow Waitlist: {previewEvent.config.allowWaitlist ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              <div className="preview-meta">
                <p><strong>Last modified:</strong> {new Date(previewEvent.lastModified).toLocaleDateString()}</p>
              </div>

              <div className="preview-actions">
                {submitStatus === "success" && (
                  <div className="success-message">
                    <FiCheck /> Event submitted successfully for admin review!
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="error-message">
                    <FiAlertCircle /> Failed to submit event. Please try again.
                  </div>
                )}
                <div className="action-buttons">
                  <button className="btn secondary" onClick={closePreview}>
                    Cancel
                  </button>
                  <button 
                    className="btn primary" 
                    onClick={() => submitSingleEvent(previewEvent.id)}
                    disabled={submitStatus === "submitting"}
                  >
                    {submitStatus === "submitting" ? "Submitting..." : "Submit Event"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="image-preview-modal" onClick={closeImagePreview}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="image-preview-header">
              <h3>{imagePreview.name}</h3>
              <button className="close-btn" onClick={closeImagePreview}>
                <FiX />
              </button>
            </div>
            <div className="image-preview-content">
              <img src={imagePreview.preview} alt={imagePreview.name} className="full-image" />
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {docPreview && (
        <div className="doc-preview-modal" onClick={closeDocPreview}>
          <div className="doc-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="doc-preview-header">
              <div className="doc-preview-info">
                <h3>{docPreview.name}</h3>
                <span className="doc-preview-size">{formatFileSize(docPreview.size)}</span>
              </div>
              <button className="close-btn" onClick={closeDocPreview}>
                <FiX />
              </button>
            </div>
            <div className="doc-preview-content">
              <div className="doc-preview-placeholder">
                <FiFileText />
                <h4>Document Preview</h4>
                <p>Preview for {docPreview.name}</p>
                <p className="preview-note">In a real application, this would show the actual document content using viewers for PDF, DOCX, etc.</p>
                <div className="doc-actions">
                  <button className="btn secondary">
                    <FiEye /> View Full Document
                  </button>
                  <button className="btn primary">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}