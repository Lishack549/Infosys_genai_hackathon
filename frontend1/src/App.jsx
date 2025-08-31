import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import FileUpload from "./components/FileUpload";
import ResultsTable from "./components/ResultsTable";
import QueryForm from "./components/QueryForm";
import { useState, useEffect } from "react";
import { fetchResults, downloadCSV } from "./api/api";
import Register from "./components/Register";

// Department Pages
import Financepage from "./pages/Financepage";
import HrPage from "./pages/HrPage";
import ItSupportPage from "./pages/ItSupportPage";
import LegalPage from "./pages/LegalPage";

function Dashboard() {
  const [results, setResults] = useState([]);

  const loadResults = async () => {
    const res = await fetchResults();
    setResults(res);
  };

  useEffect(() => {
    loadResults();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Document Automation Dashboard</h1>
      <FileUpload onUpload={(res) => setResults(prev => [res, ...prev])} />
      <button className="btn btn-secondary my-3" onClick={downloadCSV}>
        Download CSV
      </button>
      <ResultsTable results={results} />
      <QueryForm />
    </div>
  );
}

export default function App() {
  return (
    
      <Routes>
         <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/finance" element={<Financepage />} />
      <Route path="/hr" element={<HrPage />} />
       <Route path="/legal" element={<LegalPage />} />
      <Route path="/customer-support" element={<ItSupportPage />} />
      </Routes>
 
  );
}
