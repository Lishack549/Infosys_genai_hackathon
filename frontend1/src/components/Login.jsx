import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await loginUser({ username, password });
    console.log("Login response:", res); // 🔎 Debugging log

    if (res.success) {
      // Save user details in localStorage
      localStorage.setItem("user", JSON.stringify(res.user));

      const dept = res.user.department?.toLowerCase().replace(/\s+/g, "-");

switch (dept) {
  case "finance":
    navigate("/finance");
    break;
  case "hr":
    navigate("/hr");
    break;
  case "customer-support":
    navigate("/customer-support");
    break;
  case "legal":
    navigate("/legal");
    break;
  default:
    navigate("/dashboard");
}

    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form
        className="p-4 shadow rounded bg-white"
        style={{ width: "400px" }}
        onSubmit={handleSubmit}
      >
        <h3 className="mb-3">Login</h3>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}
