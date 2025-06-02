import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { selectAllIncidents, setIncidents } from '../../features/incidents/incidentsSlice';
import { axiosPrivate } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  ArrowPathIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const ModeratorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pendingReports, setPendingReports] = useState([]);
  const [availableResponders, setAvailableResponders] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedResponders, setSelectedResponders] = useState([]);
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [expandedIncident, setExpandedIncident] = useState(null);
  
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  // Verify user has moderator role
  useEffect(() => {
    if (!user || user.role !== 'moderator') {
      toast.error('You do not have permission to access this dashboard');
      window.location.href = '/dashboard';
      return;
    }
    loadPendingReports();
    loadAvailableResponders();
  }, [user]);

  const loadPendingReports = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get('/incidents', {
        params: {
          status: 'pending'
        }
      });
      setPendingReports(response.data.incidents);
      toast.success('Reports loaded successfully');
    } catch (error) {
      console.error('Error loading pending reports:', error);
      toast.error('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableResponders = async () => {
    try {
      const response = await axiosPrivate.get('/responder/available');
      setAvailableResponders(response.data.responders);
      toast.success('Responders loaded successfully');
    } catch (error) {
      console.error('Error loading responders:', error);
      toast.error('Error loading responders');
    }
  };

  const handleAssignResponders = async () => {
    if (!selectedIncident) {
      toast.error('Please select an incident first');
      return;
    }
    
    if (!selectedResponders || selectedResponders.length === 0) {
      toast.error('Please select at least one responder');
      return;
    }
    
    // Verify user is a moderator
    if (!user || user.role !== 'moderator') {
      toast.error('You do not have permission to assign responders');
      return;
    }
    
    try {
      toast.loading('Assigning responders...');
      
      const response = await axiosPrivate.post(`/incidents/${selectedIncident._id}/assign`, {
        responders: selectedResponders
      });
      
      if (response.data) {
        toast.dismiss();
        toast.success(`Successfully assigned ${selectedResponders.length} responder${selectedResponders.length > 1 ? 's' : ''}`);
        setAssignmentModal(false);
        setSelectedIncident(null);
        setSelectedResponders([]);
        await loadPendingReports();
        await loadAvailableResponders(); // Refresh available responders list
      }
    } catch (error) {
      console.error('Error assigning responders:', error);
      toast.dismiss();
      
      // Display more specific error messages
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Failed to assign responders';
        switch (error.response.status) {
          case 400:
            toast.error(errorMessage);
            break;
          case 401:
            toast.error('Session expired. Please login again.');
            // Redirect to login
            window.location.href = '/login';
            break;
          case 403:
            toast.error('You do not have permission to assign responders');
            break;
          case 404:
            toast.error('Incident not found');
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error(errorMessage);
        }
      } else if (error.request) {
        toast.error('Server not responding. Please try again later.');
      } else {
        toast.error('Failed to assign responders');
      }
    }
  };

  const openAssignmentModal = (incident, e) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedIncident(incident);
    setSelectedResponders([]);
    setAssignmentModal(true);
  };

  const toggleResponderSelection = (responderId) => {
    setSelectedResponders(prev =>
      prev.includes(responderId)
        ? prev.filter(id => id !== responderId)
        : [...prev, responderId]
    );
  };

  const toggleIncidentDetails = (incidentId) => {
    setExpandedIncident(expandedIncident === incidentId ? null : incidentId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pending Reports</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Assign responders to incoming incidents
                </p>
              </div>
              <button
                onClick={loadPendingReports}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Refresh
              </button>
            </div>

            {/* Reports List */}
            {loading ? (
              <div className="text-center py-4">Loading reports...</div>
            ) : pendingReports.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No pending reports</div>
            ) : (
              <div className="space-y-4">
                {pendingReports.map((report) => (
                  <div
                    key={report._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => toggleIncidentDetails(report._id)}
                    >
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          {report.title}
                          {report.assignedTo?.length > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {report.assignedTo.length} Assigned
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : report.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {report.priority} Priority
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.type === 'emergency'
                              ? 'bg-red-100 text-red-800'
                              : report.type === 'medical'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.type}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {report.address?.formatted || 'Location not available'}
                          </span>
                          {expandedIncident === report._id ? 
                            <ChevronUpIcon className="h-4 w-4 text-gray-500" /> :
                            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                          }
                        </div>
                      </div>
                      <div className="ml-4">
                        {report.assignedTo?.length > 0 ? (
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg cursor-not-allowed opacity-75"
                            disabled
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                            Assigned
                          </button>
                        ) : (
                          <button
                            onClick={(e) => openAssignmentModal(report, e)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                          >
                            <UserGroupIcon className="h-5 w-5" />
                            Assign Responders
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedIncident === report._id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Reported by</p>
                            <p className="font-medium">{report.reportedBy?.name || 'Anonymous'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Contact</p>
                            {report.reportedBy?.phone ? (
                              <a href={`tel:${report.reportedBy.phone}`} className="font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                <PhoneIcon className="h-4 w-4" />
                                {report.reportedBy.phone}
                              </a>
                            ) : (
                              <p className="font-medium text-gray-400">Not available</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500">Reported at</p>
                            <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <p className="font-medium capitalize">{report.status}</p>
                          </div>
                          {report.location && (
                            <div className="col-span-2">
                              <p className="text-gray-500">Location</p>
                              <p className="font-medium flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4" />
                                {report.address?.formatted || `${report.location.coordinates[1]}, ${report.location.coordinates[0]}`}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {report.assignedTo?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-gray-500 mb-2">Assigned Responders</p>
                            <div className="grid grid-cols-2 gap-2">
                              {report.assignedTo.map((responder) => (
                                <div key={responder._id} 
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                                >
                                  <UserGroupIcon className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{responder.name}</p>
                                    {responder.phone && (
                                      <a href={`tel:${responder.phone}`} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                        <PhoneIcon className="h-3 w-3" />
                                        {responder.phone}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {!report.assignedTo?.length && (
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={(e) => openAssignmentModal(report, e)}
                              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                            >
                              <UserGroupIcon className="h-5 w-5" />
                              Assign Responders
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Responders Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Available Responders</h3>
            <div className="space-y-3">
              {availableResponders.map((responder) => (
                <div
                  key={responder._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{responder.name}</p>
                    <p className="text-sm text-gray-500">{responder.email}</p>
                    {responder.phone && (
                      <a href={`tel:${responder.phone}`} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1">
                        <PhoneIcon className="h-3 w-3" />
                        {responder.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {assignmentModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Assign Responders</h3>
                <p className="text-sm text-gray-500">
                  Select responders for: {selectedIncident.title}
                </p>
              </div>
              <button
                onClick={() => setAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {availableResponders.map((responder) => (
                <label
                  key={responder._id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedResponders.includes(responder._id)}
                      onChange={() => toggleResponderSelection(responder._id)}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium">{responder.name}</p>
                      <p className="text-sm text-gray-500">{responder.email}</p>
                      {responder.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {responder.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAssignmentModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignResponders}
                disabled={selectedResponders.length === 0}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Selected Responders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;
