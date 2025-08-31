// frontend/src/api/api.js
import axios from "axios";

const API_URL = "http://localhost:8000"; // FastAPI backend

// -------------------- USER --------------------
export async function loginUser(data) {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// -------------------- FILE UPLOAD --------------------
export const uploadFile = async (file, userId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const response = await axios.post(`${API_URL}/upload/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// -------------------- FETCH RESULTS --------------------
export const fetchResults = async (userId) => {
  const response = await axios.get(`${API_URL}/results/`, {
    params: { user_id: userId },
  });
  return response.data;
};

// -------------------- QUERY DOCUMENTS / TICKETS --------------------
export const queryDocs = async (question, userId) => {
  const formData = new FormData();
  formData.append("question", question);
  formData.append("user_id", userId);

  const response = await axios.post(`${API_URL}/query/`, formData);
  return response.data;
};

// -------------------- CREATE TICKET (New) --------------------
export const createTicket = async (userId, description) => {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("description", description);

  const response = await axios.post(`${API_URL}/create_ticket/`, formData);
  return response.data;
};

// -------------------- FETCH TICKETS (New) --------------------
export const fetchTickets = async (userId) => {
  const response = await axios.get(`${API_URL}/tickets/`, {
    params: { user_id: userId },
  });
  return response.data;
};

// -------------------- QUERY TICKET (New) --------------------
export const queryTicket = async (userId, question) => {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("question", question);

  const response = await axios.post(`${API_URL}/query_ticket/`, formData);
  return response.data;
};

// -------------------- DOWNLOAD CSV --------------------
export const downloadCSV = async (userId) => {
  const response = await axios.get(`${API_URL}/download/`, {
    params: { user_id: userId },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "results.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// -------------------- DOWNLOAD CSV FOR TICKETS (New) --------------------
export const downloadTicketsCSV = async (userId) => {
  const response = await axios.get(`${API_URL}/download_csv/`, {
    params: { user_id: userId },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `tickets_${userId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// -------------------- RESOLVE TICKET (New) --------------------
export const resolveTicket = async (ticketId, userId) => {
  const formData = new FormData();
  formData.append("ticket_id", ticketId);
  formData.append("user_id", userId);

  const response = await axios.post(`${API_URL}/resolve_ticket/`, formData);
  return response.data;
};

// -------------------- REOPEN TICKET (New) --------------------
export const reopenTicket = async (ticketId, userId, reason) => {
  const formData = new FormData();
  formData.append("ticket_id", ticketId);
  formData.append("user_id", userId);
  formData.append("reason", reason);

  const response = await axios.post(`${API_URL}/reopen_ticket/`, formData);
  return response.data;
};

// -------------------- ESCALATE TICKET (New) --------------------
export const escalateTicket = async (ticketId, userId, escalationReason) => {
  const formData = new FormData();
  formData.append("ticket_id", ticketId);
  formData.append("user_id", userId);
  formData.append("escalation_reason", escalationReason);

  const response = await axios.post(`${API_URL}/escalate_ticket/`, formData);
  return response.data;
};

// -------------------- HR RESUME UPLOAD (New) --------------------
export const uploadResume = async (file, userId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const response = await axios.post(`${API_URL}/upload_resume/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// -------------------- FETCH RESUMES (New) --------------------
export const fetchResumes = async (userId) => {
  const response = await axios.get(`${API_URL}/resumes/`, {
    params: { user_id: userId },
  });
  return response.data;
};

// -------------------- SEARCH CANDIDATES (New) --------------------
export const searchCandidates = async (userId, jobRole, minExperience) => {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("job_role", jobRole);
  formData.append("min_experience", minExperience);

  const response = await axios.post(`${API_URL}/search_candidates/`, formData);
  return response.data;
};
