import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import QueryForm from "../components/QueryForm";
import ResultsTable from "../components/ResultsTable";
import axios from "axios";
import { resolveTicket, reopenTicket, escalateTicket } from "../api/api";

export default function ItSupportPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [tickets, setTickets] = useState([]);
  const [ticketDesc, setTicketDesc] = useState("");
  const [answer, setAnswer] = useState(""); // ✅ now used in JSX
  const [submitting, setSubmitting] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reopenReason, setReopenReason] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [ticketType, setTicketType] = useState("self");
  const [affectedUser, setAffectedUser] = useState("");

  const API_URL = "http://localhost:8000";

  // Fetch tickets for this user
  const loadTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/tickets/`, { params: { user_id: user.id } });
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Submit new IT ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketDesc) return alert("Enter ticket description");
    
    // Validate affected user if reporting for someone else
    if (ticketType === "other" && !affectedUser.trim()) {
      alert("Please enter the name of the affected user");
      return;
    }
    
    try {
      setSubmitting(true);
      const params = new URLSearchParams();
      params.append("user_id", user.id);
      params.append("description", ticketDesc);
      params.append("ticket_type", ticketType);
      if (affectedUser.trim()) {
        params.append("affected_user", affectedUser.trim());
      }
      
      const res = await axios.post(`${API_URL}/create_ticket/`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      if (!res?.data?.success) {
        console.error("Ticket create response:", res?.data);
        alert("Ticket creation failed. Please try again.");
      }
      setTicketDesc("");
      setAffectedUser("");
      setTicketType("self");
      loadTickets();
      // Short polling to reflect backend processing time (LLM generation)
      let attempts = 0;
      const maxAttempts = 6; // ~18s if interval is 3s
      const intervalId = setInterval(async () => {
        attempts += 1;
        await loadTickets();
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
        }
      }, 3000);
    } catch (err) {
      console.error("Failed to create ticket:", err);
      alert("Ticket creation failed");
    }
    finally {
      setSubmitting(false);
    }
  };

  // Ask AI about tickets
  const handleQueryTicket = async (question) => {
    if (!question) return;
    try {
      const res = await axios.post(`${API_URL}/query_ticket/`, new URLSearchParams({
        user_id: user.id,
        question
      }));
      setAnswer(res.data.answer); // ✅ now displayed below
    } catch (err) {
      console.error("Query failed:", err);
    }
  };

  // Download CSV
  const handleDownloadCSV = async () => {
    try {
      const res = await axios.get(`${API_URL}/download_csv/`, { 
        params: { user_id: user.id },
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tickets_user_${user.id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV download failed:", err);
    }
  };

  // Resolve ticket
  const handleResolveTicket = async (ticketId) => {
    try {
      const res = await resolveTicket(ticketId, user.id);
      if (res.success) {
        alert("Ticket marked as resolved!");
        loadTickets(); // Refresh the ticket list
      } else {
        // Show specific message for resolution restrictions
        if (res.message === "Only the affected user can resolve this ticket") {
          alert("⚠️ You cannot resolve this ticket because it was reported for another user. Only the affected user can mark it as resolved.");
        } else {
          alert(res.message || "Failed to resolve ticket");
        }
      }
    } catch (err) {
      console.error("Failed to resolve ticket:", err);
      alert(`Failed to resolve ticket: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  // Reopen ticket
  const handleReopenTicket = async () => {
    if (!reopenReason.trim()) {
      alert("Please provide a reason for reopening the ticket");
      return;
    }
    
    try {
      const res = await reopenTicket(selectedTicket.id, user.id, reopenReason);
      if (res.success) {
        alert("Ticket reopened successfully!");
        setShowReopenModal(false);
        setReopenReason("");
        setSelectedTicket(null);
        loadTickets(); // Refresh the ticket list
      } else {
        alert(res.message || "Failed to reopen ticket");
      }
    } catch (err) {
      console.error("Failed to reopen ticket:", err);
      alert(`Failed to reopen ticket: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  // Escalate ticket
  const handleEscalateTicket = async () => {
    if (!escalateReason.trim()) {
      alert("Please provide a reason for escalating the ticket");
      return;
    }
    
    try {
      const res = await escalateTicket(selectedTicket.id, user.id, escalateReason);
      if (res.success) {
        alert("Ticket escalated successfully!");
        setShowEscalateModal(false);
        setEscalateReason("");
        setSelectedTicket(null);
        loadTickets(); // Refresh the ticket list
      } else {
        alert(res.message || "Failed to escalate ticket");
      }
    } catch (err) {
      console.error("Failed to escalate ticket:", err);
      alert(`Failed to escalate ticket: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="itsupport-page">
      {/* Navbar */}
      <nav className="itsupport-navbar">
        <div className="itsupport-navbar-inner">
          <div className="itsupport-brand">
            <span className="itsupport-brand-icon">🛠️</span>
            <span>IT Support AI</span>
          </div>
          <div className="itsupport-actions">
            <button className="btn-pill btn-light" onClick={handleDownloadCSV}>
              Download Tickets CSV
            </button>
            <div className="itsupport-user">
              <span className="itsupport-username">{user.username}</span>
              <button
                className="btn-pill btn-danger"
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="itsupport-hero">
        <h1>Create, track and ask about your IT tickets</h1>
        <p>Faster resolutions with AI summaries and actionable suggestions.</p>
      </section>

      <div className="container itsupport-container">
        {/* IT Ticket Creation */}
        <div className="card itsupport-card">
          <div className="card-header itsupport-card-header">Create IT Ticket</div>
          <form onSubmit={handleCreateTicket} className="itsupport-form">
            
            {/* Ticket Type Selection */}
            <div className="ticket-type-section">
              <label className="ticket-type-label">Ticket Type:</label>
              <div className="ticket-type-options">
                <label className="ticket-type-option">
                  <input
                    type="radio"
                    name="ticketType"
                    value="self"
                    checked={ticketType === "self"}
                    onChange={(e) => setTicketType(e.target.value)}
                  />
                  <span>My own issue</span>
                </label>
                <label className="ticket-type-option">
                  <input
                    type="radio"
                    name="ticketType"
                    value="other"
                    checked={ticketType === "other"}
                    onChange={(e) => setTicketType(e.target.value)}
                  />
                  <span>Reporting for someone else</span>
                </label>
              </div>
            </div>

            {/* Affected User Field */}
            {ticketType === "other" && (
              <div className="affected-user-section">
                <label className="affected-user-label">Affected User:</label>
                <input
                  type="text"
                  className="affected-user-input"
                  placeholder="Enter the name of the person with the issue"
                  value={affectedUser}
                  onChange={(e) => setAffectedUser(e.target.value)}
                  required={ticketType === "other"}
                />
              </div>
            )}

            <textarea
              className="itsupport-textarea"
              placeholder={
                ticketType === "self" 
                  ? "Describe your issue (password reset, VPN, software request...)"
                  : "Describe the issue for the affected user..."
              }
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              required
            />
            <div className="itsupport-form-actions">
              <button className="btn-primary btn-pill" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>

        {/* Ticket List */}
        <div className="card itsupport-card">
          <div className="card-header itsupport-card-header">Your Tickets</div>
          <div className="itsupport-table-wrap">
            <table className="itsupport-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>AI Summary</th>
                  <th>AI Suggestion</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>
                      <span className={`badge badge-category`}>{t.category}</span>
                    </td>
                    <td className="itsupport-description-cell">{t.description}</td>
                    <td>
                      <span className={`badge ${
                        t.status === "Open" ? "badge-open" : 
                        t.status === "Resolved" ? "badge-resolved" : 
                        t.status === "Reopened" ? "badge-reopened" :
                        t.status === "Escalated" ? "badge-escalated" : "badge-closed"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="itsupport-muted">{t.ai_summary}</td>
                    <td className="itsupport-muted">{t.ai_suggestion}</td>
                    <td>{new Date(t.created_at).toLocaleString()}</td>
                    <td>
                      <div className="ticket-actions">
                        {/* Only show resolve button if user is reporting for themselves OR if no affected user specified */}
                        {t.status === "Open" && (
                          <>
                            {/* Check if this is a self-reported ticket or if user is the affected user */}
                            {(!t.affected_user || t.affected_user === user.username || t.ticket_type === "self") && (
                              <button 
                                className="btn-resolve"
                                onClick={() => handleResolveTicket(t.id)}
                                title="Mark as resolved after following AI suggestions"
                              >
                                ✅ Resolve
                              </button>
                            )}
                            {/* Show escalate button for all open tickets */}
                            <button 
                              className="btn-escalate"
                              onClick={() => {
                                setSelectedTicket(t);
                                setShowEscalateModal(true);
                              }}
                              title="Escalate to human support"
                            >
                              🚨 Escalate
                            </button>
                          </>
                        )}
                        {t.status === "Reopened" && (
                          <>
                            {/* Check if this is a self-reported ticket or if user is the affected user */}
                            {(!t.affected_user || t.affected_user === user.username || t.ticket_type === "self") && (
                              <button 
                                className="btn-resolve"
                                onClick={() => handleResolveTicket(t.id)}
                                title="Mark as resolved after following AI suggestions"
                              >
                                ✅ Resolve
                              </button>
                            )}
                            {/* Show escalate button for all reopened tickets */}
                            <button 
                              className="btn-escalate"
                              onClick={() => {
                                setSelectedTicket(t);
                                setShowEscalateModal(true);
                              }}
                              title="Escalate to human support"
                            >
                              🚨 Escalate
                            </button>
                          </>
                        )}
                        {/* Show info message for tickets reported for others */}
                        {(t.status === "Open" || t.status === "Reopened") && 
                         t.affected_user && 
                         t.affected_user !== user.username && 
                         t.ticket_type === "other" && (
                          <div className="ticket-info-message">
                            <span className="info-icon">ℹ️</span>
                            <span className="info-text">Reported for {t.affected_user}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Query AI about Tickets */}
        <div className="card itsupport-card">
          <div className="card-header itsupport-card-header">Ask AI about your tickets</div>
          <QueryForm userId={user.id} onAnswer={handleQueryTicket} />
          {answer && (
            <div className="itsupport-answer">
              <div className="itsupport-answer-title">AI Answer</div>
              <div className="itsupport-answer-text">{answer}</div>
            </div>
          )}
        </div>
      </div>

      {/* Reopen Ticket Modal */}
      {showReopenModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reopen Ticket #{selectedTicket?.id}</h3>
            <p>Please provide a reason why the issue wasn't resolved:</p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Describe why the AI suggestions didn't solve your problem..."
              rows={4}
              className="modal-textarea"
            />
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowReopenModal(false);
                  setReopenReason("");
                  setSelectedTicket(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-reopen"
                onClick={handleReopenTicket}
              >
                🔄 Reopen Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Ticket Modal */}
      {showEscalateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Escalate Ticket #{selectedTicket?.id}</h3>
            <p>Please provide details for human support escalation:</p>
            <textarea
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Describe why you need human intervention..."
              rows={4}
              className="modal-textarea"
            />
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowEscalateModal(false);
                  setEscalateReason("");
                  setSelectedTicket(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-escalate"
                onClick={handleEscalateTicket}
              >
                🚨 Escalate to Human Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
