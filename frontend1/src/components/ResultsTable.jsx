export default function ResultsTable({ results }) {
  if (!results.length) return <p>No results yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Filename</th>
          <th>Department</th>
          <th>Summary</th>
          <th>Entities</th>
          <th>Workflow Outcome</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, i) => (
          <tr key={i}>
            <td>{r.filename}</td>
            <td>{r.department}</td>
            <td>{r.summary}</td>
            <td>{JSON.stringify(r.entities)}</td>
            <td>{r.workflow_outcome}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
