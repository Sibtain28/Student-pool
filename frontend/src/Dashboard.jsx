import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  /* Scroll animation for Why Choose section */
  useEffect(() => {
    const section = document.querySelector(".why-choose-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add("reveal");
          }
        });
      },
      { threshold: 0.25 }
    );

    if (section) observer.observe(section);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="logo-circle">
            <span className="logo-icon">🚗</span>
          </div>
          <span className="logo-text">Student Pool</span>
        </div>

        <nav className="dashboard-nav">
          <button className="nav-item" onClick={() => navigate("/find-rides")}>
  Find Rides
</button>

          {/* ⬇️ UPDATED */}
          <button
            className="nav-item"
            onClick={() => navigate("/create-ride")}
          >
            <span className="nav-icon"></span>
            Create
          </button>

          <button 
    className="nav-item"
    onClick={() => navigate("/my-rides")}
  >
    <span className="nav-icon"></span>
    My Rides
  </button>
          <button className="nav-item notification-btn" onClick={() => navigate("/notifications")}>
              Notifications
            </button>
          <button 
  className="nav-item"
  onClick={() => navigate("/profile")}
>
  <span className="nav-icon"></span>
  Profile
</button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon"></span>
            Logout
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="dashboard-hero">
        <div className="hero-badge">
          <span className="badge-icon">🚀</span>
          Ride-sharing made simple
        </div>

        <h1 className="hero-title">
          Share Rides,<br />Split Costs
        </h1>

        <p className="hero-subtitle">
          Connect with fellow students, save money, and travel together safely.
        </p>

        <div className="hero-buttons">
          <button className="hero-btn primary" onClick={() => navigate("/find-rides")}>
            Browse Rides <span className="arrow">→</span>
          </button>

          {/* ⬇️ UPDATED */}
          <button
            className="hero-btn secondary"
            onClick={() => navigate("/create-ride")}
          >
            Create a Ride
          </button>
        </div>
      </main>

      {/* Why Choose Section */}
      <section className="why-choose-section">
        <h2 className="section-title">Why Choose Student Pool?</h2>
        <p className="section-subtitle">The smart way to travel as a student</p>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon">
              <span>💰</span>
            </div>
            <h3 className="feature-title">Save Money</h3>
            <p className="feature-description">
              Split travel costs and save up to 70% on your trips.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">
              <span>👥</span>
            </div>
            <h3 className="feature-title">Meet Students</h3>
            <p className="feature-description">
              Connect with fellow students from your college.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">
              <span>🛡️</span>
            </div>
            <h3 className="feature-title">Safe & Secure</h3>
            <p className="feature-description">
              Verified student profiles for peace of mind.
            </p>
          </div>

          
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-icon">🚗</span>
            <span className="footer-title">Student Pool</span>
          </div>
          <p className="footer-tagline">Making student travel affordable and fun</p>
          <p className="footer-copyright">
            © 2025 Student Pool. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
