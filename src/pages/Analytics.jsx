import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { axiosPrivate } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    incidentsByType: [],
    incidentsByStatus: [],
    incidentsTrend: [],
    responseTimeAvg: [],
  });
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await axiosPrivate.get('/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-8">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Incidents by Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Incidents by Type</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={analytics.incidentsByType}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {analytics.incidentsByType.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Incidents by Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Incidents by Status</h3>
          <BarChart
            width={400}
            height={300}
            data={analytics.incidentsByStatus}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>

        {/* Incidents Trend */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Incidents Trend</h3>
          <LineChart
            width={800}
            height={300}
            data={analytics.incidentsTrend}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </div>

        {/* Response Time Analytics */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Average Response Time</h3>
          <BarChart
            width={800}
            height={300}
            data={analytics.responseTimeAvg}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="minutes" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
