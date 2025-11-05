import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email, password
      });
      alert("Login success!");
      console.log(res.data.token);
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <form onSubmit={submit}>
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
      <button>Login</button>
    </form>
  );
}
