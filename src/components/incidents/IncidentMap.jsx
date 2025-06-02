import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllIncidents, setIncidents } from '../../features/incidents/incidentsSlice';
import { axiosPrivate } from '../../services/api';
import { selectCurrentUser } from '../../features/auth/authSlice';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  BellAlertIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Fix for Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

const typeColors = {
  emergency: '#ef4444',
  medical: '#3b82f6',
  fire: '#f97316',
  security: '#eab308',
  other: '#6b7280',
};

const statusColors = {
  pending: '#f59e0b',
  active: '#8b5cf6',
  resolved: '#22c55e',
  closed: '#6b7280',
};

const IncidentMap = () => {
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center
  const [zoom, setZoom] = useState(5);
  const incidents = useSelector(selectAllIncidents);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [processingId, setProcessingId] = useState(null);

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

  const getMarkerIcon = (incident) => {
    const isSelected = incident._id === selectedIncident?._id;
    const size = isSelected ? 20 : 16;
    const borderWidth = isSelected ? 3 : 2;
    const pulseClass = incident.status === 'pending' ? 'animate-ping opacity-75' : '';
    const color = statusColors[incident.status] || typeColors[incident.type];
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="${pulseClass}" style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${borderWidth}px solid white; box-shadow: 0 0 0 2px rgba(0,0,0,0.1);">
            ${incident.priority === 'critical' ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>' : ''}
          </div>
        </div>
      `,
      iconSize: [size + 4, size + 4],
      iconAnchor: [size/2 + 2, size/2 + 2],
      popupAnchor: [0, -(size/2 + 2)],
    });
  };

  const handleIncidentAction = async (incidentId, action) => {
    setProcessingId(incidentId);
    try {
      let response;
      switch (action) {
        case 'accept':
          response = await axiosPrivate.patch(`/incidents/${incidentId}`, {
            status: 'active',
            assignedTo: [user._id]
          });
          break;
        case 'resolve':
          response = await axiosPrivate.patch(`/incidents/${incidentId}`, {
            status: 'resolved'
          });
          break;
        case 'close':
          response = await axiosPrivate.patch(`/incidents/${incidentId}`, {
            status: 'closed'
          });
          break;
      }
      
      // Refresh incidents data
      const updatedIncidents = await axiosPrivate.get('/incidents');
      dispatch(setIncidents(updatedIncidents.data.incidents));
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error updating incident:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const renderActionButtons = (incident) => {
    const isProcessing = processingId === incident._id;
    const buttonBaseClass = "flex items-center px-3 py-1.5 rounded-lg text-sm font-medium";

    if (isProcessing) {
      return (
        <div className="flex justify-center mt-2">
          <ArrowPathIcon className="w-5 h-5 animate-spin text-primary-500" />
        </div>
      );
    }

    return (
      <div className="flex gap-2 mt-3">
        {incident.status === 'pending' && user.role === 'responder' && (
          <button
            onClick={() => handleIncidentAction(incident._id, 'accept')}
            className={`${buttonBaseClass} bg-primary-500 text-white hover:bg-primary-600`}
          >
            <BellAlertIcon className="w-4 h-4 mr-1" />
            Respond
          </button>
        )}
        {incident.status === 'active' && (
          <button
            onClick={() => handleIncidentAction(incident._id, 'resolve')}
            className={`${buttonBaseClass} bg-green-500 text-white hover:bg-green-600`}
          >
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Resolve
          </button>
        )}
        {incident.status === 'resolved' && user.role === 'moderator' && (
          <button
            onClick={() => handleIncidentAction(incident._id, 'close')}
            className={`${buttonBaseClass} bg-gray-500 text-white hover:bg-gray-600`}
          >
            <XCircleIcon className="w-4 h-4 mr-1" />
            Close
          </button>
        )}
      </div>
    );
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
            position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
            icon={getMarkerIcon(incident)}
            eventHandlers={{
              click: () => setSelectedIncident(incident)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{incident.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    statusColors[incident.status] 
                    ? `bg-${incident.status === 'pending' ? 'yellow' : incident.status === 'active' ? 'purple' : incident.status === 'resolved' ? 'green' : 'gray'}-100 text-${incident.status === 'pending' ? 'yellow' : incident.status === 'active' ? 'purple' : incident.status === 'resolved' ? 'green' : 'gray'}-800`
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                    {incident.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{incident.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs bg-${typeColors[incident.type]}-100 text-${typeColors[incident.type]}-800`}>
                    {incident.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    incident.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    incident.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    incident.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {incident.priority}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Location details */}
                {incident.address?.formatted && (
                  <div className="mt-2 text-sm text-gray-500 flex items-start">
                    <MapPinIcon className="w-4 h-4 mr-1 mt-0.5" />
                    <span>{incident.address.formatted}</span>
                  </div>
                )}

                {/* Assigned responders */}
                {incident.assignedTo?.length > 0 && (
                  <div className="mt-2 border-t pt-2">
                    <h4 className="text-sm font-medium mb-1">Assigned Responders:</h4>
                    <div className="flex flex-wrap gap-2">
                      {incident.assignedTo.map((responder, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-600">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {responder.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {renderActionButtons(incident)}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IncidentMap;
