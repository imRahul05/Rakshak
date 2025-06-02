import { useState } from 'react';
import { toast } from 'react-toastify';
import { axiosPrivate } from '../../services/api';

const IncidentReportForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'emergency',
    location: {
      type: 'Point',
      coordinates: [], // [longitude, latitude]
    },
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = async () => {
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        setFormData(prev => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          }
        }));
      }
    } catch (error) {
      toast.error('Could not get your location. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axiosPrivate.post('/incidents', formData);
      toast.success('Incident reported successfully!');
      setFormData({
        title: '',
        description: '',
        type: 'emergency',
        location: {
          type: 'Point',
          coordinates: [],
        },
        attachments: [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Incident Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
        >
          <option value="emergency">Emergency</option>
          <option value="medical">Medical</option>
          <option value="fire">Fire</option>
          <option value="security">Security</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={handleLocationSelect}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {formData.location.coordinates.length ? 'Location Selected' : 'Use My Location'}
        </button>
        {formData.location.coordinates.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Location coordinates: {formData.location.coordinates.join(', ')}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting || !formData.location.coordinates.length}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Submitting...' : 'Report Incident'}
        </button>
      </div>
    </form>
  );
};

export default IncidentReportForm;
