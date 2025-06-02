import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from './features/auth/authSlice';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import StaffRoute from './components/StaffRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import IncidentMap from './components/incidents/IncidentMap';
import ChatRoom from './components/chat/ChatRoom';
import Community from './pages/Community';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import IncidentTracker from './pages/IncidentTracker';

function App() {
  const user = useSelector(selectCurrentUser);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Community />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ChatRoom />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/me"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <IncidentTracker />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/map"
            element={
              <StaffRoute>
                <DashboardLayout>
                  <IncidentMap />
                </DashboardLayout>
              </StaffRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <StaffRoute>
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              </StaffRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
