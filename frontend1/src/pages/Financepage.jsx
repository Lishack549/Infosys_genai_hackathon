// import FileUpload from "../components/FileUpload"; // make sure the path is correct
// import { useState } from "react";

// export default function Financepage() {
//   const [uploadedData, setUploadedData] = useState(null);

//   const handleUpload = (data) => {
//     // This will be called after a file is uploaded
//     console.log("Uploaded data:", data);
//     setUploadedData(data);
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Finance Department</h2>

//       {/* <FileUpload onUpload={handleUpload} />

//       {uploadedData && (
//         <div className="mt-4 p-2 border rounded bg-gray-50">
//           <h3 className="font-semibold">Uploaded File Info:</h3>
//           <pre>{JSON.stringify(uploadedData, null, 2)}</pre>
//         </div>
//       )} */}

//       <p className="mt-4">All legal-related documents will be shown here.</p>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import FileUpload from "../components/FileUpload";
import QueryForm from "../components/QueryForm";
import { fetchResults } from "../api/api";

export default function Financepage() {
  const [results, setResults] = useState([]);

  const loadResults = async () => {
    try {
      const data = await fetchResults();
      setResults(data || []);
    } catch (e) {
      console.error("Failed to load results", e);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const financeResults = useMemo(
    () => (results || []).filter((r) => r.department === "Finance"),
    [results]
  );

  const totals = useMemo(() => {
    const numDocs = financeResults.length;
    const amounts = financeResults
      .flatMap((r) => r?.entities?.amounts || [])
      .filter(Boolean);
    return { numDocs, numAmounts: amounts.length };
  }, [financeResults]);

  // Format summaries for nicer display without backend changes
  const formatSummary = (text) => {
    if (!text) return "";
    let t = String(text)
      .replace(/\n+/g, " ") // remove actual newline chars
      .replace(/\\n/g, " ") // remove literal \n sequences
      .replace(/\*+/g, "") // remove markdown asterisks
      .replace(/\s+/g, " ") // collapse spaces
      .trim();
    t = t.replace(/^here is a summary of the document[:\n-]?\s*/i, "");
    t = t.replace(/^summary[:\n-]?\s*/i, "");
    t = t.replace(/^in summary[,\-:]?\s*/i, "");
    return t;
  };

  return (
    <div className="finance-page">
      {/* Hero */}
      <section className="finance-hero">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="finance-hero-title">Finance Workspace</div>
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
        <div className="finance-hero-subtitle">
          Upload invoices and financial docs. We’ll auto-summarize, extract key
          fields, and suggest next steps.
        </div>
      </section>

      <div className="container finance-container">
        {/* Upload */}
        <div className="card finance-card">
          <div className="finance-card-header">Upload a finance document</div>
          <FileUpload onUpload={(r) => setResults((prev) => [r, ...prev])} />
        </div>

        {/* KPIs */}
        <div className="finance-kpis">
          <div className="kpi-card">
            <div className="kpi-label">Finance Documents</div>
            <div className="kpi-value">{totals.numDocs}</div>
          </div>
          {/* <div className="kpi-card">
            <div className="kpi-label">Amounts Detected</div>
            <div className="kpi-value">{totals.numAmounts}</div>
          </div> */}
        </div>

        {/* List */}
        <div className="card finance-card">
          <div className="finance-card-header">Recent finance documents</div>
          {financeResults.length === 0 ? (
            <div className="finance-empty">No finance documents yet.</div>
          ) : (
            <div className="finance-table-wrap">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Summary</th>
                                         <th>Invoice ID</th>
                    <th>Dates</th>
                    <th>Workflow</th>
                  </tr>
                </thead>
                <tbody>
                  {financeResults.map((r, i) => (
                    <tr key={i}>
                      <td>{r.filename}</td>
                      <td className="muted">{formatSummary(r.summary)}</td>
                                             <td>
                         {(r?.entities?.invoice_numbers || []).length > 0 ? (
                           r.entities.invoice_numbers[0]
                         ) : (
                           "N/A"
                         )}
                       </td>
                      <td className="muted">
                        {(r?.entities?.dates || []).slice(0, 2).join(", ")}
                      </td>
                      <td>
                        <span className="badge badge-workflow">{r.workflow_outcome}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ask AI about finance documents */}
        <div className="card finance-card">
          <div className="finance-card-header">Ask AI about your documents</div>
          <QueryForm />
        </div>
      </div>
    </div>
  );
}
