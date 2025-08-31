// src/components/Homepage.jsx
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';


export default function Homepage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <h1 className="mb-4">Welcome to GenAI Portal</h1>
      <p className="text-muted">Automating Documents with Intelligence</p>
      <div>
        <Link to="/login" className="btn btn-primary m-2">Login</Link>
        <Link to="/register" className="btn btn-success m-2">Register</Link>
      </div>
    </div>
  );
}
