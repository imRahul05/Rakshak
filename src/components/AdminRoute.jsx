import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

const AdminRoute = ({ children }) => {
  const user = useSelector(selectCurrentUser);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!['admin', 'moderator', 'responder'].includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
