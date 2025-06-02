import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import UserDashboard from '../components/dashboard/UserDashboard';
import ResponderDashboard from '../components/dashboard/ResponderDashboard';
import ModeratorDashboard from '../components/dashboard/ModeratorDashboard';

// Components are now imported from separate files

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

  return renderDashboard();
};

export default Dashboard;
