import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if email is from Rishihood
  const isRishihoodEmail = email.endsWith('@nst.rishihood.edu.in');

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      const message = isRishihoodEmail 
        ? "Signup successful! Your account is verified. Please login."
        : "Signup successful! Please login.";
      
      alert(message);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="brand">
          <h1 className="brand-title">Student Pool</h1>
          <p className="brand-sub">Create your account and get started</p>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <h2>Create account</h2>
          
          {error && (
            <div style={{
              padding: "12px",
              marginBottom: "16px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "8px",
              color: "#c00",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          <input
            placeholder="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          {/* Show verification badge for Rishihood emails */}
          {isRishihoodEmail && email.length > 0 && (
            <div style={{
              padding: "10px 12px",
              marginTop: "-8px",
              marginBottom: "12px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "8px",
              color: "#155724",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "16px" }}>✓</span>
              <span>Your account will be automatically verified</span>
            </div>
          )}

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
          
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
          
          <div className="form-footer">
            <span>Already have an account?</span> <a href="/login">Sign in</a>
          </div>
        </form>
      </div>
    </div>
  );
}