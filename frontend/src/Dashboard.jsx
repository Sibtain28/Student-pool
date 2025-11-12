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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title">Student Carpool</div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>
      <main className="dashboard-main">
        <h1>Welcome to the Dashboard</h1>
        <p>We are excited to have you here. Explore and connect with your peers!</p>
      </main>
    </div>
  );
}