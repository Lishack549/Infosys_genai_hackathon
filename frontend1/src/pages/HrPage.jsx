import { useEffect, useMemo, useState } from "react";
import FileUpload from "../components/FileUpload";
import QueryForm from "../components/QueryForm";
import { fetchResults, uploadResume, fetchResumes, searchCandidates } from "../api/api";

export default function HrPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [results, setResults] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");
  const [searchJobRole, setSearchJobRole] = useState("");
  const [minExperience, setMinExperience] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const API_URL = "http://localhost:8000";

  // Load original HR results
  const loadResults = async () => {
    try {
      const data = await fetchResults();
      setResults(data || []);
    } catch (e) {
      console.error("Failed to load results", e);
    }
  };

  // Fetch resumes for this user
  const loadResumes = async () => {
    try {
      const res = await fetchResumes(user.id);
      setResumes(res);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    }
  };

  useEffect(() => {
    loadResults();
    loadResumes();
  }, []);

  const hrResults = useMemo(
    () => (results || []).filter((r) => r.department === "HR"),
    [results]
  );

  const totals = useMemo(() => {
    const numDocs = hrResults.length;
    return { numDocs };
  }, [hrResults]);

  const formatSummary = (text) => {
    if (!text) return "";
    return String(text)
      .replace(/\n+/g, " ")
      .replace(/\\n/g, " ")
      .replace(/\*+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Upload resume
  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file");
    
    try {
      setUploading(true);
      const res = await uploadResume(selectedFile, user.id);
      if (res.success) {
        alert("Resume uploaded and analyzed successfully!");
        setSelectedFile(null);
        loadResumes();
      } else {
        alert(res.error || "Upload failed");
      }
    } catch (err) {
      console.error("Failed to upload resume:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Search candidates
  const handleSearchCandidates = async (e) => {
    e.preventDefault();
    if (!searchJobRole) return alert("Please select a job role");
    
    try {
      const res = await searchCandidates(user.id, searchJobRole, minExperience);
      setSearchResults(res);
    } catch (err) {
      console.error("Failed to search candidates:", err);
      alert("Search failed");
    }
  };

  return (
    <div className="hr-page">
      {/* Navbar */}
      <nav className="hr-navbar">
        <div className="hr-navbar-inner">
          <div className="hr-brand">
            <span className="hr-brand-icon">👥</span>
            <span>HR Talent Management</span>
          </div>
          <div className="hr-user">
            <span className="hr-username">{user.username}</span>
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
      </nav>

      {/* Hero Section */}
      <section className="hr-hero">
        <h1>HR Workspace</h1>
        <p>Upload HR documents and manage talent with AI-powered insights.</p>
      </section>

      {/* Tabs */}
      <div className="hr-tabs">
        <button 
          className={`hr-tab ${activeTab === "documents" ? "active" : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          HR Documents
        </button>
        <button 
          className={`hr-tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Resume
        </button>
        <button 
          className={`hr-tab ${activeTab === "resumes" ? "active" : ""}`}
          onClick={() => setActiveTab("resumes")}
        >
          View Resumes
        </button>
        <button 
          className={`hr-tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          Search Candidates
        </button>
      </div>

      <div className="hr-container">
        {/* HR Documents Tab - Original Functionality */}
        {activeTab === "documents" && (
          <>
            {/* Upload */}
            <div className="card hr-card">
              <div className="hr-card-header">Upload an HR document</div>
              <FileUpload onUpload={(r) => setResults((prev) => [r, ...prev])} />
            </div>

            {/* KPIs */}
            <div className="hr-kpis">
              <div className="kpi-card">
                <div className="kpi-label">HR Documents</div>
                <div className="kpi-value">{totals.numDocs}</div>
              </div>
            </div>

            {/* List */}
            <div className="card hr-card">
              <div className="hr-card-header">Recent HR documents</div>
              {hrResults.length === 0 ? (
                <div className="hr-empty">No HR documents yet.</div>
              ) : (
                <div className="hr-table-wrap">
                  <table className="hr-table">
                    <thead>
                      <tr>
                        <th>Filename</th>
                        <th>Summary</th>
                        <th>Workflow Outcome</th>
                        <th>Action Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hrResults.map((r, i) => (
                        <tr key={i} className="hr-document-row" onClick={() => {
                          setSelectedDocument(r);
                          setShowDocumentModal(true);
                        }}>
                          <td>{r.filename}</td>
                          <td className="hr-muted">{formatSummary(r.summary)}</td>
                          <td>
                            <span className="badge badge-workflow" data-outcome={r.workflow_outcome}>
                              {r.workflow_outcome}
                            </span>
                          </td>
                          <td className="hr-checklist-cell">
                            {r.workflow_checklist && r.workflow_checklist.length > 0 ? (
                              <ul className="hr-checklist">
                                {r.workflow_checklist.slice(0, 2).map((action, index) => (
                                  <li key={index} className="hr-checklist-item">
                                    <span className="hr-checklist-icon">✓</span>
                                    {action}
                                  </li>
                                ))}
                                {r.workflow_checklist.length > 2 && (
                                  <li className="hr-checklist-item">
                                    <span className="hr-checklist-more">+{r.workflow_checklist.length - 2} more actions</span>
                                  </li>
                                )}
                              </ul>
                            ) : (
                              <span className="hr-muted">No specific actions required</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Ask AI */}
            <div className="card hr-card">
              <div className="hr-card-header">Ask AI about your HR documents</div>
              <QueryForm />
            </div>
          </>
        )}

        {/* Upload Resume Tab */}
        {activeTab === "upload" && (
          <div className="card hr-card">
            <div className="card-header hr-card-header">Upload Resume for Analysis</div>
            <form onSubmit={handleUploadResume} className="hr-upload-section">
              <div className="hr-file-input">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  required
                />
                <p>Supported formats: PDF, DOCX, TXT</p>
              </div>
              {selectedFile && (
                <div className="hr-file-info">
                  <span>Selected: {selectedFile.name}</span>
                  <span>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
              <button className="btn-primary btn-pill" disabled={uploading}>
                {uploading ? "Analyzing..." : "Upload & Analyze"}
              </button>
            </form>
          </div>
        )}

        {/* View Resumes Tab */}
        {activeTab === "resumes" && (
          <div className="card hr-card">
            <div className="card-header hr-card-header">Resume Analysis Results</div>
            {resumes.length === 0 ? (
              <div className="hr-empty">No resumes uploaded yet. Upload a resume to see analysis results.</div>
            ) : (
              <div className="hr-table-wrap">
                <table className="hr-table">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      {/* <th>Candidate Name</th> */}
                      <th>Experience</th>
                      {/* <th>Education</th>
                      <th>Technical Skills</th> */}
                      <th>Job Matches</th>
                      {/* <th>Status</th> */}
                      <th>Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumes.map((resume) => (
                      <tr key={resume.id}>
                        <td>{resume.filename}</td>
                        {/* <td>{resume.candidate_name || "N/A"}</td> */}
                        <td>{resume.experience_years || 0} years</td>
                        {/* <td className="hr-education-cell">{resume.education || "N/A"}</td>
                        <td className="hr-skills-cell">{resume.technical_skills || "N/A"}</td> */}
                        <td className="hr-matches-cell">
                          {resume.job_matches ? (
                            (() => {
                              try {
                                const matches = JSON.parse(resume.job_matches);
                                if (Array.isArray(matches)) {
                                  return (
                                    <div className="job-matches">
                                      {matches.map((match, index) => (
                                        <div key={index} className="job-match-item">
                                          <span className="job-role">{match.role}</span>
                                          <span className={`job-match-badge job-match-${match.fit.toLowerCase()}`}>
                                            {match.match}%
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                              } catch (e) {
                                // If not valid JSON, show as text
                                return resume.job_matches;
                              }
                              return resume.job_matches;
                            })()
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td>
                          <span className={`badge ${resume.status === "Analyzed" ? "badge-success" : "badge-pending"}`}>
                            {resume.status}
                          </span>
                        </td>
                        <td>{new Date(resume.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Search Candidates Tab */}
        {activeTab === "search" && (
          <div className="card hr-card">
            <div className="card-header hr-card-header">Search for Candidates</div>
            <form onSubmit={handleSearchCandidates} className="hr-search-section">
              <div className="hr-search-fields">
                <select 
                  className="hr-select"
                  value={searchJobRole}
                  onChange={(e) => setSearchJobRole(e.target.value)}
                  required
                >
                  <option value="">Select Job Role</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Support Engineer">Support Engineer</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Marketing Specialist">Marketing Specialist</option>
                  <option value="Finance Analyst">Finance Analyst</option>
                  <option value="HR Specialist">HR Specialist</option>
                  <option value="Operations Manager">Operations Manager</option>
                </select>
                <select 
                  className="hr-select"
                  value={minExperience}
                  onChange={(e) => setMinExperience(parseInt(e.target.value))}
                >
                  <option value={0}>0 Experience</option>
                  <option value={1}>1+ years</option>
                  <option value={2}>2+ years</option>
                  <option value={3}>3+ years</option>
                  <option value={5}>5+ years</option>
                  <option value={10}>10+ years</option>
                </select>
                <button type="submit" className="btn-primary btn-pill">
                  Search Candidates
                </button>
              </div>
            </form>
            
            {searchResults.length > 0 && (
              <div className="hr-table-wrap">
                <h3>Search Results ({searchResults.length} candidates)</h3>
                <table className="hr-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Experience</th>
                      <th>Skills</th>
                      <th>Job Matches</th>
                      <th>Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((resume) => (
                      <tr key={resume.id}>
                        <td>{resume.candidate_name || resume.filename}</td>
                        <td>{resume.experience_years || 0} years</td>
                        <td className="hr-skills-cell">{resume.technical_skills || "N/A"}</td>
                        <td className="hr-matches-cell">
                          {resume.job_matches ? (
                            (() => {
                              try {
                                const matches = JSON.parse(resume.job_matches);
                                if (Array.isArray(matches)) {
                                  return (
                                    <div className="job-matches">
                                      {matches.map((match, index) => (
                                        <div key={index} className="job-match-item">
                                          <span className="job-role">{match.role}</span>
                                          <span className={`job-match-badge job-match-${match.fit.toLowerCase()}`}>
                                            {match.match}%
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                              } catch (e) {
                                // If not valid JSON, show as text
                                return resume.job_matches;
                              }
                              return resume.job_matches;
                            })()
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td>{new Date(resume.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Detail Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="modal-overlay">
          <div className="modal-content hr-document-modal">
            <h3>HR Document Analysis</h3>
            <div className="hr-document-details">
              <div className="hr-detail-section">
                <h4>Document: {selectedDocument.filename}</h4>
                <p className="hr-document-summary">{selectedDocument.summary}</p>
              </div>
              
              <div className="hr-detail-section">
                <h4>Workflow Outcome</h4>
                <span className="badge badge-workflow">{selectedDocument.workflow_outcome}</span>
              </div>
              
              <div className="hr-detail-section">
                <h4>Action Plan</h4>
                {selectedDocument.workflow_checklist && selectedDocument.workflow_checklist.length > 0 ? (
                  <ul className="hr-detail-checklist">
                    {selectedDocument.workflow_checklist.map((action, index) => (
                      <li key={index} className="hr-detail-checklist-item">
                        <span className="hr-detail-checklist-icon">✓</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="hr-muted">No specific actions required</p>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedDocument(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
