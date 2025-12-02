import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import "./App.css";

// const API_URL = "http://localhost:4000/api/rides/create";
const API_URL = "https://student-pool.onrender.com/api/rides/create";
const getCoordinates = async (locationName) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};

export default function CreateRide() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    destination: "",
    pickupPoint: "",
    date: "",
    time: "",
    totalCost: "",
    seatsAvailable: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
  const count = localStorage.getItem('unreadNotificationCount');
  setNotificationCount(count ? parseInt(count) : 0);
  
  const handleUpdate = () => {
    const updatedCount = localStorage.getItem('unreadNotificationCount');
    setNotificationCount(updatedCount ? parseInt(updatedCount) : 0);
  };
  
  window.addEventListener('notificationCountUpdated', handleUpdate);
  return () => window.removeEventListener('notificationCountUpdated', handleUpdate);
}, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async () => {
  // Validation
  if (!formData.destination || !formData.pickupPoint || !formData.date || 
      !formData.time || !formData.totalCost || !formData.seatsAvailable) {
    setError("Please fill in all required fields");
    return;
  }

  if (parseInt(formData.seatsAvailable) < 1) {
    setError("At least 1 seat must be available");
    return;
  }

  if (parseFloat(formData.totalCost) <= 0) {
    setError("Total cost must be greater than 0");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const token = localStorage.getItem("token");
    
    // 🗺️ GET COORDINATES FOR PICKUP AND DESTINATION
    console.log("Getting coordinates for pickup point:", formData.pickupPoint);
    const sourceCoords = await getCoordinates(formData.pickupPoint);
    
    console.log("Getting coordinates for destination:", formData.destination);
    const destCoords = await getCoordinates(formData.destination);
    
    console.log("Source coordinates:", sourceCoords);
    console.log("Destination coordinates:", destCoords);
    
    // Combine date and time into a DateTime string
    const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    
    // Calculate cost per person
    const totalPeople = parseInt(formData.seatsAvailable) + 1; // +1 for driver
    const costPerPerson = (parseFloat(formData.totalCost) / totalPeople).toFixed(2);

    const rideData = {
      destination: formData.destination,
      pickup_point: formData.pickupPoint,
      date_time: dateTime,
      total_cost: parseFloat(formData.totalCost),
      seats_available: parseInt(formData.seatsAvailable),
      total_seats: parseInt(formData.seatsAvailable),
      cost_per_person: parseFloat(costPerPerson),
      status: "active",
      // 🗺️ ADD COORDINATES
      sourceLatitude: sourceCoords?.lat || null,
      sourceLongitude: sourceCoords?.lng || null,
      destLatitude: destCoords?.lat || null,
      destLongitude: destCoords?.lng || null
    };

    console.log("Sending ride data:", rideData);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(rideData)
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message if coordinates were found
      if (!sourceCoords || !destCoords) {
        alert("Ride created successfully! Note: Map may not be available for this location.");
      }
      // Success - navigate to My Rides
      navigate("/my-rides");
    } else {
      setError(data.message || "Failed to create ride. Please try again.");
    }
  } catch (err) {
    console.error("Error creating ride:", err);
    setError("Network error. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // Calculate cost per person
  const calculateCostPerPerson = () => {
    const totalCost = parseFloat(formData.totalCost);
    const seats = parseInt(formData.seatsAvailable);
    
    if (!totalCost || !seats || seats === 0) {
      return null;
    }
    
    const totalPeople = seats + 1;
    const costPerPerson = totalCost / totalPeople;
    
    return {
      costPerPerson: costPerPerson.toFixed(2),
      totalPeople: totalPeople
    };
  };

  const costCalculation = calculateCostPerPerson();

  return (
    <div style={{ margin: 0, padding: 0, width: '100%' }}>
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
          <button className="nav-item nav-item-active">
            Create
          </button>
          <button className="nav-item" onClick={() => navigate("/my-rides")}>
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
            Logout
          </button>
        </nav>
      </header>

      <div style={{ 
        background: 'linear-gradient(180deg, #eff6ff 0%, #f9fafb 50%, #ffffff 100%)',
        minHeight: 'calc(100vh - 73px)',
        width: '100%',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ padding: '3rem 2rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="create-ride-card">
            <div className="form-header">
              <div className="form-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="form-title">Create a New Ride</h1>
            </div>
            
            <p className="form-subtitle">Share your ride and split costs with fellow students</p>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div className="ride-form">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="destination" className="form-label">
                    Destination <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    placeholder="e.g., Airport, Mall, City"
                    value={formData.destination}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pickupPoint" className="form-label">
                    Pickup Point <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="pickupPoint"
                    name="pickupPoint"
                    placeholder="e.g., College Gate, Hostel"
                    value={formData.pickupPoint}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="date" className="form-label">
                    Date <span className="form-required">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="time" className="form-label">
                    Time <span className="form-required">*</span>
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="totalCost" className="form-label">
                    Total Cost (₹) <span className="form-required">*</span>
                  </label>
                  <input
                    type="number"
                    id="totalCost"
                    name="totalCost"
                    placeholder="300"
                    value={formData.totalCost}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                    disabled={loading}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="seatsAvailable" className="form-label">
                    Seats Available <span className="form-required">*</span>
                  </label>
                  <input
                    type="number"
                    id="seatsAvailable"
                    name="seatsAvailable"
                    placeholder="3"
                    value={formData.seatsAvailable}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                    max="8"
                    disabled={loading}
                  />
                </div>
              </div>

              {costCalculation && (
                <div className="cost-calculator-box">
                  <div className="cost-calculator-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="cost-calculator-label">Cost per person</span>
                  </div>
                  <div className="cost-calculator-amount">₹{costCalculation.costPerPerson}</div>
                  <div className="cost-calculator-subtitle">
                    Split between {costCalculation.totalPeople} people (including you)
                  </div>
                </div>
              )}

              <button 
                onClick={handleSubmit} 
                className="form-submit-btn"
                disabled={loading}
              >
                {loading ? "Creating Ride..." : "Create Ride"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}