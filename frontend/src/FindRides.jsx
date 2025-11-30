import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function FindRides() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    destination: "",
    date: "",
    minSeats: "1"
  });

  // const API_URL = "http://localhost:4000";
  const API_URL = "https://student-pool.onrender.com";

  useEffect(() => {
    fetchAvailableRides();
  }, []);

  const fetchAvailableRides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.destination) params.append('destination', filters.destination);
      if (filters.date) params.append('date', filters.date);
      if (filters.minSeats) params.append('minSeats', filters.minSeats);

      const response = await fetch(`${API_URL}/api/rides/available?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRides(data.rides);
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchAvailableRides();
  };

  const handleResetFilters = () => {
    setFilters({
      destination: "",
      date: "",
      minSeats: "1"
    });
    // Fetch all rides again
    setTimeout(() => fetchAvailableRides(), 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed':
        return { background: '#d1fae5', color: '#10b981' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#ef4444' };
      default:
        return { background: '#dbeafe', color: '#3b82f6' };
    }
  };

  const RideCard = ({ ride }) => (
    <div className="my-ride-card">
      <div className="my-ride-card-header">
        <h3 className="my-ride-destination">{ride.destination}</h3>
        <span 
          className="my-ride-status-badge"
          style={getStatusStyle(ride.status || 'active')}
        >
          {ride.status || 'active'}
        </span>
      </div>

      <div className="my-ride-location">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{ride.pickup_point}</span>
      </div>

      <div className="my-ride-datetime">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{formatDateTime(ride.date_time)}</span>
      </div>

      <div className="my-ride-seats">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Seats</span>
        <span className="my-ride-seats-count">
          {ride.seats_available}/{ride.total_seats} available
        </span>
      </div>

      <div className="my-ride-cost-section">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <span className="my-ride-cost-label">Cost per person</span>
          <span className="my-ride-cost-amount">₹{ride.cost_per_person}</span>
        </div>
      </div>

      <div className="my-ride-creator-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{ride.creator.name}</span>
        <span className="my-ride-verified-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verified User
        </span>
      </div>

      <div className="my-ride-actions">
        <button
          className="my-ride-btn my-ride-btn-primary"
          onClick={() => navigate(`/ride-details/${ride.id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="find-rides-container">
      <header className="dashboard-header">
        <div className="dashboard-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          <div className="logo-circle">
            <span className="logo-icon">🚗</span>
          </div>
          <span className="logo-text">Student Pool</span>
        </div>

        <nav className="dashboard-nav">
          <button className="nav-item nav-item-active" onClick={() => navigate("/find-rides")}>
            Find Rides
          </button>
          <button className="nav-item" onClick={() => navigate("/create-ride")}>
            Create
          </button>
          <button className="nav-item" onClick={() => navigate("/my-rides")}>
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
            Logout
          </button>
        </nav>
      </header>

      <div className="find-rides-content">
        <div className="find-rides-header">
          <h1 className="find-rides-title">Find Your Ride</h1>
          <p className="find-rides-subtitle">Browse available rides and join students heading your way</p>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <h2>Filter Rides</h2>
          </div>

          <div className="filter-grid">
            <div className="filter-field">
              <label>Destination</label>
              <input
                type="text"
                name="destination"
                value={filters.destination}
                onChange={handleFilterChange}
                placeholder="Where to?"
              />
            </div>

            <div className="filter-field">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-field">
              <label>Min. Seats</label>
              <input
                type="number"
                name="minSeats"
                value={filters.minSeats}
                onChange={handleFilterChange}
                min="1"
              />
            </div>

            <div className="filter-actions">
              <button className="filter-btn filter-btn-reset" onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rides-loading">
            <div className="loading-spinner"></div>
            <p>Loading available rides...</p>
          </div>
        ) : rides.length > 0 ? (
          <div className="my-rides-grid">
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <div className="no-rides-found">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h3>No rides found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}