import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // Placeholder authentication check
  const isAuthenticated = localStorage.getItem('token');

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <div className="brand">
        <h1 className="brand-title">Student Pool</h1>
        <p className="brand-sub">Welcome to your Dashboard</p>
      </div>
      <div className="auth-card">
        <h2>Dashboard</h2>
        <p>This is a protected page. Only logged-in users can see this.</p>
      </div>
    </div>
  );
}