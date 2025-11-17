import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        console.log("Token stored in localStorage:", localStorage.getItem("token")); // Debugging token storage
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        alert("Login failed: No token received.");
      }
    } catch (err) {
      alert("Login failed! Please check your credentials and try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="brand">
        <h1 className="brand-title">Student Pool</h1>
        <p className="brand-sub">Connect with peers & opportunities</p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <h2>Sign in</h2>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign in</button>
        <div className="form-footer">
          <span>Need an account?</span> <a href="/signup">Sign up</a>
        </div>
      </form>
    </div>
  );
}
