import { useState } from "react";
import { uploadFile } from "../api/api";

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await uploadFile(file);
      if (onUpload) onUpload(res);
      setFile(null); // reset after upload
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={loading}
          title="Upload selected file"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {file && (
        <p className="mt-2">
          Selected: <strong>{file.name}</strong>
        </p>
      )}

      {error && <p className="mt-2" style={{ color: "#b91c1c" }}>{error}</p>}
    </div>
  );
}
