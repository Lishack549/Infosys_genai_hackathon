import FileUpload from "../components/FileUpload"; // make sure the path is correct
import { useState } from "react";

export default function LegalPage() {
  const [uploadedData, setUploadedData] = useState(null);

  const handleUpload = (data) => {
    // This will be called after a file is uploaded
    console.log("Uploaded data:", data);
    setUploadedData(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Legal Department</h2>

      <FileUpload onUpload={handleUpload} />

      {uploadedData && (
        <div className="mt-4 p-2 border rounded bg-gray-50">
          <h3 className="font-semibold">Uploaded File Info:</h3>
          <pre>{JSON.stringify(uploadedData, null, 2)}</pre>
        </div>
      )}

      <p className="mt-4">All legal-related documents will be shown here.</p>
    </div>
  );
}
