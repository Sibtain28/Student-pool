import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import CreateRide from "./CreateRide";
import MyRides from "./MyRides";
import FindRides from "./FindRides";
import RideDetails from "./RideDetails";
import Notifications from "./Notifications";
import Profile from "./Profile";   // <-- ADDED

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* ---------------- PUBLIC ROUTES ---------------- */}
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />

      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />

      {/* ---------------- PROTECTED ROUTES ---------------- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-ride"
        element={
          <ProtectedRoute>
            <CreateRide />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-rides"
        element={
          <ProtectedRoute>
            <MyRides />
          </ProtectedRoute>
        }
      />

      <Route
        path="/find-rides"
        element={
          <ProtectedRoute>
            <FindRides />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ride-details/:rideId"
        element={
          <ProtectedRoute>
            <RideDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* ---------------- PROFILE ROUTE ---------------- */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ---------------- DEFAULT ROUTE ---------------- */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
