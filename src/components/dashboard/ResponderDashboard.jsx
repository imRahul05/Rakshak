import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { selectAllIncidents, setIncidents } from '../../features/incidents/incidentsSlice';
import { axiosPrivate } from '../../services/api';
import { 
  BellAlertIcon,
  CheckCircleIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ResponderDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [responderStatus, setResponderStatus] = useState('active');
  const [activeIncident, setActiveIncident] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const incidents = useSelector(selectAllIncidents);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    loadIncidents();
    getLocation();
    // Update location every 5 minutes
    const locationInterval = setInterval(getLocation, 300000);
    return () => clearInterval(locationInterval);
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = [position.coords.latitude, position.coords.longitude];
          setCoordinates(newCoords);
          // Update responder location in backend
          updateResponderLocation(newCoords);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const updateResponderLocation = async (coords) => {
    try {
      await axiosPrivate.post('/responder/location', {
        location: {
          type: 'Point',
          coordinates: coords
        }
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const loadIncidents = async () => {
    try {
      setLoading(true);
      // Get incidents assigned to the current responder and nearby incidents
      const response = await axiosPrivate.get('/incidents', {
        params: {
          // Only fetch incidents assigned to this responder
          assignedTo: user._id,
          // Include active and pending incidents as a comma-separated string
          status: 'pending,active',
          
          // Include geospatial search if coordinates available
          ...(coordinates && {
            lat: coordinates[0],
            lng: coordinates[1],
            radius: 10000 // 10km radius
          })
        }
      });

      if (response.data.incidents) {
        // Sort incidents: 
        // 1. Active incidents first
        // 2. Then by priority (critical -> high -> medium -> low)
        // 3. Finally by creation date (newest first)
        const sortedIncidents = response.data.incidents.sort((a, b) => {
          // Active incidents come first
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (a.status !== 'active' && b.status === 'active') return 1;
          
          // Then sort by priority
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          // Finally sort by date, newest first
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        dispatch(setIncidents(sortedIncidents));
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = responderStatus === 'active' ? 'inactive' : 'active';
    try {
      await axiosPrivate.patch('/responder/status', { status: newStatus });
      setResponderStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAcceptIncident = async (incidentId) => {
    try {
      await axiosPrivate.post(`/incidents/${incidentId}/accept`);
      setActiveIncident(incidents.find(inc => inc._id === incidentId));
      loadIncidents();
    } catch (error) {
      console.error('Error accepting incident:', error);
    }
  };

  const handleUpdateStatus = async (incidentId, status) => {
    try {
      await axiosPrivate.patch(`/incidents/${incidentId}`, { status });
      if (status === 'resolved') {
        setActiveIncident(null);
      }
      loadIncidents();
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Status Toggle and Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Responder Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              {coordinates ? `Location: ${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}` : 'Location not available'}
            </p>
          </div>
          <button
            onClick={handleStatusToggle}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              responderStatus === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${
              responderStatus === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {responderStatus === 'active' ? 'On Duty' : 'Off Duty'}
          </button>
        </div>
      </div>

      {/* Active Incident Panel */}
      {activeIncident && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Response</h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              activeIncident.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : activeIncident.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {activeIncident.priority} Priority
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{activeIncident.title}</h4>
              <p className="text-gray-500">{activeIncident.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleUpdateStatus(activeIncident._id, 'resolved')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Mark Resolved
              </button>
              <a
                href={`/chat?incident=${activeIncident._id}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Communication
              </a>
              <a
                href={`/map?incident=${activeIncident._id}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                <MapPinIcon className="h-5 w-5" />
                View on Map
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Incidents */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Nearby Incidents</h3>
          <button
            onClick={loadIncidents}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No incidents assigned to you yet
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident._id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{incident.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        incident.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        incident.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        incident.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{incident.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        incident.type === 'emergency'
                          ? 'bg-red-100 text-red-800'
                          : incident.type === 'medical'
                          ? 'bg-blue-100 text-blue-800'
                          : incident.type === 'fire'
                          ? 'bg-orange-100 text-orange-800'
                          : incident.type === 'security'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {incident.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        Reported: {new Date(incident.createdAt).toLocaleString()}
                      </span>
                      {incident.address?.formatted && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {incident.address.formatted}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {incident.status === 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(incident._id, 'resolved')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponderDashboard;
