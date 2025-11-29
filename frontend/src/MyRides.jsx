import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function MyRides() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("created");
  const [rides, setRides] = useState({ created: [], joined: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingRideId, setDeletingRideId] = useState(null);

  // Replace this with your actual backend URL
  const API_URL = "http://localhost:4000"; // or your Vercel backend URL

  useEffect(() => {
    fetchRides();
  }, []);

  // Auto-hide success/error messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/rides/my-rides`, {
        method: "GET",
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

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();
      setRides(data);
    } catch (error) {
      console.error("Error fetching rides:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/rides/${rideId}/end`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        setSuccessMessage("Ride ended successfully!");
        fetchRides();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to end ride");
      }
    } catch (error) {
      console.error("Error ending ride:", error);
      setError("Failed to end ride. Please try again.");
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to delete this ride? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingRideId(rideId);
      const token = localStorage.getItem("token");
      
      console.log(`Deleting ride ${rideId}...`);
      
      const response = await fetch(`${API_URL}/api/rides/${rideId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log("Delete response status:", response.status);

      if (response.ok) {
        setSuccessMessage("Ride deleted successfully!");
        // Immediately remove the ride from state for instant UI update
        setRides(prevRides => ({
          created: prevRides.created.filter(ride => ride.id !== rideId),
          joined: prevRides.joined.filter(ride => ride.id !== rideId)
        }));
        // Also fetch fresh data to ensure consistency
        setTimeout(() => fetchRides(), 500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete ride");
        console.error("Delete failed:", errorData);
      }
    } catch (error) {
      console.error("Error deleting ride:", error);
      setError("Failed to delete ride. Please check your connection and try again.");
    } finally {
      setDeletingRideId(null);
    }
  };

  const handleShareWhatsApp = (ride) => {
    const message = `Join my ride!\n\nFrom: ${ride.pickup_point}\nTo: ${ride.destination}\nDate: ${new Date(ride.date_time).toLocaleString()}\nSeats: ${ride.seats_available}/${ride.total_seats}\nCost per person: ₹${ride.cost_per_person}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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

  // Get status badge style based on ride status
  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed':
        return {
          background: '#d1fae5',
          color: '#10b981'
        };
      case 'cancelled':
        return {
          background: '#fee2e2',
          color: '#ef4444'
        };
      default: // 'active'
        return {
          background: '#dbeafe',
          color: '#3b82f6'
        };
    }
  };

  const RideCard = ({ ride, isCreator }) => (
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
          {ride.seats_available}/{ride.total_seats || ride.seats_available} available
        </span>
      </div>

      <div className="my-ride-cost-section">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <span className="my-ride-cost-label">Cost per person</span>
          <span className="my-ride-cost-amount">₹{ride.cost_per_person || 225}</span>
        </div>
      </div>

      {isCreator && (
        <div className="my-ride-creator-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>You</span>
          <span className="my-ride-verified-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verified User
          </span>
        </div>
      )}

      <div className="my-ride-actions">
        <button
          className="my-ride-btn my-ride-btn-primary"
          onClick={() => navigate(`/ride-details/${ride.id}`)}
        >
          View Details
        </button>
        <button
          className="my-ride-btn my-ride-btn-share"
          onClick={() => handleShareWhatsApp(ride)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      {isCreator && (
        <>
          {ride.status === "active" && (
            <button
              className="my-ride-btn my-ride-btn-end"
              onClick={() => handleEndRide(ride.id)}
            >
              End Ride
            </button>
          )}
          <button
            className="my-ride-btn my-ride-btn-delete"
            onClick={() => handleDeleteRide(ride.id)}
            disabled={deletingRideId === ride.id}
          >
            {deletingRideId === ride.id ? "Deleting..." : "Delete Ride"}
          </button>
          <button className="my-ride-btn my-ride-btn-whatsapp" onClick={() => handleShareWhatsApp(ride)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Share on WhatsApp
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="my-rides-container">
      <header className="dashboard-header">
        <div className="dashboard-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          <div className="logo-circle">
            <span className="logo-icon">🚗</span>
          </div>
          <span className="logo-text">Student Pool</span>
        </div>

        <nav className="dashboard-nav">
          <button className="nav-item" onClick={() => navigate("/find-rides")}>
  Find Rides
</button>
          <button className="nav-item" onClick={() => navigate("/create-ride")}>
            Create
          </button>
          <button className="nav-item nav-item-active">
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

      <div className="my-rides-content">
        <div className="my-rides-header">
          <h1 className="my-rides-title">My Rides</h1>
          <p className="my-rides-subtitle">Manage your created and joined rides</p>
        </div>

        <div className="my-rides-tabs">
          <button
            className={`my-rides-tab ${activeTab === "created" ? "my-rides-tab-active" : ""}`}
            onClick={() => setActiveTab("created")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Created ({rides.created.length})
          </button>
          <button
            className={`my-rides-tab ${activeTab === "joined" ? "my-rides-tab-active" : ""}`}
            onClick={() => setActiveTab("joined")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Joined ({rides.joined.length})
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '0.875rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '0.875rem',
            border: '1px solid #a7f3d0'
          }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '0.875rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '0.875rem',
            border: '1px solid #fecaca'
          }}>
            ✕ {error}
          </div>
        )}

        {loading ? (
          <div className="my-rides-loading">Loading rides...</div>
        ) : (
          <div className="my-rides-grid">
            {activeTab === "created" &&
              (rides.created.length > 0 ? (
                rides.created.map((ride) => (
                  <RideCard key={ride.id} ride={ride} isCreator={true} />
                ))
              ) : (
                <div className="my-rides-empty">
                  <p>You haven't created any rides yet.</p>
                  <button
                    className="my-ride-btn my-ride-btn-primary"
                    onClick={() => navigate("/create-ride")}
                  >
                    Create Your First Ride
                  </button>
                </div>
              ))}

            {activeTab === "joined" &&
              (rides.joined.length > 0 ? (
                rides.joined.map((ride) => (
                  <RideCard key={ride.id} ride={ride} isCreator={false} />
                ))
              ) : (
                <div className="my-rides-empty">
                  <p>You haven't joined any rides yet.</p>
                  <button
                    className="my-ride-btn my-ride-btn-primary"
                    onClick={() => navigate("/dashboard")}
                  >
                    Find Rides
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}