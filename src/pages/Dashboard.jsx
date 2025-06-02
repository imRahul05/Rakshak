import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { selectAllIncidents, setIncidents } from '../features/incidents/incidentsSlice';
import DashboardLayout from '../components/layout/DashboardLayout';
import IncidentReportForm from '../components/incidents/IncidentReportForm';
import { axiosPrivate } from '../services/api';
import { 
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Report New Incident</h2>
      <IncidentReportForm />
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Nearby Incidents</h3>
        {/* Incidents list will be added here */}
      </div>
    </div>
  );
};

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
      const response = await axiosPrivate.get('/incidents', {
        params: {
          status: ['pending', 'active'],
          ...(coordinates && {
            lat: coordinates[0],
            lng: coordinates[1],
            radius: 10000 // 10km radius
          })
        }
      });
      dispatch(setIncidents(response.data.incidents));
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
          <div className="text-center py-4 text-gray-500">No active incidents nearby</div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident._id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{incident.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{incident.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        incident.type === 'emergency'
                          ? 'bg-red-100 text-red-800'
                          : incident.type === 'medical'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {incident.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(incident.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {incident.status === 'pending' && (
                    <button
                      onClick={() => handleAcceptIncident(incident._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      <BellAlertIcon className="h-5 w-5" />
                      Respond
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ModeratorDashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Reports</h2>
      {/* Pending reports list will be added here */}
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Community Management</h3>
        {/* Community management interface will be added here */}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'responder':
        return <ResponderDashboard />;
      case 'moderator':
        return <ModeratorDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;
