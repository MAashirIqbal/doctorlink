import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Public Pages
import Landing from '@/pages/public/Landing';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Patient Pages
import PatientDashboard from '@/pages/patient/PatientDashboard';
import DoctorSearch from '@/pages/patient/DoctorSearch';
import Booking from '@/pages/patient/Booking';
import Appointments from '@/pages/patient/Appointments';

// Doctor Pages
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import Profile from '@/pages/doctor/Profile';

// Public/Shared Profile Page
import DoctorProfile from '@/pages/public/DoctorProfile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />

              {/* Patient Routes */}
              <Route
                path="/patient/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctors"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <DoctorSearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book/:id"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/appointments"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Appointments />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/profile"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Landing />} />
            </Routes>

            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
