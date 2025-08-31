import { useState } from "react";
import { queryDocs } from "../api/api";

export default function QueryForm() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleQuery = async () => {
    if (!question) return;
    const res = await queryDocs(question);
    setAnswer(res.answer);
  };

  return (
    <div className="card">
      <div style={{ display: "grid", gap: 8 }}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          style={{ width: "100%" }}
        />
        <button className="btn-success" onClick={handleQuery} style={{ width: "100%" }}>
          Ask
        </button>
      </div>
      {answer && <p className="mt-2"><strong>Answer:</strong> {answer}</p>}
    </div>
  );
}
