import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      alert("Signup successful! Please login.");
      navigate("/login", { replace: true }); // SPA redirect
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed!");
    }
  };

  return (
    <div className="auth-container">
      <div className="brand">
        <h1 className="brand-title">Student Pool</h1>
        <p className="brand-sub">Create your account and get started</p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <h2>Create account</h2>
        <input
          placeholder="Full name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <button type="submit">Create account</button>
        <div className="form-footer">
          <span>Already have an account?</span> <a href="/login">Sign in</a>
        </div>
      </form>
    </div>
  );
}