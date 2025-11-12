import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const isAuthenticated = () => !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          isAuthenticated() ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />
      <Route path="/" element={<Navigate to="/signup" />} /> {/* default redirect */}
    </Routes>
  );
}

export default App;
