import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        email, password, name
      });
      alert("Signup successful!");
      console.log(res.data.token);
    } catch (err) {
      alert("Signup failed!");
    }
  };

  return (
    <form onSubmit={submit}>
      <input placeholder="Name" onChange={(e)=>setName(e.target.value)} />
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
      <button>Signup</button>
    </form>
  );
}
