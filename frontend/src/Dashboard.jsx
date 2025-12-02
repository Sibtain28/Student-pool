import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationCount } from "./hooks/useNotificationCount"; 


export default function Dashboard() {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationCount();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };
  const [notificationCount, setNotificationCount] = useState(0);

  // Load notification count
  useEffect(() => {
    const count = localStorage.getItem('unreadNotificationCount');
    setNotificationCount(count ? parseInt(count) : 0);

    const handleUpdate = () => {
      const updatedCount = localStorage.getItem('unreadNotificationCount');
      setNotificationCount(updatedCount ? parseInt(updatedCount) : 0);
    };
    

    window.addEventListener('notificationCountUpdated', handleUpdate);

    return () => {
      window.removeEventListener('notificationCountUpdated', handleUpdate);
    };
  }, []);

  /* Scroll animation for sections */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = document.querySelectorAll(".animate-on-scroll");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
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
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
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

      {/* How It Works Section */}
      <section className="how-it-works-section animate-on-scroll">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Get started in three simple steps</p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="step-title">Create Account</h3>
            <p className="step-description">
              Sign up with your student email and get verified instantly
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="step-title">Find or Create Ride</h3>
            <p className="step-description">
              Browse available rides or create your own trip listing
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6.5" cy="16.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16.5" cy="16.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="step-title">Travel Together</h3>
            <p className="step-description">
              Connect with riders, share costs, and enjoy the journey
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="features-section animate-on-scroll">
        <h2 className="section-title">What Makes Us Different</h2>
        <p className="section-subtitle">Built exclusively for students, by students who understand your needs</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Verified Students Only</h3>
              <p className="feature-description">Every user is verified through their college email, ensuring a safe and trusted community</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Real-time Updates</h3>
              <p className="feature-description">Get instant notifications about ride requests, acceptances, and reminders</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Quick Booking</h3>
              <p className="feature-description">Find and book rides in seconds with our intuitive interface</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Rating System</h3>
              <p className="feature-description">Build trust with our community rating system after each ride</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Transparent Pricing</h3>
              <p className="feature-description">Know exactly how much you'll pay before requesting a ride</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Community Driven</h3>
              <p className="feature-description">Connect with fellow students and build lasting friendships</p>
            </div>
          </div>
        </div>
      </section>

      {/* Help Centre Section */}
      <section className="help-center-section animate-on-scroll">
        <h2 className="help-center-title">Carpool Help Centre</h2>

        <div className="help-grid">
          <div className="help-item">
            <h3 className="help-question">How do I book a carpool ride?</h3>
            <p className="help-answer">
              You can book a carpool ride on our platform easily. Simply search for your destination, choose the date you want to travel and pick the carpool that suits you best! Some rides can be booked instantly, while others require manual approval from the driver.
            </p>
          </div>

          <div className="help-item">
            <h3 className="help-question">How do I publish a carpool ride?</h3>
            <p className="help-answer">
              Offering a carpool ride is easy. To publish your ride, use our 'Create Ride' feature. Indicate your departure and arrival points, the date and time of your departure, how many passengers you can take and the price per seat.
            </p>
          </div>

          <div className="help-item">
            <h3 className="help-question">How do I cancel my carpool ride?</h3>
            <p className="help-answer">
              If you have a change of plans, you can always cancel your carpool ride from the 'My Rides' section. The sooner you cancel, the better. That way the driver has time to accept new passengers.
            </p>
          </div>

          <div className="help-item">
            <h3 className="help-question">What are the benefits of travelling by carpool?</h3>
            <p className="help-answer">
              There are multiple advantages to carpooling. Travelling by carpool is usually more affordable, especially for longer distances. Carpooling is also more eco-friendly, as sharing a car means there will be fewer cars on the road.
            </p>
          </div>

          <div className="help-item">
            <h3 className="help-question">How much does a carpool ride cost?</h3>
            <p className="help-answer">
              The costs of a carpool ride can vary greatly, and depend on factors like distance, time of departure, the demand of that ride and more. It is also up to the driver to decide how much to charge per seat.
            </p>
          </div>

          <div className="help-item">
            <h3 className="help-question">How do I start carpooling?</h3>
            <p className="help-answer">
              Carpooling with Student Pool is super easy, and free! Simply sign up for an account and tell us some basic details about yourself. Once you have an account, you can start booking or publishing rides directly on our website.
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