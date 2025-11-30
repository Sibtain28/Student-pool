import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./App.css";
import RideChat from "./RideChat";


export default function RideDetails() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [joiningRide, setJoiningRide] = useState(false);
  const [joinRequestStatus, setJoinRequestStatus] = useState(null); // 'pending', 'accepted', 'declined', null
  const [removingParticipant, setRemovingParticipant] = useState(null);
  


  // const API_URL = "http://localhost:4000";
  const API_URL = "https://student-pool.onrender.com";

  useEffect(() => {
    // Get user ID from token instead of API call
    const userId = getCurrentUserIdFromToken();
    console.log("User ID from token:", userId); // DEBUG
    setCurrentUserId(userId);
    
    fetchRideDetails();
    
    // Check join request status if user exists
    if (userId) {
      checkJoinRequestStatus();
    }
  }, [rideId]);

  const getCurrentUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      // JWT tokens are in format: header.payload.signature
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      console.log("Decoded JWT token:", decoded); // DEBUG - see what's inside
      
      // Return the user ID - check what field your JWT uses
      return decoded.userId || decoded.id || decoded.user_id || decoded.sub;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };
  const handleRemoveParticipant = async (participantId) => {
  if (!window.confirm('Are you sure you want to remove this participant?')) {
    return;
  }

  try {
    setRemovingParticipant(participantId);
    const token = localStorage.getItem("token");
    
    const response = await fetch(`${API_URL}/api/rides/${rideId}/participants/${participantId}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove participant');
    }

    // Refresh ride details
    await fetchRideDetails();
    alert('Participant removed successfully');
  } catch (error) {
    console.error('Error removing participant:', error);
    alert(error.message || 'Failed to remove participant');
  } finally {
    setRemovingParticipant(null);
  }
};

  const checkJoinRequestStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/rides/${rideId}/join-status`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Join request status:", data.status); // DEBUG
        setJoinRequestStatus(data.status); // 'pending', 'accepted', 'declined', or null
      }
    } catch (error) {
      console.error("Error checking join request status:", error);
    }
  };

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/rides/${rideId}`, {
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
        if (response.status === 404) {
          setError("Ride not found");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRide(data);
    } catch (error) {
      console.error("Error fetching ride details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRide = async () => {
    if (!ride || joiningRide) return;

    try {
      setJoiningRide(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/rides/${rideId}/join`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to join ride");
        return;
      }

      const data = await response.json();
      setJoinRequestStatus('pending');
      alert("Join request sent successfully! The creator will be notified.");
    } catch (error) {
      console.error("Error joining ride:", error);
      alert("Failed to join ride. Please try again.");
    } finally {
      setJoiningRide(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleShareWhatsApp = () => {
    if (!ride) return;
    const message = `Join my ride!\n\nFrom: ${ride.pickup_point}\nTo: ${ride.destination}\nDate: ${new Date(ride.date_time).toLocaleString()}\nSeats: ${ride.seats_available}/${ride.total_seats}\nCost per person: ₹${ride.cost_per_person}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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

  const isCreator = currentUserId && ride && String(ride.creator.id) === String(currentUserId);

  if (loading) {
    return (
      <div className="ride-details-container">
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
            <button className="nav-item" onClick={() => navigate("/create-ride")}>
              Create
            </button>
            <button className="nav-item" onClick={() => navigate("/my-rides")}>
              My Rides
            </button>
            <button className="nav-item notification-btn" onClick={() => navigate("/notifications")}>
              Notifications
            </button>
            <button className="nav-item">Profile</button>
            <button className="nav-item logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>
        <div className="ride-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="ride-details-container">
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
        <div className="ride-details-error">
          <h2>Ride Not Found</h2>
          <p>{error || "The ride you're looking for doesn't exist."}</p>
          <button className="my-ride-btn my-ride-btn-primary" onClick={() => navigate("/find-rides")}>
            Back to Rides
          </button>
        </div>
      </div>
    );
  }

if (!isCreator) {
  // Check if user is in participants list (AFTER we know ride exists)
  const isParticipant = ride?.participants?.some(p => p.id === currentUserId) || false;
  
  return (
    <div className="ride-details-container">
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
          <button className="nav-item" onClick={() => navigate("/create-ride")}>
            Create
          </button>
          <button className="nav-item" onClick={() => navigate("/my-rides")}>
            My Rides
          </button>
          <button className="nav-item notification-btn" onClick={() => navigate("/notifications")}>
            Notifications
          </button>
          <button className="nav-item">Profile</button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <div className="ride-details-content">
        <div className="ride-details-joiner-layout">
          <div className="ride-joiner-main-card">
            <div className="ride-joiner-header">
              <div className="location-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h1 className="ride-joiner-destination">{ride.destination}</h1>
              <p className="ride-joiner-from">From: {ride.pickup_point}</p>
              <span 
                className="ride-status-badge-joiner"
                style={getStatusStyle(ride.status)}
              >
                {ride.status}
              </span>
            </div>

              <div className="ride-joiner-info-grid">
                <div className="joiner-info-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div>
                    <span className="joiner-label">Date & Time</span>
                    <span className="joiner-value">{formatDateTime(ride.date_time)}</span>
                  </div>
                </div>

                <div className="joiner-info-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div>
                    <span className="joiner-label">Seats Available</span>
                    <span className="joiner-value">{ride.seats_available}/{ride.total_seats} seats</span>
                  </div>
                </div>
              </div>

              <div className="ride-joiner-cost-section">
                <div className="cost-box-joiner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <span className="cost-label-joiner">Cost per Person</span>
                    <span className="cost-amount-joiner">₹{ride.cost_per_person}</span>
                  </div>
                </div>

                <div className="cost-box-joiner" style={{ background: '#f0f9ff', border: '1px solid #bfdbfe' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <span className="cost-label-joiner">Total Cost</span>
                    <span className="cost-amount-joiner">₹{ride.total_cost}</span>
                  </div>
                </div>
              </div>

              {/* Join Request Status Banner or Button */}
              {isParticipant ? (
              <div className="request-accepted-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>✅ You're in this ride!</span>
              </div>
            ) : joinRequestStatus === 'pending' ? (
              <div className="request-pending-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>⏳ Request Pending - Waiting for approval</span>
              </div>
            ) : (joinRequestStatus === 'declined' || (joinRequestStatus === 'accepted' && !isParticipant)) ? (
              <div className="request-declined-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span>
                   {joinRequestStatus === 'declined' 
                    ? 'Request Declined' 
                    : 'You have been removed from this ride'}
                </span>
              </div>
            ) : (
              <button 
                className="join-ride-btn-large"
                onClick={handleJoinRide}
                disabled={joiningRide || ride.seats_available === 0}
              >
                {joiningRide ? "Sending Request..." : ride.seats_available === 0 ? "Ride Full" : "Request to Join"}
              </button>
            )}
              <div className="alternative-rides-section">
                <p className="alternative-title">Book alternative ride:</p>
                <div className="alternative-buttons">
                  <button className="alternative-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Book on Ola
                  </button>
                  <button className="alternative-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Book on Uber
                  </button>
                </div>
              </div>
            </div>

            <div className="ride-joiner-sidebar">
              <div className="creator-card">
                <h3 className="creator-title">Ride Creator</h3>
                <div className="creator-info">
                  <div className="creator-avatar">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="creator-name">{ride.creator.name}</p>
                    <p className="creator-school">Newton School</p>
                  </div>
                </div>
                <div className="verified-badge-large">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified User
                </div>
              </div>
              {isParticipant && currentUserId && (
              <RideChat 
                rideId={rideId}
                currentUserId={currentUserId}
                currentUserName={ride.participants.find(p => p.id === currentUserId)?.name || "User"}
              />
            )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render for CREATOR
  return (
    
    <div className="ride-details-container">
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
          <button className="nav-item" onClick={() => navigate("/create-ride")}>
            Create
          </button>
          <button className="nav-item" onClick={() => navigate("/my-rides")}>
            My Rides
          </button>
          <button className="nav-item notification-btn" onClick={() => navigate("/notifications")}>
            Notifications
          </button>
          <button className="nav-item">Profile</button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <div className="ride-details-content">
        <div className="ride-details-layout">
          <div className="ride-details-main">
            <div className="ride-details-card">
              <div className="ride-details-header">
                <div>
                  <div className="ride-location-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <h1 className="ride-details-destination">{ride.destination}</h1>
                  <p className="ride-details-from">From: {ride.pickup_point}</p>
                </div>
                <span 
                  className="ride-status-badge-large"
                  style={getStatusStyle(ride.status)}
                >
                  {ride.status}
                </span>
              </div>

              <div className="ride-info-grid">
                <div className="ride-info-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div>
                    <span className="info-label">Date & Time</span>
                    <span className="info-value">{formatDateTime(ride.date_time)}</span>
                  </div>
                </div>

                <div className="ride-info-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div>
                    <span className="info-label">Seats Available</span>
                    <span className="info-value">{ride.seats_available}/{ride.total_seats} seats</span>
                  </div>
                </div>
              </div>

              <div className="ride-cost-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <span className="cost-label">Cost per Person</span>
                  <span className="cost-amount">₹{ride.cost_per_person}</span>
                </div>
              </div>

              <div className="ride-cost-box" style={{ background: '#f0f9ff', border: '1px solid #bfdbfe' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <span className="cost-label">Total Cost</span>
                  <span className="cost-amount">₹{ride.total_cost}</span>
                </div>
              </div>

              <button className="whatsapp-share-btn" onClick={handleShareWhatsApp}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Share on WhatsApp
              </button>

              <div className="alternative-rides-section">
                <p className="alternative-title">Book alternative ride:</p>
                <div className="alternative-buttons">
                  <button className="alternative-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Book on Ola
                  </button>
                  <button className="alternative-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Book on Uber
                  </button>
                </div>
              </div>
            </div>

            <RideChat 
  rideId={rideId}
  currentUserId={currentUserId}
  currentUserName={ride.creator.name}
/>
</div>

          <div className="ride-details-sidebar">
            <div className="creator-card">
              <h3 className="creator-title">Ride Creator</h3>
              <div className="creator-info">
                <div className="creator-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="creator-name">{ride.creator.name}</p>
                  <p className="creator-school">Newton School</p>
                </div>
              </div>
              <div className="verified-badge-large">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verified User
              </div>
            </div>

            {/* Participants List */}
            {ride.participants && ride.participants.length > 0 && (
              <div className="participants-card">
                <h3 className="participants-title">Participants ({ride.participants.length})</h3>
                <div className="participants-list">
                  {ride.participants.map((participant) => (
                    <div key={participant.id} className="participant-item">
                      <div className="participant-info">
                        <div className="participant-avatar">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div className="participant-details">
                          <p className="participant-name">
                            {participant.name}
                            {String(participant.id) === String(ride.creator.id) && (
                              <span className="creator-badge">creator</span>
                            )}
                          </p>
                          <p className="participant-school">Newton School</p>
                          <div className="participant-verified">
                            {participant.is_verified ? (
                              <span className="verified-text">✓ Verified User</span>
                            ) : (
                              <span className="unverified-text">○ Unverified User</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {String(participant.id) !== String(ride.creator.id) && (
                        <button
                          className="remove-participant-btn"
                          onClick={() => handleRemoveParticipant(participant.id)}
                          disabled={removingParticipant === participant.id}
                        >
                          {removingParticipant === participant.id ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          

          <div className="ride-details-sidebar">
            <div className="creator-card">
              <h3 className="creator-title">Ride Creator</h3>
              <div className="creator-info">
                <div className="creator-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="creator-name">{ride.creator.name}</p>
                  <p className="creator-school">Newton School</p>
                </div>
              </div>
              <div className="verified-badge-large">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verified User
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



