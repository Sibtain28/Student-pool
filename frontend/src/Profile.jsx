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
            <h1>Loading Profile...</h1>
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
            <span className="nav-icon"></span>
            Create
          </button>
          <button className="nav-item" onClick={() => navigate("/my-rides")}>
            <span className="nav-icon"></span>
            My Rides
          </button>
          <button className="nav-item notification-btn" onClick={() => navigate("/notifications")}>
            Notifications
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
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Manage your personal information</p>

        {successMessage && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "20px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "8px",
            color: "#155724",
            textAlign: "center"
          }}>
            ✓ {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "20px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "8px",
            color: "#721c24",
            textAlign: "center"
          }}>
            ✕ {error}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Profile Information</h2>

            {!editing && (
              <button className="edit-btn" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>

          {/* Full Name */}
          <div className="profile-item">
            <label>Full Name</label>
            {editing ? (
              <input
                type="text"
                value={editData.fullName}
                onChange={(e) =>
                  setEditData({ ...editData, fullName: e.target.value })
                }
                placeholder="Enter your full name"
              />
            ) : (
              <p>{user.fullName || "Not set"}</p>
            )}
          </div>

          {/* College */}
          <div className="profile-item">
            <label>College</label>
            {(editing || addingCollege) ? (
              <input
                type="text"
                value={editData.college}
                onChange={(e) =>
                  setEditData({ ...editData, college: e.target.value })
                }
                placeholder="Enter your college name"
              />
            ) : user.college ? (
              <p>{user.college}</p>
            ) : (
              <button 
                onClick={handleAddCollege}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                + Add College
              </button>
            )}
          </div>

          {/* Phone */}
          <div className="profile-item">
            <label>Phone</label>
            {(editing || addingPhone) ? (
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            ) : user.phone ? (
              <p>{user.phone}</p>
            ) : (
              <button 
                onClick={handleAddPhone}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                + Add Phone
              </button>
            )}
          </div>

          {/* Email */}
          <div className="profile-item">
            <label>Email</label>
            {editing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                placeholder="Enter your email"
              />
            ) : (
              <p>{user.email}</p>
            )}
          </div>

          {/* Verification */}
          <div className="profile-item">
            <label>Verification Status</label>
            <p className={user.verified ? "verified" : "unverified"}>
              {user.verified ? "Verified User" : "Unverified User"}
            </p>
          </div>

          {/* Buttons only in edit mode */}
          {(editing || addingCollege || addingPhone) && (
            <div className="edit-actions">
              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}