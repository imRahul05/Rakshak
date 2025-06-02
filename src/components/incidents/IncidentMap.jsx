import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllIncidents } from '../../features/incidents/incidentsSlice';
import { axiosPrivate } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

const typeColors = {
  emergency: 'red',
  medical: 'blue',
  fire: 'orange',
  security: 'yellow',
  other: 'gray',
};

const IncidentMap = () => {
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center
  const [zoom, setZoom] = useState(5);
  const incidents = useSelector(selectAllIncidents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setZoom(12);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const getMarkerIcon = (type) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${typeColors[type]}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    });
  };

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((incident) => (
          <Marker
            key={incident._id}
            position={incident.location.coordinates.reverse()}
            icon={getMarkerIcon(incident.type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{incident.title}</h3>
                <p className="text-sm text-gray-600">{incident.description}</p>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs text-white bg-${typeColors[incident.type]}-500`}>
                    {incident.type}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IncidentMap;
