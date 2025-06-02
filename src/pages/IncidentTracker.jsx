import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { axiosPrivate } from '../services/api';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BellAlertIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const statusIcons = {
  reported: BellAlertIcon,
  pending: ClockIcon,
  active: ArrowPathIcon,
  resolved: CheckCircleIcon,
  closed: XCircleIcon,
};

const statusColors = {
  reported: 'text-blue-500',
  pending: 'text-yellow-500',
  active: 'text-purple-500',
  resolved: 'text-green-500',
  closed: 'text-gray-500',
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-500 text-white',
};

const IncidentTracker = () => {
  const user = useSelector(selectCurrentUser);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const response = await axiosPrivate.get('/incidents', {
          params: { email: user.email }
        });
        setIncidents(response.data.incidents);
      } catch (error) {
        console.error('Error loading incidents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, [user.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Incidents</h1>

      {incidents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No incidents reported yet.
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => {
            const StatusIcon = statusIcons[incident.status] || ClockIcon;
            const statusColor = statusColors[incident.status] || 'text-gray-500';

            return (
              <div key={incident._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold">{incident.title}</h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[incident.priority]}`}>
                          {incident.priority}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {incident.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Reported on {new Date(incident.createdAt).toLocaleString()}
                      </p>
                      {incident.address?.formatted && (
                        <p className="text-sm text-gray-500">
                          Location: {incident.address.formatted}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center ${statusColor}`}>
                      <StatusIcon className="h-6 w-6 mr-2" />
                      <span className="capitalize font-medium">{incident.status}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">{incident.description}</p>

                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6 relative">
                      {incident.timeline?.map((event, index) => (
                        <div key={index} className="flex items-start ml-4">
                          <div className={`absolute left-0 p-1 bg-white rounded-full ${statusColors[event.status] || 'text-gray-400'}`}>
                            {React.createElement(statusIcons[event.status] || ClockIcon, { className: 'h-5 w-5' })}
                          </div>
                          <div className="ml-8">
                            <p className="font-medium">{event.message}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <time>{new Date(event.timestamp).toLocaleString()}</time>
                              {event.updatedBy && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center">
                                    <UserGroupIcon className="h-4 w-4 mr-1" />
                                    <span>{event.updatedBy.name}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Responders */}
                  {incident.assignedTo && incident.assignedTo.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="font-semibold mb-3">Assigned Responders</h3>
                      <div className="flex flex-wrap gap-4">
                        {incident.assignedTo.map((responder, index) => (
                          <div key={index} className="flex items-center bg-gray-50 rounded-lg p-3">
                            <UserGroupIcon className="h-5 w-5 text-gray-500 mr-2" />
                            <div>
                              <p className="font-medium">{responder.name}</p>
                              <p className="text-sm text-gray-500">{responder.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IncidentTracker;
