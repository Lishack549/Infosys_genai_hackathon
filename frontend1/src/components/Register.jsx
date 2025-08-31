// frontend1/src/components/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- useNavigate for routing

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("HR");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false); // track registration success
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, department }),
    });

    const data = await res.json();
    setMessage(data.message);

    if (data.success) {
      setSuccess(true);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">🔑 Register</h3>

          {!success ? (
            <form onSubmit={handleRegister}>
              {/* Username */}
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Department */}
              <div className="mb-3">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  {/* <option value="Legal">Legal</option> */}
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="alert alert-success mt-3">{message}</div>
              <button
                className="btn btn-outline-success mt-2"
                onClick={() => navigate("/login")} // redirect to login
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Message if not successful */}
          {!success && message && (
            <div className="alert alert-danger mt-3">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
