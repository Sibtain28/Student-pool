import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Profile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Track which fields are being added
  const [addingCollege, setAddingCollege] = useState(false);
  const [addingPhone, setAddingPhone] = useState(false);

  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("PROFILE API RESPONSE:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        if (data.success && data.user) {
          const normalizedUser = {
            fullName: data.user.fullName || data.user.name || "",
            college: data.user.college || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            verified: data.user.verified || false,
            id: data.user.id,
          };

          setUser(normalizedUser);
          setEditData(normalizedUser);
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          setError("");
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        setError(error.message || "Failed to load profile");

        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const parsedUser = JSON.parse(stored);
            setUser(parsedUser);
            setEditData(parsedUser);
            setError("");
          } catch (e) {
            console.error("Failed to parse stored user:", e);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    // Initial load of notification count
    const count = localStorage.getItem('unreadNotificationCount');
    setNotificationCount(count ? parseInt(count) : 0);

    // Listen for updates from Notifications page
    const handleUpdate = () => {
      const updatedCount = localStorage.getItem('unreadNotificationCount');
      setNotificationCount(updatedCount ? parseInt(updatedCount) : 0);
    };

    window.addEventListener('notificationCountUpdated', handleUpdate);

    return () => {
      window.removeEventListener('notificationCountUpdated', handleUpdate);
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("No authentication token. Please login again.");
      setSaving(false);
      return;
    }

    try {
      console.log("Updating profile with data:", {
        name: editData.fullName,
        email: editData.email,
        phone: editData.phone,
        college: editData.college,
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editData.fullName,
            email: editData.email,
            phone: editData.phone || null,
            college: editData.college || null,
          }),
        }
      );

      const data = await res.json();
      console.log("Server response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update local state with server response
      const updatedUser = {
        fullName: data.name || "",
        college: data.college || "",
        email: data.email || "",
        phone: data.phone || "",
        verified: user.verified,
        id: data.id,
      };

      setUser(updatedUser);
      setEditData(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccessMessage("Profile updated successfully!");
      setEditing(false);
      setAddingCollege(false);
      setAddingPhone(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...user });
    setEditing(false);
    setAddingCollege(false);
    setAddingPhone(false);
    setError("");
  };

  const handleAddCollege = () => {
    setAddingCollege(true);
    setEditing(true);
  };

  const handleAddPhone = () => {
    setAddingPhone(true);
    setEditing(true);
  };

  if (loading) {
    return (
      <>
        {/* Header */}
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
            <button className="nav-item" onClick={() => navigate("/notifications")}>
              Notifications
            </button>
            <button className="nav-item" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="nav-item logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>

        <div className="profile-container">
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column"
          }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        {/* Header */}
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
            <button className="nav-item" onClick={() => navigate("/notifications")}>
              Notifications
            </button>
            <button className="nav-item" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="nav-item logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>

        <div className="profile-container">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h1>Error Loading Profile</h1>
            <p style={{ color: "#c00", marginTop: "16px" }}>{error}</p>
            <button
              onClick={() => window.location.href = "/login"}
              style={{
                marginTop: "16px",
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        {/* Header */}
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
            <button className="nav-item" onClick={() => navigate("/notifications")}>
              Notifications
            </button>
            <button className="nav-item" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="nav-item logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>

        <div className="profile-container">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h1>No profile found. Try logging in again.</h1>
            <button
              onClick={() => window.location.href = "/login"}
              style={{
                marginTop: "16px",
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
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
            <span className="nav-icon"></span>
            Create
          </button>
          <button className="nav-item" onClick={() => navigate("/my-rides")}>
            <span className="nav-icon"></span>
            My Rides
          </button>
          <button className="nav-item notification-btn" onClick={() => navigate("/notifications")}>
            Notifications
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>
          <button className="nav-item active" onClick={() => navigate("/profile")}>
            <span className="nav-icon"></span>
            Profile
          </button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon"></span>
            Logout
          </button>
        </nav>
      </header>

      <div className="profile-container">
        <div className="profile-header-section">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>

        {successMessage && (
          <div className="profile-alert success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="profile-alert error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <div className="profile-content-grid">
          {/* Left Column: Identity Card */}
          <div className="profile-identity-card">
            <div className="profile-avatar-large">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="profile-name-large">{user.fullName || "User"}</h2>
            <p className="profile-email-large">{user.email}</p>

            <div className={`profile-verification-badge ${user.verified ? 'verified' : 'unverified'}`}>
              {user.verified ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified Student
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Unverified
                </>
              )}
            </div>
          </div>

          {/* Right Column: Details Form */}
          <div className="profile-details-card">
            <div className="profile-card-header">
              <h3>Personal Details</h3>
              {!editing && !addingCollege && !addingPhone && (
                <button className="edit-profile-btn" onClick={() => setEditing(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
              )}
            </div>

            <div className="profile-form">
              {/* Full Name */}
              <div className="profile-field-group">
                <label>Full Name</label>
                <div className="field-input-wrapper">
                  <div className="field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="profile-input"
                    />
                  ) : (
                    <div className="field-value">{user.fullName || "Not set"}</div>
                  )}
                </div>
              </div>

              {/* College */}
              <div className="profile-field-group">
                <label>College / University</label>
                <div className="field-input-wrapper">
                  <div className="field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  {(editing || addingCollege) ? (
                    <input
                      type="text"
                      value={editData.college}
                      onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                      placeholder="Enter your college name"
                      className="profile-input"
                    />
                  ) : user.college ? (
                    <div className="field-value">{user.college}</div>
                  ) : (
                    <button className="add-field-btn" onClick={handleAddCollege}>
                      + Add College
                    </button>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="profile-field-group">
                <label>Phone Number</label>
                <div className="field-input-wrapper">
                  <div className="field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  {(editing || addingPhone) ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="profile-input"
                    />
                  ) : user.phone ? (
                    <div className="field-value">{user.phone}</div>
                  ) : (
                    <button className="add-field-btn" onClick={handleAddPhone}>
                      + Add Phone
                    </button>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="profile-field-group">
                <label>Email Address</label>
                <div className="field-input-wrapper">
                  <div className="field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  {editing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="Enter your email"
                      className="profile-input"
                    />
                  ) : (
                    <div className="field-value">{user.email}</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(editing || addingCollege || addingPhone) && (
                <div className="profile-actions">
                  <button className="cancel-profile-btn" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </button>
                  <button className="save-profile-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}