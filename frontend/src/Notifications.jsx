import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingNotification, setProcessingNotification] = useState(null);

  // const API_URL = "http://localhost:4000";
  const API_URL = "http://student-pool.onrender.com";


  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate unread count for badge
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      console.log("Notifications received:", data);
      
      // Backend already filters out handled join requests, so just use the data directly
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (notificationId, rideId) => {
    if (!notificationId || !rideId) {
      alert('Invalid notification or ride ID');
      return;
    }

    try {
      setProcessingNotification(notificationId);
      const token = localStorage.getItem("token");
      
      console.log('Accepting join request:', { notificationId, rideId });
      
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/accept`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();
      console.log('Accept response:', data);

      if (response.ok) {
        // Show success message
        console.log('Join request accepted successfully');
        
        // Refresh notifications to show the updated state
        await fetchNotifications();
      } else {
        alert(data.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert('An error occurred while accepting the request');
    } finally {
      setProcessingNotification(null);
    }
  };

  const handleDecline = async (notificationId) => {
    if (!notificationId) {
      alert('Invalid notification ID');
      return;
    }

    try {
      setProcessingNotification(notificationId);
      const token = localStorage.getItem("token");
      
      console.log('Declining join request:', { notificationId });
      
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/decline`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();
      console.log('Decline response:', data);

      if (response.ok) {
        console.log('Join request declined successfully');
        await fetchNotifications();
      } else {
        alert(data.message || 'Failed to decline request');
      }
    } catch (error) {
      console.error("Error declining request:", error);
      alert('An error occurred while declining the request');
    } finally {
      setProcessingNotification(null);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      // Update local state instead of fetching all notifications
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      // Update local state to mark all as read
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all notifications?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const handleDeleteOne = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      // Remove notification from local state
      setNotifications(prevNotifications =>
        prevNotifications.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const NotificationCard = ({ notification }) => {
    const rideId = notification.ride_id || notification.ride?.id;
    
    const isJoinRequest = notification.type === 'join_request';
    const isNewRide = notification.type === 'new_ride';
    const isRequestAccepted = notification.type === 'request_accepted';
    const isRequestDeclined = notification.type === 'request_declined';
    const isParticipantJoined = notification.type === 'participant_joined';
    const isParticipantRemoved = notification.type === 'participant_removed';
    
    const isProcessing = processingNotification === notification.id;

    // Get the appropriate emoji based on notification type
    const getNotificationEmoji = () => {
      switch(notification.type) {
        case 'join_request':
          return '🤝';
        case 'new_ride':
          return '🚗';
        case 'request_accepted':
        case 'participant_joined':
          return '✅';
        case 'request_declined':
        case 'participant_removed':
          return '❌';
        case 'ride_updated':
          return '🔄';
        case 'ride_cancelled':
          return '🚫';
        default:
          return '🔔';
      }
    };

    // Format the date/time
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return date.toLocaleDateString();
    };

    return (
      <div className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}>
        <div className="notification-icon">
          <span style={{ fontSize: '24px' }}>{getNotificationEmoji()}</span>
        </div>

        <div className="notification-content">
          <div className="notification-header-row">
            <p className="notification-message">
              {notification.message}
            </p>
            <div className="notification-actions-top">
              {!notification.is_read && (
                <button 
                  className="notification-action-icon"
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Mark as read"
                  disabled={isProcessing}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              )}
              <button 
                className="notification-action-icon"
                onClick={() => handleDeleteOne(notification.id)}
                title="Delete"
                disabled={isProcessing}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <p className="notification-time">{formatDate(notification.created_at)}</p>

          {/* Show Accept/Decline buttons for join requests */}
          {isJoinRequest && (
            <div className="notification-buttons">
              <button 
                className="notification-btn notification-btn-accept"
                onClick={() => handleAccept(notification.id, rideId)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="mini-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Accept
                  </>
                )}
              </button>
              <button 
                className="notification-btn notification-btn-decline"
                onClick={() => handleDecline(notification.id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Decline
                  </>
                )}
              </button>
            </div>
          )}

          {/* Show View Ride button for applicable notification types */}
          {(isNewRide || isRequestAccepted || isRequestDeclined || isParticipantJoined) && rideId && (
            <button 
              className="notification-view-ride-btn"
              onClick={() => navigate(`/ride-details/${rideId}`)}
            >
              View Ride →
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="notifications-container">
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
          <button className="nav-item nav-item-active">
            Notifications
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          <button 
            className="nav-item"
            onClick={() => navigate("/profile")}
          >
            <span className="nav-icon">👤</span>
            Profile
          </button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <div className="notifications-content">
        <div className="notifications-header">
          <div>
            <h1 className="notifications-title">Notifications</h1>
            <p className="notifications-subtitle">
              Stay updated on your rides
              {unreadCount > 0 && ` • ${unreadCount} unread`}
            </p>
          </div>

          <div className="notifications-header-actions">
            {notifications.length > 0 && (
              <>
                <button 
                  className="header-action-btn" 
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Mark all as read
                </button>
                <button className="header-action-btn header-action-btn-delete" onClick={handleDeleteAll}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete All
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="notifications-loading">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="no-notifications">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h3>No notifications</h3>
            <p>You're all caught up! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}