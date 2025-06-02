import IncidentReportForm from '../incidents/IncidentReportForm';

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

export default UserDashboard;
