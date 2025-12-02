import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit bounds
const FitBounds = ({ origin, destination }) => {
  const map = useMap();
  
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, origin, destination]);
  
  return null;
};

const RideMap = ({ origin, destination, fromLocation, toLocation }) => {
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!origin || !destination) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const routeData = data.routes[0];
          const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoute(coordinates);
          
          const distanceInKm = (routeData.distance / 1000).toFixed(2);
          setDistance(distanceInKm);
          
          const durationInMin = Math.round(routeData.duration / 60);
          setDuration(durationInMin);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [origin, destination]);

  const center = origin ? [origin.lat, origin.lng] : [20.5937, 78.9629];

  if (!origin || !destination) {
    return (
      <div className="ride-map-container">
        <div className="no-route">
          <p>📍 Route information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-map-container">
      <div className="route-stats">
        <div className="stat-item">
          <span className="icon">📍</span>
          <div className="stat-content">
            <p className="label">Distance</p>
            <p className="value">
              {loading ? 'Calculating...' : distance ? `${distance} km` : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="stat-item">
          <span className="icon">⏱️</span>
          <div className="stat-content">
            <p className="label">Duration</p>
            <p className="value">
              {loading ? 'Calculating...' : duration ? `${duration} min` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="location-labels">
        <div className="location-item">
          <span className="location-dot pickup"></span>
          <p className="location-text">{fromLocation || 'Pickup Location'}</p>
        </div>
        <div className="location-item">
          <span className="location-dot drop"></span>
          <p className="location-text">{toLocation || 'Drop Location'}</p>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={[origin.lat, origin.lng]} icon={pickupIcon}>
            <Popup>
              <strong>Pickup Point</strong>
              <br />
              {fromLocation}
            </Popup>
          </Marker>
          
          <Marker position={[destination.lat, destination.lng]} icon={dropIcon}>
            <Popup>
              <strong>Drop Point</strong>
              <br />
              {toLocation}
            </Popup>
          </Marker>
          
          {route && (
            <Polyline
              positions={route}
              color="#4285F4"
              weight={5}
              opacity={0.7}
            />
          )}
          
          <FitBounds origin={origin} destination={destination} />
        </MapContainer>
      </div>
    </div>
  );
};

export default RideMap;