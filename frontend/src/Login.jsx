// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const submit = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       alert("Please enter both email and password.");
//       return;
//     }

//     try {
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
//         email,
//         password,
//       });

//       if (res.data && res.data.token) {
//         localStorage.setItem("token", res.data.token);
//         console.log("Token stored in localStorage:", localStorage.getItem("token"));
//         navigate("/dashboard");
//       } else {
//         alert("Login failed: No token received.");
//       }
//     } catch (err) {
//       alert("Login failed! Please check your credentials and try again.");
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-container">
//         <div className="brand">
//           <h1 className="brand-title">Student Pool</h1>
//           <p className="brand-sub">Connect with peers & opportunities</p>
//         </div>

//         <form className="auth-card" onSubmit={submit}>
//           <h2>Sign in</h2>
//           <input
//             placeholder="Email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <input
//             placeholder="Password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button type="submit">Sign in</button>
//           <div className="form-footer">
//             <span>Need an account?</span> <a href="/signup">Sign up</a>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      if (res.data && res.data.token) {
  // Clear any old data first
  localStorage.clear(); // or specifically remove 'user' and 'token'
  
  // Store the new token
  localStorage.setItem("token", res.data.token);
  
  console.log("✅ Login successful, token stored");
  navigate("/dashboard");
} else {
        setError("Login failed: No token received.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.message || "Login failed! Please check your credentials.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="brand">
          <h1 className="brand-title">Student Pool</h1>
          <p className="brand-sub">Connect with peers & opportunities</p>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <h2>Sign in</h2>
          
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
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <div className="form-footer">
            <span>Need an account?</span> <a href="/signup">Sign up</a>
          </div>
        </form>
      </div>
    </div>
  );
}